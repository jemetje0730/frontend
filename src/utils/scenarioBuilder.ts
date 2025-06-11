export const buildScenarioJson = (nodes, edges) => {
  type NodeData = {
    id: string;
    type: string;
    data: any;
    action: any;
  };

  const scenario: NodeData[] = [];

  const visited = new Set();

  const traverse = (currentId) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const node = nodes.find((n) => n.id === currentId);
    if (!node) return;

    const outgoingEdges = edges.filter((e) => e.source === currentId);

    outgoingEdges.forEach((edge) => {
      scenario.push({
        id: node.id,
        type: node.type,
        data: node.data,
        action: edge.data.action,
      });
      traverse(edge.target);
    });

    if (outgoingEdges.length === 0) {
      scenario.push({
        id: node.id,
        type: node.type,
        data: node.data,
        action: null,
      });
    }
  };

  const startNode = nodes.find((n) => n.type === 'start');
  if (startNode) traverse(startNode.id);

  return JSON.stringify(scenario, null, 2);
};
