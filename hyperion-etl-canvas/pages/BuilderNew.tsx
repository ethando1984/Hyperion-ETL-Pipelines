import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import { ReactFlowCanvas } from '../components/builder/ReactFlowCanvas';
import { NodeLibraryPanel } from '../components/builder/NodeLibraryPanel';
import { useSearchParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';

const Builder: React.FC = () => {
    const [searchParams] = useSearchParams();
    const pipelineId = searchParams.get('id') || undefined;
    const [saveCount, setSaveCount] = useState(0);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <TopNav
                breadcrumbs={[
                    { label: 'Pipelines', href: '/dashboard' },
                    { label: pipelineId ? 'Edit Pipeline' : 'Create New Pipeline' }
                ]}
            />

            <div className="flex flex-1 overflow-hidden">
                <ReactFlowProvider>
                    <NodeLibraryPanel />
                    <ReactFlowCanvas
                        pipelineId={pipelineId}
                        onSave={() => setSaveCount(c => c + 1)}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default Builder;
