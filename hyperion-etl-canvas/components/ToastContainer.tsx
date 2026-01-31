import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './common/Icon';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    const getToastStyles = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200';
            default:
                return 'bg-gray-50 dark:bg-gray-800 border-gray-500 text-gray-800 dark:text-gray-200';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return 'check_circle';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'notifications';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-slide-in ${getToastStyles(toast.type)}`}
                >
                    <Icon name={getIcon(toast.type)} className="text-xl flex-shrink-0 mt-0.5" />
                    <p className="flex-1 text-sm font-medium">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    >
                        <Icon name="close" className="text-lg" />
                    </button>
                </div>
            ))}
        </div>
    );
};
