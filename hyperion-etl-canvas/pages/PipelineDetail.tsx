import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pipelineApi } from '../services/api';
import { Icon } from '../components/common/Icon';
import { Loader } from '../components/common/Loader';
import TopNav from '../components/TopNav';
import { getStatusColor } from '../utils/common';
import { useToast } from '../contexts/ToastContext';

export const PipelineDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [pipeline, setPipeline] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPipeline = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await pipelineApi.getById(id);
                setPipeline(data);
            } catch (err: any) {
                showError(err.response?.data?.message || 'Failed to load pipeline');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchPipeline();
    }, [id]);

    const handleActivate = async () => {
        try {
            await pipelineApi.activate(id!);
            success('Pipeline activated successfully');
            setPipeline({ ...pipeline, status: 'Running' });
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to activate pipeline');
        }
    };

    if (loading) return <Loader fullScreen label="Loading pipeline..." />;
    if (!pipeline) return null;

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <TopNav />
            <main className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <button onClick={() => navigate('/dashboard')} className="hover:text-primary-600">
                        Pipelines
                    </button>
                    <Icon name="chevron_right" className="text-sm" />
                    <span className="text-gray-900 dark:text-white font-medium">{pipeline.name}</span>
                </div>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pipeline.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{pipeline.description || 'No description'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pipeline.status)}`}>
                            {pipeline.status}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Pipeline ID</p>
                            <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">{pipeline.id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Domain</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{pipeline.domain || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Created</p>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                {pipeline.createdAt ? new Date(pipeline.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Last Updated</p>
                            <p className="text-sm text-gray-900 dark:text-white mt-1">
                                {pipeline.updatedAt ? new Date(pipeline.updatedAt).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => navigate(`/builder?id=${id}`)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2">
                            <Icon name="edit" />
                            Edit Pipeline
                        </button>
                        <button onClick={handleActivate} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
                            <Icon name="play_arrow" />
                            Activate
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2">
                            <Icon name="archive" />
                            Archive
                        </button>
                    </div>
                </div>

                {/* Graph Visualization Placeholder */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline Graph</h2>
                    <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="text-center">
                            <Icon name="device_hub" className="text-5xl text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">Graph visualization coming soon</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Use the builder to add nodes and edges</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PipelineDetail;
