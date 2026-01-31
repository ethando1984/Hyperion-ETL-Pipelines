import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Icon } from '../../common/Icon';
import { CustomNodeData } from './SourceNode';

export const TransformNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all min-w-[240px] ${selected ? 'border-primary-500 ring-4 ring-primary-200 dark:ring-primary-900' : 'border-gray-200 dark:border-gray-700'
            }`}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30`}>
                    <Icon name={data.icon} className={`text-xl ${data.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {data.label}
                    </h3>
                    {data.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{data.subtitle}</p>
                    )}
                </div>
                {data.configured && (
                    <Icon name="check_circle" className="text-green-500 text-lg flex-shrink-0" />
                )}
            </div>

            <div className="px-4 py-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                    <Icon name="transform" className="text-sm mr-1" />
                    Transform
                </span>
            </div>

            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-primary-500 !border-2 !border-white dark:!border-gray-800"
            />

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-primary-500 !border-2 !border-white dark:!border-gray-800"
            />
        </div>
    );
});

TransformNode.displayName = 'TransformNode';
