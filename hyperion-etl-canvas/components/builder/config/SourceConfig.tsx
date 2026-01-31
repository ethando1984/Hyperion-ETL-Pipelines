import React, { useState } from 'react';
import { Icon } from '../../../common/Icon';
import { useToast } from '../../../contexts/ToastContext';

interface SourceConfigProps {
    config: any;
    onChange: (config: any) => void;
    nodeData: any;
}

export const SourceConfig: React.FC<SourceConfigProps> = ({ config, onChange, nodeData }) => {
    const { success, error: showError } = useToast();
    const [testing, setTesting] = useState(false);

    const sourceType = config.sourceType || (nodeData?.label?.toLowerCase().includes('mysql') ? 'mysql' :
        nodeData?.label?.toLowerCase().includes('postgres') ? 'postgresql' :
            nodeData?.label?.toLowerCase().includes('api') ? 'api' : 'csv');

    const handleChange = (field: string, value: any) => {
        onChange({ ...config, sourceType, [field]: value });
    };

    const handleTestConnection = async () => {
        setTesting(true);
        // Simulate API call
        setTimeout(() => {
            setTesting(false);
            if (config.host && config.database) {
                success('Connection successful!');
            } else {
                showError('Missing required fields');
            }
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* MySQL/PostgreSQL Configuration */}
            {(sourceType === 'mysql' || sourceType === 'postgresql') && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Database Connection</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Host *
                                </label>
                                <input
                                    type="text"
                                    value={config.host || ''}
                                    onChange={(e) => handleChange('host', e.target.value)}
                                    placeholder="db.example.com"
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
                                        value={config.port || (sourceType === 'mysql' ? 3306 : 5432)}
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
                                        placeholder="mydb"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={config.username || ''}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    placeholder="user"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={config.password || ''}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Table/Query *
                                </label>
                                <textarea
                                    value={config.table || ''}
                                    onChange={(e) => handleChange('table', e.target.value)}
                                    placeholder="users&#10;or&#10;SELECT * FROM users WHERE active = true"
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">Table name or custom SQL query</p>
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

            {/* REST API Configuration */}
            {sourceType === 'api' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">API Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Base URL *
                                </label>
                                <input
                                    type="url"
                                    value={config.url || ''}
                                    onChange={(e) => handleChange('url', e.target.value)}
                                    placeholder="https://api.example.com/v1/data"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Method
                                </label>
                                <select
                                    value={config.method || 'GET'}
                                    onChange={(e) => handleChange('method', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Authentication
                                </label>
                                <select
                                    value={config.authType || 'none'}
                                    onChange={(e) => handleChange('authType', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="none">None</option>
                                    <option value="bearer">Bearer Token</option>
                                    <option value="apikey">API Key</option>
                                    <option value="basic">Basic Auth</option>
                                </select>
                            </div>

                            {config.authType === 'bearer' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Bearer Token
                                    </label>
                                    <input
                                        type="password"
                                        value={config.token || ''}
                                        onChange={(e) => handleChange('token', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            )}

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
                                        Test API
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* CSV Configuration */}
            {sourceType === 'csv' && (
                <>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">CSV Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    File Path *
                                </label>
                                <input
                                    type="text"
                                    value={config.filePath || ''}
                                    onChange={(e) => handleChange('filePath', e.target.value)}
                                    placeholder="/data/users.csv"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Delimiter
                                </label>
                                <select
                                    value={config.delimiter || ','}
                                    onChange={(e) => handleChange('delimiter', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value=",">Comma (,)</option>
                                    <option value="\t">Tab (\t)</option>
                                    <option value="|">Pipe (|)</option>
                                    <option value=";">Semicolon (;)</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="has-headers"
                                    type="checkbox"
                                    checked={config.hasHeaders !== false}
                                    onChange={(e) => handleChange('hasHeaders', e.target.checked)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="has-headers" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    File has header row
                                </label>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
