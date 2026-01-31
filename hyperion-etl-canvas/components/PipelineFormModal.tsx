import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';
import { useToast } from '../contexts/ToastContext';
import { pipelineApi } from '../services/api';
import { Icon } from './common/Icon';

interface PipelineFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    pipeline?: any; // Existing pipeline for edit mode
    onSuccess: () => void; // Callback to refresh data
}

export const PipelineFormModal: React.FC<PipelineFormModalProps> = ({
    isOpen,
    onClose,
    pipeline,
    onSuccess
}) => {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        domain: '',
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditMode = !!pipeline;

    // Populate form when editing
    useEffect(() => {
        if (pipeline) {
            setFormData({
                domain: pipeline.domain || '',
                name: pipeline.name || '',
                description: pipeline.description || ''
            });
        } else {
            setFormData({ domain: '', name: '', description: '' });
        }
        setErrors({});
    }, [pipeline, isOpen]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.domain.trim()) {
            newErrors.domain = 'Domain is required';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Name must be less than 100 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await pipelineApi.update(pipeline.id, formData);
                success(`Pipeline "${formData.name}" updated successfully`);
            } else {
                await pipelineApi.create(formData);
                success(`Pipeline "${formData.name}" created successfully`);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            error(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} pipeline`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            title={
                <>
                    <Icon name={isEditMode ? 'edit' : 'add_circle'} />
                    {isEditMode ? 'Edit Pipeline' : 'Create New Pipeline'}
                </>
            }
            onClose={onClose}
            maxWidth="max-w-lg"
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
                        type="submit"
                        form="pipeline-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Icon name="refresh" className="animate-spin" />}
                        {isEditMode ? 'Save Changes' : 'Create Pipeline'}
                    </button>
                </>
            }
        >
            <form id="pipeline-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Domain Field */}
                <div>
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Domain <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => handleChange('domain', e.target.value)}
                        placeholder="e.g., analytics, finance, sales"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.domain ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={loading}
                    />
                    {errors.domain && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <Icon name="error" className="text-sm" />
                            {errors.domain}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Category or business domain for this pipeline
                    </p>
                </div>

                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pipeline Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Customer Data Sync"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={loading}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <Icon name="error" className="text-sm" />
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Description Field */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="What does this pipeline do?"
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={loading}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <Icon name="error" className="text-sm" />
                            {errors.description}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formData.description.length}/500 characters
                    </p>
                </div>
            </form>
        </Modal>
    );
};
