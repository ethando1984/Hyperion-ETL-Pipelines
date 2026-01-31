import React from 'react';
import { Icon } from '../../../common/Icon';

interface TransformConfigProps {
    config: any;
    onChange: (config: any) => void;
    nodeData: any;
}

export const TransformConfig: React.FC<TransformConfigProps> = ({ config, onChange, nodeData }) => {
    const transformType = config.transformType || (nodeData?.label?.toLowerCase().includes('filter') ? 'filter' :
        nodeData?.label?.toLowerCase().includes('join') ? 'join' :
            nodeData?.label?.toLowerCase().includes('aggregate') ? 'aggregate' : 'map');

    const handleChange = (field: string, value: any) => {
        onChange({ ...config, transformType, [field]: value });
    };

    return (
        <div className="space-y-6">
            {/* Filter Configuration */}
            {transformType === 'filter' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Filter Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mode
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleChange('mode', 'sql')}
                                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${(config.mode || 'sql') === 'sql'
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        SQL Expression
                                    </button>
                                    <button
                                        onClick={() => handleChange('mode', 'visual')}
                                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${config.mode === 'visual'
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        Visual Builder
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        WHERE Clause *
                                    </label>
                                    <span className="text-xs text-gray-500">SQL</span>
                                </div>
                                <textarea
                                    value={config.condition || ''}
                                    onChange={(e) => handleChange('condition', e.target.value)}
                                    placeholder="status = 'active'&#10;AND created_at > '2024-01-01'&#10;AND revenue > 1000"
                                    rows={6}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">Enter SQL WHERE clause (without WHERE keyword)</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Map Configuration */}
            {transformType === 'map' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Map/Transform Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Column Mappings
                                    </label>
                                    <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                        <Icon name="add" className="text-sm" />
                                        Add Mapping
                                    </button>
                                </div>

                                <textarea
                                    value={config.mappings || ''}
                                    onChange={(e) => handleChange('mappings', e.target.value)}
                                    placeholder="firstName AS first_name&#10;lastName AS last_name&#10;UPPER(email) AS email_upper&#10;price * 1.1 AS price_with_tax"
                                    rows={8}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter one mapping per line: expression AS column_name
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Join Configuration */}
            {transformType === 'join' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Join Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Join Type *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['INNER', 'LEFT', 'RIGHT', 'FULL'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleChange('joinType', type)}
                                            className={`px-3 py-2 text-sm rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${(config.joinType || 'INNER') === type
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            <Icon name={`join_${type.toLowerCase()}`} />
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Left Key *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.leftKey || ''}
                                        onChange={(e) => handleChange('leftKey', e.target.value)}
                                        placeholder="user_id"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Right Key *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.rightKey || ''}
                                        onChange={(e) => handleChange('rightKey', e.target.value)}
                                        placeholder="id"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Additional Conditions (Optional)
                                </label>
                                <textarea
                                    value={config.additionalConditions || ''}
                                    onChange={(e) => handleChange('additionalConditions', e.target.value)}
                                    placeholder="AND left.created_at > right.created_at"
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Aggregate Configuration */}
            {transformType === 'aggregate' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Aggregate Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    GROUP BY Columns *
                                </label>
                                <input
                                    type="text"
                                    value={config.groupBy || ''}
                                    onChange={(e) => handleChange('groupBy', e.target.value)}
                                    placeholder="customer_id, product_category"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">Comma-separated column names</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Aggregations *
                                </label>
                                <textarea
                                    value={config.aggregations || ''}
                                    onChange={(e) => handleChange('aggregations', e.target.value)}
                                    placeholder="SUM(revenue) AS total_revenue&#10;AVG(price) AS avg_price&#10;COUNT(*) AS order_count&#10;MAX(created_at) AS last_order_date"
                                    rows={6}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter one aggregation per line: FUNCTION(column) AS alias
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    HAVING Clause (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={config.having || ''}
                                    onChange={(e) => handleChange('having', e.target.value)}
                                    placeholder="total_revenue > 10000"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
