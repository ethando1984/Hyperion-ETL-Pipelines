import React, { useState } from 'react';
import { Icon } from '../../../common/Icon';
import { useToast } from '../../../contexts/ToastContext';

interface DestinationConfigProps {
    config: any;
    onChange: (config: any) => void;
    nodeData: any;
}

export const DestinationConfig: React.FC<DestinationConfigProps> = ({ config, onChange, nodeData }) => {
    const { success, error: showError } = useToast();
    const [testing, setTesting] = useState(false);

    const destType = config.destinationType || (nodeData?.label?.toLowerCase().includes('bigquery') ? 'bigquery' :
        nodeData?.label?.toLowerCase().includes('snowflake') ? 'snowflake' : 'postgresql');

    const handleChange = (field: string, value: any) => {
        onChange({ ...config, destinationType: destType, [field]: value });
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTimeout(() => {
            setTesting(false);
            success('Connection successful!');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* BigQuery Configuration */}
            {destType === 'bigquery' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">BigQuery Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Project ID *
                                </label>
                                <input
                                    type="text"
                                    value={config.projectId || ''}
                                    onChange={(e) => handleChange('projectId', e.target.value)}
                                    placeholder="my-gcp-project"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Dataset *
                                </label>
                                <input
                                    type="text"
                                    value={config.dataset || ''}
                                    onChange={(e) => handleChange('dataset', e.target.value)}
                                    placeholder="analytics"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Table *
                                </label>
                                <input
                                    type="text"
                                    value={config.table || ''}
                                    onChange={(e) => handleChange('table', e.target.value)}
                                    placeholder="users"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Write Mode *
                                </label>
                                <select
                                    value={config.writeMode || 'APPEND'}
                                    onChange={(e) => handleChange('writeMode', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="APPEND">Append (add to existing)</option>
                                    <option value="REPLACE">Replace (truncate and insert)</option>
                                    <option value="MERGE">Merge (upsert)</option>
                                </select>
                            </div>

                            {config.writeMode === 'MERGE' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Merge Key(s)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.mergeKeys || ''}
                                        onChange={(e) => handleChange('mergeKeys', e.target.value)}
                                        placeholder="id, email"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Comma-separated unique key columns</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Partition Column (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={config.partitionColumn || ''}
                                    onChange={(e) => handleChange('partitionColumn', e.target.value)}
                                    placeholder="created_date"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleTestConnection}
                                disabled={testing}
                                className="w-full px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {testing ? (
                                    <>
                                        <Icon name="refresh" className="animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="cable" />
                                        Test Connection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Snowflake Configuration */}
            {destType === 'snowflake' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Snowflake Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Account *
                                </label>
                                <input
                                    type="text"
                                    value={config.account || ''}
                                    onChange={(e) => handleChange('account', e.target.value)}
                                    placeholder="xy12345.us-east-1"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Warehouse *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.warehouse || ''}
                                        onChange={(e) => handleChange('warehouse', e.target.value)}
                                        placeholder="COMPUTE_WH"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Database *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.database || ''}
                                        onChange={(e) => handleChange('database', e.target.value)}
                                        placeholder="ANALYTICS"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Schema *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.schema || ''}
                                        onChange={(e) => handleChange('schema', e.target.value)}
                                        placeholder="PUBLIC"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Table *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.table || ''}
                                        onChange={(e) => handleChange('table', e.target.value)}
                                        placeholder="USERS"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Write Mode *
                                </label>
                                <select
                                    value={config.writeMode || 'APPEND'}
                                    onChange={(e) => handleChange('writeMode', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="APPEND">Append</option>
                                    <option value="REPLACE">Replace</option>
                                    <option value="MERGE">Merge</option>
                                </select>
                            </div>

                            <button
                                onClick={handleTestConnection}
                                disabled={testing}
                                className="w-full px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {testing ? (
                                    <>
                                        <Icon name="refresh" className="animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="cable" />
                                        Test Connection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* PostgreSQL Destination */}
            {destType === 'postgresql' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">PostgreSQL Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Host *
                                </label>
                                <input
                                    type="text"
                                    value={config.host || ''}
                                    onChange={(e) => handleChange('host', e.target.value)}
                                    placeholder="warehouse-db.example.com"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Port *
                                    </label>
                                    <input
                                        type="number"
                                        value={config.port || 5432}
                                        onChange={(e) => handleChange('port', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Database *
                                    </label>
                                    <input
                                        type="text"
                                        value={config.database || ''}
                                        onChange={(e) => handleChange('database', e.target.value)}
                                        placeholder="warehouse"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Table *
                                </label>
                                <input
                                    type="text"
                                    value={config.table || ''}
                                    onChange={(e) => handleChange('table', e.target.value)}
                                    placeholder="users"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Write Mode *
                                </label>
                                <select
                                    value={config.writeMode || 'APPEND'}
                                    onChange={(e) => handleChange('writeMode', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="APPEND">Append</option>
                                    <option value="REPLACE">Replace</option>
                                    <option value="UPSERT">Upsert</option>
                                </select>
                            </div>

                            <button
                                onClick={handleTestConnection}
                                disabled={testing}
                                className="w-full px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {testing ? (
                                    <>
                                        <Icon name="refresh" className="animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="cable" />
                                        Test Connection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
