import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Icon } from '../../common/Icon';
import { SourceConfig } from './config/SourceConfig';
import { TransformConfig } from './config/TransformConfig';
import { DestinationConfig } from './config/DestinationConfig';

interface ConfigPanelProps {
    selectedNode: Node | null;
    onClose: () => void;
    onSave: (nodeId: string, config: any) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ selectedNode, onClose, onSave }) => {
    const [config, setConfig] = useState<any>(selectedNode?.data?.config || {});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (selectedNode) {
            setConfig(selectedNode.data?.config || {});
            setHasChanges(false);
        }
    }, [selectedNode?.id]);

    if (!selectedNode) return null;

    const handleSave = () => {
        onSave(selectedNode.id, config);
        setHasChanges(false);
    };

    const handleConfigChange = (newConfig: any) => {
        setConfig(newConfig);
        setHasChanges(true);
    };

    const nodeType = selectedNode.type || 'source';
    const isSource = nodeType === 'source';
    const isTransform = nodeType === 'transform';
    const isDestination = nodeType === 'destination';

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSource ? 'bg-blue-50 dark:bg-blue-900/30' :
                                isTransform ? 'bg-purple-50 dark:bg-purple-900/30' :
                                    'bg-green-50 dark:bg-green-900/30'
                            }`}>
                            <Icon name={selectedNode.data?.icon || 'settings'} className={`text-xl ${selectedNode.data?.iconColor || 'text-gray-600'}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedNode.data?.label || 'Configure Node'}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                {nodeType}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Icon name="close" className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isSource && <SourceConfig config={config} onChange={handleConfigChange} nodeData={selectedNode.data} />}
                    {isTransform && <TransformConfig config={config} onChange={handleConfigChange} nodeData={selectedNode.data} />}
                    {isDestination && <DestinationConfig config={config} onChange={handleConfigChange} nodeData={selectedNode.data} />}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {hasChanges && (
                            <span className="flex items-center gap-1 text-amber-600">
                                <Icon name="info" className="text-sm" />
                                Unsaved changes
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Icon name="save" />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
        </>
    );
};
