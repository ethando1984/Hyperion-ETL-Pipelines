
import { EdgeData, NodeData, AISuggestion } from './types';

export const getSmartEdgePath = (
  sourceId: string, 
  targetId: string, 
  nodes: NodeData[], 
  aiSuggestions: AISuggestion[], 
  nodeDimensions: Record<string, { w: number, h: number }>
) => {
  const sourceNode = nodes.find(n => n.id === sourceId) || aiSuggestions.find(s => s.nodeData.id === sourceId)?.nodeData;
  const targetNode = nodes.find(n => n.id === targetId) || aiSuggestions.find(s => s.nodeData.id === targetId)?.nodeData;
  
  if (!sourceNode || !targetNode) return '';

  const sourceDims = nodeDimensions[sourceId] || { w: 240, h: 150 };
  const targetDims = nodeDimensions[targetId] || { w: 240, h: 150 };

  const sx = sourceNode.x + sourceDims.w - 30; 
  const sy = sourceNode.y + sourceDims.h / 2;
  
  const tx = targetNode.x - 2;
  const ty = targetNode.y + targetDims.h / 2;

  const deltaX = tx - sx;

  if (deltaX > 0) {
      const controlOffset = Math.max(deltaX * 0.5, 60);
      return `M ${sx} ${sy} C ${sx + controlOffset} ${sy}, ${tx - controlOffset} ${ty}, ${tx} ${ty}`;
  } 
  
  const xDist = Math.abs(deltaX);
  const loopOffset = Math.max(xDist * 0.8, 300);
  return `M ${sx} ${sy} C ${sx + loopOffset} ${sy}, ${tx - loopOffset} ${ty}, ${tx} ${ty}`;
};
