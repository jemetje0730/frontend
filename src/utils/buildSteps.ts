import type { Node, Edge } from "reactflow";

type Step = {
  key: string;
  action?: string;
  target?: string;
  position?: string | number[];
  wait?: number;
};

export function buildSteps(nodes: Node[], edges: Edge[]): Step[] {
  const steps: Step[] = [];
  const visited = new Set<string>();

  const findStartNode = () =>
    nodes.find((n) => !edges.some((e) => e.target === n.id));

  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // 노드 step을 먼저 추가
    if (node.type === "keyboardNode") {
      steps.push({
        key: "A",
        action: node.data?.type,
        target: node.data?.value,
      });
    } else if (node.type === "screenNode") {
      steps.push({ key: "R" });
    }

    const outgoing = edges.filter((e) => e.source === nodeId);

    for (const edge of outgoing) {
      const targetNode = nodes.find((n) => n.id === edge.target);

      // waitNode 처리 (병합)
      if (targetNode?.type === "waitNode") {
        const wait = targetNode.data?.wait ?? 0.5;
        if (steps.length > 0) {
          const last = steps[steps.length - 1];
          last.wait = wait;
        }
        dfs(edge.target);
        continue;
      }

      if (edge.data?.action) {
        let pos = edge.data.position ?? "center";
        if (Array.isArray(pos)) pos = pos.join(",");

        let target = "";
        if (targetNode?.type === "imageNode") {
          const fullUrl = targetNode.data?.imageUrl ?? "";
          target = fullUrl.split("/").pop() ?? "";
        } else {
          target = targetNode?.data?.src ?? "";
        }

        const edgeStep: Step = {
          key: "A",
          action: edge.data.action,
          position: pos,
          target,
        };

        if (edge.data.action === "next") {
          delete edgeStep.position;
          delete edgeStep.target;
        }

        steps.push(edgeStep);
      }

      dfs(edge.target);
    }
  };

  const startNode = findStartNode();
  if (startNode) {
    dfs(startNode.id);
  }

  return steps;
}

