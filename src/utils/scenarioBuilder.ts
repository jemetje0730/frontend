type ScenarioStep = {
  key: string;
  action: string | null;
  target: string;
  wait: number;
  position?: string;
};

export const buildScenarioJson = (nodes, edges) => {
  const visited = new Set<string>();
  const scenario: ScenarioStep[] = [];

  const traverse = (currentId: string) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const node = nodes.find((n) => n.id === currentId);
    if (!node) return;

    const outgoingEdges = edges.filter((e) => e.source === currentId);

    outgoingEdges.forEach((edge) => {
      const step: ScenarioStep = {
        key: node.type === "screenNode" ? "R" : "A",
        action: edge.data?.action || "click",
        target:
          node.type === "imageNode"
            ? node.data?.src
            : node.data?.value || node.data?.label || "unknown",
        wait: node.data?.wait || 0.5,
        position: formatPosition(edge.data?.position),
      };
      scenario.push(step);
      traverse(edge.target);
    });

    if (outgoingEdges.length === 0) {
      scenario.push({
        key: node.type === "screenNode" ? "R" : "A",
        action: null,
        target:
          node.type === "imageNode"
            ? node.data?.src
            : node.data?.value || node.data?.label || "unknown",
        wait: node.data?.wait || 0.5,
      });
    }
  };

  const startNode = nodes.find((n) => n.type === "start");
  if (startNode) traverse(startNode.id);
  else if (nodes.length > 0) traverse(nodes[0].id); // fallback

  return JSON.stringify({ scenario }, null, 2);
};

const formatPosition = (pos: any): string | undefined => {
  if (typeof pos === "string") return pos;
  if (Array.isArray(pos) && pos.length === 2) return `${pos[0]},${pos[1]}`;
  return undefined;
};
