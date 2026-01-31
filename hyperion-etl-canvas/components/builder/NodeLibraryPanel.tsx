import React from 'react';
import { Icon } from '../common/Icon';

const nodeLibraryItems = [
    {
        category: 'Sources',
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        nodes: [
            { id: 'mysql', label: 'MySQL', icon: 'storage', type: 'source', iconColor: 'text-blue-600' },
            { id: 'postgres', label: 'PostgreSQL', icon: 'dns', type: 'source', iconColor: 'text-blue-600' },
            { id: 'api', label: 'REST API', icon: 'api', type: 'source', iconColor: 'text-blue-600' },
            { id: 'csv', label: 'CSV File', icon: 'description', type: 'source', iconColor: 'text-blue-600' },
        ],
    },
    {
        category: 'Transforms',
        color: 'text-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        nodes: [
            { id: 'filter', label: 'Filter', icon: 'filter_alt', type: 'transform', iconColor: 'text-purple-600' },
            { id: 'map', label: 'Map', icon: 'map', type: 'transform', iconColor: 'text-purple-600' },
            { id: 'join', label: 'Join', icon: 'join_inner', type: 'transform', iconColor: 'text-purple-600' },
            { id: 'aggregate', label: 'Aggregate', icon: 'functions', type: 'transform', iconColor: 'text-purple-600' },
        ],
    },
    {
        category: 'Destinations',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/30',
        nodes: [
            { id: 'bigquery', label: 'BigQuery', icon: 'table_chart', type: 'destination', iconColor: 'text-green-600' },
            { id: 'snowflake', label: 'Snowflake', icon: 'ac_unit', type: 'destination', iconColor: 'text-green-600' },
            { id: 'postgres-dest', label: 'PostgreSQL', icon: 'dns', type: 'destination', iconColor: 'text-green-600' },
        ],
    },
];

export const NodeLibraryPanel: React.FC = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, icon: string, iconColor: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('label', label);
        event.dataTransfer.setData('icon', icon);
        event.dataTransfer.setData('iconColor', iconColor);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Icon name="widgets" />
                Node Library
            </h2>

            {nodeLibraryItems.map((category) => (
                <div key={category.category} className="mb-6">
                    <h3 className={`text-sm font-semibold ${category.color} mb-2 uppercase tracking-wide`}>
                        {category.category}
                    </h3>
                    <div className="space-y-2">
                        {category.nodes.map((node) => (
                            <div
                                key={node.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, node.type, node.label, node.icon, node.iconColor)}
                                className={`${category.bg} p-3 rounded-lg cursor-move hover:shadow-md transition-all border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700`}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon name={node.icon} className={`text-lg ${node.iconColor}`} />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {node.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    <Icon name="info" className="inline text-sm mr-1" />
                    Drag nodes to the canvas to build your pipeline
                </p>
            </div>
        </div>
    );
};
