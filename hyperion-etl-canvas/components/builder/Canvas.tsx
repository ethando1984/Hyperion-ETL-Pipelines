
import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { NodeType } from '../../pages/Builder';
import { api } from '../../api';

// Sub-components & Types
import { NodeData, EdgeData, ViewState, AISuggestion, AIInsight } from './canvas/types';
import { getSmartEdgePath } from './canvas/utils';
import { CanvasNode } from './canvas/CanvasNode';
import { CanvasControls } from './canvas/CanvasControls';
import { CanvasContextMenu } from './canvas/CanvasContextMenu';
import { AiSuggestionsList, AiInsightBanner, AiCommandBar } from './canvas/CanvasAiComponents';

interface CanvasProps {
  onNodeSelect: (id: string, type: NodeType) => void;
  selectedNodeId: string;
  onRunTest?: () => void;
  onSave?: () => void;
  triggerAction?: string | null;
}

export const Canvas: React.FC<CanvasProps> = memo(({ onNodeSelect, selectedNodeId, triggerAction }) => {
  // --- State ---
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // AI State
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [activeInsight, setActiveInsight] = useState<AIInsight | null>(null);
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);

  // Measurements
  const [nodeDimensions, setNodeDimensions] = useState<Record<string, { w: number, h: number }>>({});
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const nodeElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Data
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: 'node-source-1',
      type: 'source',
      x: 100,
      y: 200,
      title: 'PostgreSQL PROD',
      subtitle: 'Table: public.users',
      icon: 'dns',
      iconColor: 'text-blue-600',
      status: 'ok'
    },
    {
      id: 'node-join-1',
      type: 'join',
      x: 500,
      y: 200,
      title: 'Join Sales & Users',
      icon: 'join_inner',
      iconColor: 'text-purple-600',
      status: 'ok',
      config: (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full uppercase font-bold">INNER JOIN</span>
          </div>
          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
            ON users.id = sales.user_id
          </div>
        </div>
      )
    },
    {
      id: 'node-filter-1',
      type: 'filter',
      x: 900,
      y: 200,
      title: 'Active Users Filter',
      icon: 'filter_alt',
      iconColor: 'text-pink-600',
      status: 'warning',
      config: (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] rounded-full uppercase font-bold">SQL</span>
          </div>
          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
            WHERE status = 'active'
          </div>
        </div>
      )
    },
    {
      id: 'node-dest-1',
      type: 'dest',
      x: 1300,
      y: 200,
      title: 'BigQuery Data Warehouse',
      subtitle: 'Dataset: core_analytics',
      icon: 'table_chart',
      iconColor: 'text-green-600',
      status: 'ok'
    }
  ]);

  const [edges, setEdges] = useState<EdgeData[]>([
    { id: 'e1', source: 'node-source-1', target: 'node-join-1' },
    { id: 'e2', source: 'node-join-1', target: 'node-filter-1' },
    { id: 'e3', source: 'node-filter-1', target: 'node-dest-1' }
  ]);

  // --- External Actions ---
  useEffect(() => {
    if (triggerAction === 'save') handleSave();
    else if (triggerAction === 'run') handleRunTest();
  }, [triggerAction]);

  const handleSave = async () => {
    setIsProcessing(true);
    await api.builder.savePipeline('current-id', nodes, edges);
    setIsProcessing(false);
    alert('Pipeline Saved Successfully!');
  };

  const handleRunTest = async () => {
    setIsProcessing(true);
    const result = await api.builder.runTest('current-id');
    setIsProcessing(false);
    alert(result.success ? 'Test Run Successful:\n' + result.logs.join('\n') : 'Test Run Failed:\n' + result.logs.join('\n'));
  };

  // --- Event Listeners & Observers ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(true);
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    resizeObserver.current = new ResizeObserver((entries) => {
      setNodeDimensions((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        entries.forEach((entry) => {
          const nodeId = entry.target.getAttribute('data-node-id');
          if (nodeId) {
            const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
            const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
            if (!next[nodeId] || next[nodeId].h !== height || next[nodeId].w !== width) {
              next[nodeId] = { w: width, h: height };
              hasChanges = true;
            }
          }
        });
        return hasChanges ? next : prev;
      });
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      resizeObserver.current?.disconnect();
    };
  }, []);

  const measureNodeRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const id = node.getAttribute('data-node-id');
      if (id) {
        nodeElementsRef.current[id] = node;
        resizeObserver.current?.observe(node);
      }
    }
  }, []);

  // --- AI Logic ---
  const generateAiSuggestions = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setTimeout(() => {
      const newX = node.x + 300;
      const newY = node.y;
      let suggestions: AISuggestion[] = [];

      if (node.type === 'source') {
        suggestions = [
          {
            id: 'sugg-1',
            title: 'Filter Active Users',
            description: 'Filter based on status="active" to reduce data volume.',
            confidence: 95,
            type: 'filter',
            reason: 'Schema Hint: "status" field detected',
            nodeData: {
              id: 'ghost-1',
              type: 'filter',
              x: newX,
              y: newY - 60,
              title: 'Filter Active Users',
              icon: 'filter_alt',
              iconColor: 'text-pink-600',
              status: 'ok',
              isAiGenerated: true,
              aiLabel: 'Auto-Suggested',
              config: <div className="text-xs font-mono bg-gray-100 p-1 rounded">WHERE status = 'active'</div>
            }
          },
          {
            id: 'sugg-2',
            title: 'Join with Orders',
            description: 'Enrich user data with recent order history.',
            confidence: 82,
            type: 'join',
            reason: 'Common Pattern: Users often joined with Orders',
            nodeData: {
              id: 'ghost-2',
              type: 'join',
              x: newX,
              y: newY + 60,
              title: 'Join Orders',
              icon: 'join_inner',
              iconColor: 'text-purple-600',
              status: 'warning',
              isAiGenerated: true,
              aiLabel: 'Enrichment'
            }
          }
        ];
      } else if (node.type === 'join') {
        suggestions = [
          {
            id: 'sugg-3',
            title: 'Aggregate Revenue',
            description: 'Calculate total revenue per user.',
            confidence: 88,
            type: 'dest',
            reason: 'Optimization: Aggregation reduces row count',
            nodeData: {
              id: 'ghost-3',
              type: 'dest',
              x: newX,
              y: newY,
              title: 'Revenue Aggregation',
              icon: 'functions',
              iconColor: 'text-orange-600',
              status: 'ok',
              isAiGenerated: true,
              aiLabel: 'Aggregation'
            }
          }
        ];
      }
      setAiSuggestions(suggestions);
    }, 200);
  }, [nodes]);

  const applySuggestion = useCallback((suggestion: AISuggestion) => {
    const newNode = { ...suggestion.nodeData, id: `node-${Date.now()}` };
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: selectedNodeId,
      target: newNode.id
    };

    setNodes(prev => [...prev, newNode]);
    setEdges(prev => [...prev, newEdge]);
    setAiSuggestions([]);
    onNodeSelect(newNode.id, newNode.type);

    setTimeout(() => {
      if (Math.random() > 0.5) {
        setActiveInsight({
          id: 'opt-1',
          type: 'optimization',
          message: 'Performance Tip: Filter "Active Users" before Joining with "Orders" to reduce processing cost by ~40%.',
          actionLabel: 'Reorder Nodes',
          onAction: () => {
            alert("AI would reorder nodes here!");
            setActiveInsight(null);
          }
        });
      }
    }, 1000);
  }, [selectedNodeId, onNodeSelect]);

  const handleCommandSubmit = useCallback((text: string) => {
    setIsCommandBarOpen(false);

    const startX = (view.x * -5) + 100;
    const startY = (view.y * -5) + 100;

    const n1 = {
      id: `gen-${Date.now()}-1`,
      type: 'source' as NodeType,
      x: startX,
      y: startY,
      title: 'MySQL: Users',
      icon: 'storage',
      iconColor: 'text-blue-600',
      status: 'ok' as const,
      isAiGenerated: true,
      aiLabel: 'From Prompt'
    };
    const n2 = {
      id: `gen-${Date.now()}-2`,
      type: 'filter' as NodeType,
      x: startX + 300,
      y: startY,
      title: 'Filter: Last 30 Days',
      icon: 'filter_alt',
      iconColor: 'text-pink-600',
      status: 'ok' as const,
      isAiGenerated: true,
      config: <div className="text-xs font-mono bg-gray-100 p-1 rounded">created_at  NOW() - 30d</div>
    };
    const e1 = { id: `edge-${Date.now()}-1`, source: n1.id, target: n2.id };

    setNodes(prev => [...prev, n1, n2]);
    setEdges(prev => [...prev, e1]);
  }, [view]);

  // --- Interaction Handlers ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newZoom = Math.min(Math.max(view.zoom - e.deltaY * zoomSensitivity, 0.2), 3);
      setView(v => ({ ...v, zoom: newZoom }));
    }
  }, [view.zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    setContextMenu(null);
    if (e.target === containerRef.current) {
      onNodeSelect('', 'source');
      setAiSuggestions([]);
    }
  }, [isSpacePressed, onNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
    if (isDraggingNode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - view.x) / view.zoom;
      const y = (e.clientY - rect.top - view.y) / view.zoom;

      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      let finalX = newX;
      let finalY = newY;

      if (snapToGrid) {
        finalX = Math.round(newX / 20) * 20;
        finalY = Math.round(newY / 20) * 20;
      }
      setNodes(nds => nds.map(n => n.id === isDraggingNode ? { ...n, x: finalX, y: finalY } : n));
    }
  }, [isPanning, isDraggingNode, lastMousePos, view, dragOffset, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsDraggingNode(null);
  }, []);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: NodeData) => {
    e.stopPropagation();
    if (e.button === 0 && !isSpacePressed) {
      onNodeSelect(node.id, node.type);
      setIsDraggingNode(node.id);

      const target = e.currentTarget as HTMLDivElement;
      const rect = target.getBoundingClientRect();
      const offsetX = (e.clientX - rect.left) / view.zoom;
      const offsetY = (e.clientY - rect.top) / view.zoom;

      setDragOffset({ x: offsetX, y: offsetY });
      generateAiSuggestions(node.id);
    }
  }, [isSpacePressed, onNodeSelect, view.zoom, generateAiSuggestions]);

  const handleNodeSuggestion = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    generateAiSuggestions(nodeId);
  }, [generateAiSuggestions]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleContextMenuAction = useCallback(() => {
    if (selectedNodeId) generateAiSuggestions(selectedNodeId);
    else setIsCommandBarOpen(true);
    setContextMenu(null);
  }, [selectedNodeId, generateAiSuggestions]);

  return (
    <div
      className="flex-1 bg-gray-50 dark:bg-gray-900 relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-[100] bg-black/20 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
            <span className="text-sm font-semibold">Processing...</span>
          </div>
        </div>
      )}

      {/* Grid Background */}
      <div
        className="absolute inset-0 dot-pattern pointer-events-none opacity-50"
        style={{
          backgroundPosition: `${view.x}px ${view.y}px`,
          backgroundSize: `${20 * view.zoom}px ${20 * view.zoom}`,
        }}
      />

      <div
        ref={containerRef}
        className="absolute w-full h-full transform-gpu origin-top-left"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
        }}
      >
        <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#94A3B8" />
            </marker>
            <marker id="arrowhead-ghost" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" fillOpacity="0.5" />
            </marker>
          </defs>

          {edges.map(edge => (
            <path
              key={edge.id}
              d={getSmartEdgePath(edge.source, edge.target, nodes, aiSuggestions, nodeDimensions)}
              stroke="#94A3B8"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="transition-colors duration-200"
            />
          ))}

          {hoveredSuggestionId && selectedNodeId && (
            <path
              d={getSmartEdgePath(selectedNodeId, aiSuggestions.find(s => s.id === hoveredSuggestionId)?.nodeData.id || '', nodes, aiSuggestions, nodeDimensions)}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              markerEnd="url(#arrowhead-ghost)"
              className="opacity-60 animate-pulse"
            />
          )}
        </svg>

        {nodes.map(node => (
          <CanvasNode
            key={node.id}
            node={node}
            isDragging={isDraggingNode === node.id}
            isSelected={selectedNodeId === node.id}
            isPanning={isPanning}
            onMouseDown={handleNodeMouseDown}
            measureRef={measureNodeRef}
            onSuggestion={handleNodeSuggestion}
          />
        ))}

        {hoveredSuggestionId && (
          (() => {
            const suggestion = aiSuggestions.find(s => s.id === hoveredSuggestionId);
            if (!suggestion) return null;
            const node = suggestion.nodeData;
            return (
              <div
                className="absolute w-60 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-primary-400 z-10 opacity-70 pointer-events-none grayscale"
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                }}
              >
                <div className="px-4 py-3 border-b border-dashed border-gray-300 flex items-center gap-3">
                  <span className={`material-symbols-outlined text-lg ${node.iconColor}`}>{node.icon}</span>
                  <h3 className="text-sm font-semibold">{node.title}</h3>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500">Previewing...</p>
                </div>
              </div>
            );
          })()
        )}

        {/* AI Suggestions List Component */}
        <AiSuggestionsList
          suggestions={aiSuggestions}
          selectedNode={nodes.find(n => n.id === selectedNodeId)}
          onApply={applySuggestion}
          onHover={setHoveredSuggestionId}
        />
      </div>

      {activeInsight && (
        <AiInsightBanner
          insight={activeInsight}
          onDismiss={() => setActiveInsight(null)}
        />
      )}

      <AiCommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onSubmit={handleCommandSubmit}
      />

      <CanvasControls
        view={view}
        setView={setView}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        isCommandBarOpen={isCommandBarOpen}
        setIsCommandBarOpen={setIsCommandBarOpen}
      />

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedNodeId={selectedNodeId}
          onGenerateAi={handleContextMenuAction}
          onResetView={() => { setView({ x: 0, y: 0, zoom: 1 }); setContextMenu(null); }}
        />
      )}
    </div>
  );
});
