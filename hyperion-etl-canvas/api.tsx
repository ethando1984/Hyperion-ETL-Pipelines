

import { NodeType } from './pages/Builder';

// --- Types ---

export interface Pipeline {
  id: string;
  name: string;
  status: 'Success' | 'Error' | 'Running' | 'Paused';
  source: string;
  dest: string;
  lastRun: string;
  dataSize: string;
  nodes: any[]; // Storing raw node data for the builder
  edges: any[];
}

export interface DashboardStats {
  totalPipelines: number;
  runningNow: number;
  criticalErrors: number;
}

export interface DatabaseSchema {
  tableName: string;
  columns: { name: string; type: string; key?: boolean }[];
}

export interface PreviewRow {
  [key: string]: string | number;
}

// --- Mock Data Store ---

const MOCK_DB_SCHEMAS: Record<string, DatabaseSchema[]> = {
  'mysql': [
    {
      tableName: 'users',
      columns: [
        { name: 'id', type: 'INT', key: true },
        { name: 'email', type: 'VARCHAR(255)' },
        { name: 'full_name', type: 'VARCHAR(100)' },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'status', type: 'ENUM' }
      ]
    },
    {
      tableName: 'orders',
      columns: [
        { name: 'order_id', type: 'INT', key: true },
        { name: 'user_id', type: 'INT' },
        { name: 'amount', type: 'DECIMAL(10,2)' },
        { name: 'order_date', type: 'DATE' }
      ]
    }
  ],
  'postgres': [
    {
      tableName: 'analytics_events',
      columns: [
        { name: 'event_id', type: 'UUID', key: true },
        { name: 'session_id', type: 'VARCHAR' },
        { name: 'payload', type: 'JSONB' }
      ]
    }
  ]
};

const MOCK_PREVIEW_DATA: PreviewRow[] = [
  { id: 1001, amount: 1250.00, name: "Nguyen Van A", email: "vana.n@hyperion.com", status: "Active" },
  { id: 1002, amount: 3400.50, name: "Tran Thi B", email: "thib.t@hyperion.com", status: "Pending" },
  { id: 1003, amount: 980.00, name: "Le Van C", email: "vanc.l@hyperion.com", status: "Inactive" },
  { id: 1004, amount: 2100.00, name: "Pham Minh D", email: "minhd.p@hyperion.com", status: "Active" },
  { id: 1005, amount: 500.00, name: "Hoang T", email: "hoang.t@hyperion.com", status: "Active" },
];

let mockPipelines: Pipeline[] = [
  {
    id: 'etl-99283-live',
    name: 'Sync Sales to BigQuery',
    status: 'Success',
    source: 'Shopify',
    dest: 'BigQuery PROD',
    lastRun: '5 mins ago',
    dataSize: '1.2 GB',
    nodes: [],
    edges: []
  },
  {
    id: 'etl-7734-batch',
    name: 'Daily Customer Aggregation',
    status: 'Error',
    source: 'PostgreSQL',
    dest: 'Snowflake',
    lastRun: 'Failed: 12 mins ago',
    dataSize: 'Retry 2/3',
    nodes: [],
    edges: []
  },
  {
    id: 'etl-5511-mkt',
    name: 'Facebook Ads to Sheets',
    status: 'Running',
    source: 'FB Ads',
    dest: 'Google Sheets',
    lastRun: 'Processing: 30s',
    dataSize: 'Real-time',
    nodes: [],
    edges: []
  },
  {
    id: 'etl-1102-ops',
    name: 'ERP Inventory Sync',
    status: 'Paused',
    source: 'Oracle ERP',
    dest: 'Magento',
    lastRun: 'Yesterday 18:00',
    dataSize: 'Manual',
    nodes: [],
    edges: []
  }
];

// --- API Service ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      await delay(500);
      return {
        totalPipelines: mockPipelines.length,
        runningNow: mockPipelines.filter(p => p.status === 'Running').length,
        criticalErrors: mockPipelines.filter(p => p.status === 'Error').length,
      };
    },
    getPipelines: async (): Promise<Pipeline[]> => {
      await delay(800);
      return [...mockPipelines];
    }
  },

  builder: {
    getLibraryNodes: async () => {
      await delay(300);
      return {
        sources: [
          { name: 'MySQL', icon: 'storage', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
          { name: 'PostgreSQL', icon: 'dns', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
          { name: 'REST API', icon: 'api', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' }
        ],
        transforms: [
          { name: 'Filter', icon: 'filter_alt', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
          { name: 'Join', icon: 'join_inner', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
          { name: 'Map', icon: 'map', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
          { name: 'Aggregate', icon: 'functions', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' }
        ],
        destinations: [
          { name: 'BigQuery', icon: 'table_chart', color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
          { name: 'Snowflake', icon: 'ac_unit', color: 'text-green-600 bg-green-50 dark:bg-green-900/30' }
        ]
      };
    },

    savePipeline: async (pipelineId: string, nodes: any[], edges: any[]) => {
      await delay(1000);
      console.log(`[API] Saved pipeline ${pipelineId}`, { nodes, edges });
      return { success: true, timestamp: new Date().toISOString() };
    },

    runTest: async (pipelineId: string) => {
      await delay(2000); // Simulate processing time
      // Randomly succeed or fail
      const success = Math.random() > 0.3;
      return {
        success,
        logs: success 
          ? ['[INFO] Connecting to Source...', '[INFO] Extracted 500 rows', '[INFO] Transformation complete', '[SUCCESS] Data loaded to destination']
          : ['[INFO] Connecting to Source...', '[ERROR] Connection timeout detected at Node #2']
      };
    },

    getSchema: async (sourceType: 'mysql' | 'postgres' = 'mysql'): Promise<DatabaseSchema[]> => {
      await delay(600);
      return MOCK_DB_SCHEMAS[sourceType] || MOCK_DB_SCHEMAS['mysql'];
    },

    getDataPreview: async (nodeId: string, nodeType: NodeType): Promise<PreviewRow[]> => {
      await delay(800);
      // In a real app, we would query based on the node logic.
      // Here we just return mock data, maybe slightly modified based on type
      if (nodeType === 'filter') {
          return MOCK_PREVIEW_DATA.filter(r => (r.amount as number) > 1000);
      }
      return MOCK_PREVIEW_DATA;
    }
  }
};