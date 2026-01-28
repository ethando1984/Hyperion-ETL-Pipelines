
import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import { NodeLibrary } from '../components/builder/NodeLibrary';
import { Canvas } from '../components/builder/Canvas';
import { ConfigPanel } from '../components/builder/ConfigPanel';
import { DataPreview } from '../components/builder/DataPreview';

export type NodeType = 'join' | 'filter' | 'source' | 'dest';

const Builder: React.FC = () => {
  // Simple state to mimic selecting different nodes
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-join-1');
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('join');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [triggerAction, setTriggerAction] = useState<string | null>(null);

  // Helper to trigger action in canvas then reset
  const handleAction = (action: string) => {
      setTriggerAction(action);
      setTimeout(() => setTriggerAction(null), 100);
  };

  // Actions for the header
  const actions = (
    <>
      <button 
        onClick={() => setIsPreviewOpen(!isPreviewOpen)}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="material-symbols-outlined mr-1.5 text-lg text-primary-600">visibility</span>
        {isPreviewOpen ? 'Hide Data' : 'Preview Data'}
      </button>
      <button 
        onClick={() => handleAction('run')}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="material-symbols-outlined mr-1.5 text-lg">play_arrow</span>
        Test Run
      </button>
      <button 
        onClick={() => handleAction('save')}
        className="inline-flex items-center px-4 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        <span className="material-symbols-outlined mr-1.5 text-lg">publish</span>
        Publish
      </button>
    </>
  );

  const handleNodeClick = (id: string, type: NodeType) => {
    setSelectedNodeId(id);
    setSelectedNodeType(type);
    if (!isPreviewOpen) setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <TopNav 
        breadcrumbs={[
          { label: 'ETL Management', href: '/dashboard' },
          { label: 'Create New Flow' }
        ]}
        actions={actions}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <NodeLibrary />

        {/* Center Canvas */}
        <main className="flex-1 relative flex flex-col">
          <Canvas 
            onNodeSelect={handleNodeClick} 
            selectedNodeId={selectedNodeId}
            triggerAction={triggerAction}
          />
          
          {/* Bottom Preview Panel */}
          {isPreviewOpen && (
            <DataPreview 
              nodeType={selectedNodeType} 
              nodeId={selectedNodeId}
              onClose={() => setIsPreviewOpen(false)} 
            />
          )}
        </main>

        {/* Right Sidebar - Config */}
        <ConfigPanel 
          nodeId={selectedNodeId} 
          nodeType={selectedNodeType} 
          onClose={() => setSelectedNodeId('')}
        />
      </div>
    </div>
  );
};

export default Builder;
