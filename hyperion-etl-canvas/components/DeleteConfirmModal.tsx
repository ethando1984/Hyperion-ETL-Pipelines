import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { useToast } from '../contexts/ToastContext';
import { pipelineApi } from '../services/api';
import { Icon } from './common/Icon';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    pipeline: any; // Pipeline to delete
    onSuccess: () => void; // Callback to refresh data
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    pipeline,
    onSuccess
}) => {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await pipelineApi.delete(pipeline.id);
            success(`Pipeline "${pipeline.name}" deleted successfully`);
            onSuccess();
            onClose();
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to delete pipeline');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !pipeline) return null;

    return (
        <Modal
            title={
                <>
                    <Icon name="delete" className="text-red-600" />
                    Delete Pipeline
                </>
            }
            onClose={onClose}
            maxWidth="max-w-md"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Icon name="refresh" className="animate-spin" />}
                        Delete Pipeline
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <Icon name="warning" className="text-2xl text-red-600" />
                    <div>
                        <p className="font-semibold text-red-900 dark:text-red-200">Warning: This action cannot be undone</p>
                        <p className="text-sm text-red-700 dark:text-red-300">All pipeline data will be permanently deleted.</p>
                    </div>
                </div>

                <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        Are you sure you want to delete the following pipeline?
                    </p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="font-semibold text-gray-900 dark:text-white">{pipeline.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {pipeline.id}</p>
                        {pipeline.domain && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Domain: {pipeline.domain}</p>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    This will delete the pipeline configuration, graph data, and all associated settings. Any ongoing executions will be stopped.
                </p>
            </div>
        </Modal>
    );
};
