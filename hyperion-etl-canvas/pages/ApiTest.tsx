import React, { useState } from 'react';
import { pipelineApi } from '../services/api';

interface TestResult {
    test: string;
    status: 'pending' | 'success' | 'error';
    message?: string;
    data?: any;
    headers?: Record<string, string>;
}

export const ApiTestPage: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);

    const updateResult = (test: string, status: TestResult['status'], message?: string, data?: any, headers?: any) => {
        setResults(prev => {
            const existing = prev.find(r => r.test === test);
            if (existing) {
                return prev.map(r => r.test === test ? { test, status, message, data, headers } : r);
            }
            return [...prev, { test, status, message, data, headers }];
        });
    };

    const runAllTests = async () => {
        setLoading(true);
        setResults([]);

        // Test 1: CORS Preflight (OPTIONS)
        updateResult('CORS Preflight', 'pending');
        try {
            const response = await fetch('http://localhost:8083/api/pipelines', {
                method: 'OPTIONS',
                headers: {
                    'Origin': window.location.origin,
                    'Access-Control-Request-Method': 'GET',
                },
            });

            const corsHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                if (key.toLowerCase().includes('access-control')) {
                    corsHeaders[key] = value;
                }
            });

            updateResult(
                'CORS Preflight',
                response.ok ? 'success' : 'error',
                `Status: ${response.status} ${response.statusText}`,
                null,
                corsHeaders
            );
        } catch (error: any) {
            updateResult('CORS Preflight', 'error', error.message);
        }

        // Test 2: GET /api/pipelines
        updateResult('GET Pipelines', 'pending');
        try {
            const pipelines = await pipelineApi.getAll();
            updateResult(
                'GET Pipelines',
                'success',
                `Found ${Array.isArray(pipelines) ? pipelines.length : 0} pipeline(s)`,
                pipelines
            );
        } catch (error: any) {
            updateResult(
                'GET Pipelines',
                'error',
                error.response?.data?.message || error.message
            );
        }

        // Test 3: POST /api/pipelines (Create)
        updateResult('POST Create Pipeline', 'pending');
        try {
            const newPipeline = await pipelineApi.create({
                domain: 'test',
                name: `API Test Pipeline ${new Date().toISOString()}`,
                description: 'Created from integration test page'
            });
            updateResult(
                'POST Create Pipeline',
                'success',
                `Created pipeline: ${newPipeline.id}`,
                newPipeline
            );

            // Test 4: GET /api/pipelines/:id (Get by ID)
            if (newPipeline?.id) {
                updateResult('GET Pipeline by ID', 'pending');
                try {
                    const pipeline = await pipelineApi.getById(newPipeline.id);
                    updateResult(
                        'GET Pipeline by ID',
                        'success',
                        `Retrieved pipeline: ${pipeline.name}`,
                        pipeline
                    );
                } catch (error: any) {
                    updateResult(
                        'GET Pipeline by ID',
                        'error',
                        error.response?.data?.message || error.message
                    );
                }
            }
        } catch (error: any) {
            updateResult(
                'POST Create Pipeline',
                'error',
                error.response?.data?.message || error.message
            );
        }

        // Test 5: Filter by domain
        updateResult('GET Filter by Domain', 'pending');
        try {
            const filtered = await pipelineApi.getAll('test');
            updateResult(
                'GET Filter by Domain',
                'success',
                `Found ${Array.isArray(filtered) ? filtered.length : 0} pipeline(s) in 'test' domain`,
                filtered
            );
        } catch (error: any) {
            updateResult(
                'GET Filter by Domain',
                'error',
                error.response?.data?.message || error.message
            );
        }

        setLoading(false);
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'success': return '✅';
            case 'error': return '❌';
        }
    };

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 dark:text-yellow-400';
            case 'success': return 'text-green-600 dark:text-green-400';
            case 'error': return 'text-red-600 dark:text-red-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Frontend-Backend Integration Test
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Testing API connectivity and CORS configuration
                    </p>

                    <div className="mb-6">
                        <button
                            onClick={runAllTests}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Running Tests...' : 'Run All Tests'}
                        </button>
                    </div>

                    {/* Test Results */}
                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold text-lg ${getStatusColor(result.status)}`}>
                                            {result.test}
                                        </h3>
                                        {result.message && (
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                {result.message}
                                            </p>
                                        )}

                                        {/* CORS Headers */}
                                        {result.headers && Object.keys(result.headers).length > 0 && (
                                            <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded p-3">
                                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                    CORS Headers
                                                </h4>
                                                <div className="space-y-1 text-xs font-mono">
                                                    {Object.entries(result.headers).map(([key, value]) => (
                                                        <div key={key} className="text-gray-600 dark:text-gray-400">
                                                            <span className="text-blue-600 dark:text-blue-400">{key}:</span> {value}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Response Data */}
                                        {result.data && (
                                            <details className="mt-3">
                                                <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                                    View Response Data
                                                </summary>
                                                <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {results.length === 0 && !loading && (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                                Click "Run All Tests" to start testing the API integration
                            </div>
                        )}
                    </div>

                    {/* Backend Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Configuration
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div><span className="font-medium">Backend URL:</span> http://localhost:8083/api</div>
                            <div><span className="font-medium">Frontend URL:</span> {window.location.origin}</div>
                            <div><span className="font-medium">Auth:</span> Disabled (Development Mode)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
