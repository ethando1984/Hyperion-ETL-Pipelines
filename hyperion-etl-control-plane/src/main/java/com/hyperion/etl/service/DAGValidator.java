package com.hyperion.etl.service;

import com.hyperion.etl.domain.NodeType;
import com.hyperion.etl.domain.PipelineEdge;
import com.hyperion.etl.domain.PipelineNode;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * DAG (Directed Acyclic Graph) Validator
 * 
 * Validates pipeline graph structure ensuring:
 * 1. No cycles in the graph
 * 2. At least one SOURCE and one SINK node
 * 3. Valid edge types (SOURCE→TRANSFORM, TRANSFORM→TRANSFORM/SINK)
 * 4. All nodes are reachable
 */
@Service
public class DAGValidator {

    /**
     * Validate complete pipeline graph
     */
    public ValidationResult validate(List<PipelineNode> nodes, List<PipelineEdge> edges) {
        if (nodes == null || nodes.isEmpty()) {
            return ValidationResult.error("Pipeline must have at least one node");
        }

        // Check for required node types
        var nodeTypeCount = nodes.stream()
                .collect(Collectors.groupingBy(PipelineNode::type, Collectors.counting()));

        if (!nodeTypeCount.containsKey(NodeType.SOURCE) || nodeTypeCount.get(NodeType.SOURCE) == 0) {
            return ValidationResult.error("Pipeline must have at least one SOURCE node");
        }

        if (!nodeTypeCount.containsKey(NodeType.SINK) || nodeTypeCount.get(NodeType.SINK) == 0) {
            return ValidationResult.error("Pipeline must have at least one SINK node");
        }

        // Build adjacency map
        Map<UUID, List<UUID>> adjacencyMap = buildAdjacencyMap(nodes, edges);
        Map<UUID, NodeType> nodeTypeMap = nodes.stream()
                .collect(Collectors.toMap(PipelineNode::id, PipelineNode::type));

        // Check for cycles
        ValidationResult cycleCheck = checkForCycles(adjacencyMap, nodeTypeMap);
        if (!cycleCheck.isValid()) {
            return cycleCheck;
        }

        // Validate edge compatibility
        ValidationResult edgeCheck = validateEdgeTypes(edges, nodeTypeMap);
        if (!edgeCheck.isValid()) {
            return edgeCheck;
        }

        return ValidationResult.success();
    }

    /**
     * Build adjacency map from edges
     */
    private Map<UUID, List<UUID>> buildAdjacencyMap(List<PipelineNode> nodes, List<PipelineEdge> edges) {
        Map<UUID, List<UUID>> adjacencyMap = new HashMap<>();

        // Initialize with all nodes
        for (PipelineNode node : nodes) {
            adjacencyMap.put(node.id(), new ArrayList<>());
        }

        // Add edges
        if (edges != null) {
            for (PipelineEdge edge : edges) {
                adjacencyMap.computeIfAbsent(edge.fromNodeId(), k -> new ArrayList<>())
                        .add(edge.toNodeId());
            }
        }

        return adjacencyMap;
    }

    /**
     * Detect cycles using DFS with color-based marking
     * WHITE = not visited, GRAY = in progress, BLACK = completed
     */
    private ValidationResult checkForCycles(
            Map<UUID, List<UUID>> adjacencyMap,
            Map<UUID, NodeType> nodeTypeMap) {
        Map<UUID, Color> colors = new HashMap<>();

        for (UUID nodeId : adjacencyMap.keySet()) {
            colors.put(nodeId, Color.WHITE);
        }

        for (UUID nodeId : adjacencyMap.keySet()) {
            if (colors.get(nodeId) == Color.WHITE) {
                if (hasCycleDFS(nodeId, adjacencyMap, colors)) {
                    return ValidationResult.error("Pipeline contains a cycle - DAG structure required");
                }
            }
        }

        return ValidationResult.success();
    }

    private boolean hasCycleDFS(
            UUID nodeId,
            Map<UUID, List<UUID>> adjacencyMap,
            Map<UUID, Color> colors) {
        colors.put(nodeId, Color.GRAY);

        for (UUID neighbor : adjacencyMap.get(nodeId)) {
            Color neighborColor = colors.get(neighbor);

            if (neighborColor == Color.GRAY) {
                // Back edge detected - cycle found
                return true;
            }

            if (neighborColor == Color.WHITE) {
                if (hasCycleDFS(neighbor, adjacencyMap, colors)) {
                    return true;
                }
            }
        }

        colors.put(nodeId, Color.BLACK);
        return false;
    }

    /**
     * Validate edge type compatibility
     */
    private ValidationResult validateEdgeTypes(
            List<PipelineEdge> edges,
            Map<UUID, NodeType> nodeTypeMap) {
        if (edges == null || edges.isEmpty()) {
            return ValidationResult.error("Pipeline must have at least one edge connecting nodes");
        }

        for (PipelineEdge edge : edges) {
            NodeType fromType = nodeTypeMap.get(edge.fromNodeId());
            NodeType toType = nodeTypeMap.get(edge.toNodeId());

            if (fromType == null || toType == null) {
                return ValidationResult.error("Edge references non-existent node");
            }

            // Validate allowed transitions
            boolean validTransition = switch (fromType) {
                case SOURCE -> toType == NodeType.TRANSFORM;
                case TRANSFORM -> toType == NodeType.TRANSFORM || toType == NodeType.SINK;
                case SINK -> false; // SINK cannot have outgoing edges
            };

            if (!validTransition) {
                return ValidationResult.error(
                        String.format("Invalid edge: %s → %s is not allowed", fromType, toType));
            }
        }

        return ValidationResult.success();
    }

    /**
     * Topological sort for execution ordering
     */
    public List<UUID> topologicalSort(List<PipelineNode> nodes, List<PipelineEdge> edges) {
        Map<UUID, List<UUID>> adjacencyMap = buildAdjacencyMap(nodes, edges);
        Map<UUID, Integer> inDegree = new HashMap<>();

        // Calculate in-degrees
        for (UUID nodeId : adjacencyMap.keySet()) {
            inDegree.put(nodeId, 0);
        }
        for (List<UUID> neighbors : adjacencyMap.values()) {
            for (UUID neighbor : neighbors) {
                inDegree.merge(neighbor, 1, Integer::sum);
            }
        }

        // Kahn's algorithm
        Queue<UUID> queue = new LinkedList<>();
        for (Map.Entry<UUID, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.offer(entry.getKey());
            }
        }

        List<UUID> sorted = new ArrayList<>();
        while (!queue.isEmpty()) {
            UUID current = queue.poll();
            sorted.add(current);

            for (UUID neighbor : adjacencyMap.get(current)) {
                int newInDegree = inDegree.get(neighbor) - 1;
                inDegree.put(neighbor, newInDegree);
                if (newInDegree == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        return sorted;
    }

    private enum Color {
        WHITE, GRAY, BLACK
    }

    /**
     * Validation result
     */
    public record ValidationResult(boolean isValid, String errorMessage) {

        public static ValidationResult success() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult error(String message) {
            return new ValidationResult(false, message);
        }
    }
}
