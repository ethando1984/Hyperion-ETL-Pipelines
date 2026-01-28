
import React from 'react';

export const getStatusColor = (status: string) => {
  switch(status) {
    case 'Success': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'Error': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    case 'Running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'Paused': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'ok': return 'bg-green-500 border-white dark:border-gray-800'; // Node status
    case 'warning': return 'bg-orange-400 border-white dark:border-gray-800'; // Node status
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPipelineIconInfo = (name: string) => {
  // Simple heuristic for icons based on pipeline name
  if (name.includes('Sales')) return { icon: 'sync_alt', bg: 'bg-indigo-50 text-indigo-600' };
  if (name.includes('Aggregation')) return { icon: 'transform', bg: 'bg-purple-50 text-purple-600' };
  if (name.includes('Facebook') || name.includes('Ads')) return { icon: 'campaign', bg: 'bg-orange-50 text-orange-600' };
  return { icon: 'inventory_2', bg: 'bg-teal-50 text-teal-600' };
};

export const formatDate = (dateString: string) => {
    // Placeholder for actual date formatting logic using Intl or date-fns
    return dateString; 
};
