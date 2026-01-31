import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Connection,
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SourceNode } from './nodes/SourceNode';
import { TransformNode } from './nodes/TransformNode';
import { DestinationNode } from './nodes/DestinationNode';
import { ConfigPanel } from './ConfigPanelNew';
import { useToast } from '../../contexts/ToastContext';
import { pipelineApi } from '../../services/api';
import { Icon } from '../common/Icon';

interface CanvasProps {
    pipelineId?: string;
    onSave?: () => void;
}

// Define custom node types
const nodeTypes = {
    source: SourceNode,
    transform: TransformNode,
    destination: DestinationNode,
};

export const ReactFlowCanvas: React.FC<CanvasProps> = ({ pipelineId, onSave }) => {
    const { success, error: showError } = useToast();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Load graph from backend
    useEffect(() => {
        const loadGraph = async () => {
            if (!pipelineId) return;

            try {
                setLoading(true);
                const graph = await pipelineApi.getGraph(pipelineId);

                // Convert backend nodes to ReactFlow format
                const flowNodes: Node[] = graph.nodes.map((n: any) => ({
                    id: n.id,
                    type: n.type || 'source',
                    position: { x: n.x || 0, y: n.y || 0 },
                    data: {
                        label: n.data?.label || n.name || 'Unnamed',
                        icon: n.data?.icon || 'hub',
                        iconColor: n.data?.iconColor || 'text-gray-600',
                        subtitle: n.data?.subtitle,
                        configured: n.data?.configured || false,
                        config: n.data?.config || {},
                    },
                }));

                const flowEdges: Edge[] = graph.edges.map((e: any) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { strokeWidth: 2 },
                }));

                setNodes(flowNodes);
                setEdges(flowEdges);
            } catch (err: any) {
                showError('Failed to load pipeline graph');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadGraph();
    }, [pipelineId]);

    // Handle node selection
    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    // Handle new connections
    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdge = {
                ...connection,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { strokeWidth: 2 },
            };
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    // Handle config save
    const handleConfigSave = useCallback((nodeId: string, config: any) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            config,
                            configured: true,
                        },
                    }
                    : node
            )
        );
        setSelectedNode(null);
        success('Node configuration saved');
    }, [setNodes, success]);

    // Handle drag from node library
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('label');
            const icon = event.dataTransfer.getData('icon');
            const iconColor = event.dataTransfer.getData('iconColor');

            if (!type) return;

            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };

            const newNode: Node = {
                id: `node_${Date.now()}`,
                type,
                position,
                data: { label, icon, iconColor, configured: false, config: {} },
            };

            setNodes((nds) => nds.concat(newNode));
            success(`Added ${label} node`);
        },
        [setNodes, success]
    );

    // Save graph to backend
    const handleSave = useCallback(async () => {
        if (!pipelineId) {
            showError('No pipeline ID provided');
            return;
        }

        try {
            setLoading(true);

            // Convert ReactFlow format to backend format
            const backendNodes = nodes.map(n => ({
                id: n.id,
                type: n.type,
                x: n.position.x,
                y: n.position.y,
                data: n.data,
            }));

            const backendEdges = edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
            }));

            await pipelineApi.syncGraph(pipelineId, {
                nodes: backendNodes,
                edges: backendEdges,
            });

            success('Pipeline graph saved successfully');
            onSave?.();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to save graph');
        } finally {
            setLoading(false);
        }
    }, [pipelineId, nodes, edges, success, showError, onSave]);

    // Validate DAG
    const handleValidate = useCallback(async () => {
        if (!pipelineId) {
            showError('No pipeline ID provided');
            return;
        }

        try {
            setLoading(true);
            await pipelineApi.validate(pipelineId);
            success('Pipeline validation passed');
        } catch (err: any) {
            showError(err.response?.data?.message || 'Validation failed');
        } finally {
            setLoading(false);
        }
    }, [pipelineId]);

    // Delete selected nodes/edges
    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
    }, [setNodes, setEdges]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.key === 'Delete' || event.key === 'Backspace') && !event.repeat) {
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete]);

    const defaultEdgeOptions = useMemo(
        () => ({
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2 },
        }),
        []
    );

    return (
        <div className="flex-1 relative">
            {loading && (
                <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl">
                        <Icon name="refresh" className="animate-spin text-2xl text-primary-600" />
                    </div>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                className="bg-gray-50 dark:bg-gray-900"
            >
                <Background gap={20} size={1} className="bg-gray-100 dark:bg-gray-800" />
                <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
                <MiniMap
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    nodeColor={(node) => {
                        if (node.type === 'source') return '#3b82f6';
                        if (node.type === 'transform') return '#a855f7';
                        return '#10b981';
                    }}
                />

                {/* Toolbar Panel */}
                <Panel position="top-right" className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={loading || !pipelineId}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <Icon name="save" />
                        Save
                    </button>
                    <button
                        onClick={handleValidate}
                        disabled={loading || !pipelineId}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <Icon name="check_circle" />
                        Validate
                    </button>
                    <button
                        onClick={() => {
                            setNodes([]);
                            setEdges([]);
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <Icon name="delete_sweep" />
                        Clear
                    </button>
                </Panel>

                {/* Info Panel */}
                <Panel position="bottom-left" className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div><span className="font-semibold">Nodes:</span> {nodes.length}</div>
                        <div><span className="font-semibold">Edges:</span> {edges.length}</div>
                        <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Del</kbd> Delete selected
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Config Panel */}
            <ConfigPanel
                selectedNode={selectedNode}
                onClose={() => setSelectedNode(null)}
                onSave={handleConfigSave}
            />
        </div>
    );
};
