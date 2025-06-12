import type { Node, Edge } from "reactflow";

type Step = {
  key: string;
  action?: string;
  target?: string;
  position?: string | number[];
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

      if (edge.data?.action) {
        let pos = edge.data.position ?? "center";
        if (Array.isArray(pos)) {
          pos = pos.join(",");
        }

        // 이미지 파일명 추출
        let target = "";
        if (targetNode?.type === "imageNode") {
          const fullUrl = targetNode.data?.imageUrl ?? "";
          target = fullUrl.split("/").pop() ?? ""; // 마지막 경로 조각만 사용
        } else {
          target = targetNode?.data?.src ?? "";
        }

        const step: Step = {
          key: "A",
          action: edge.data.action,
          position: pos,
          target,
        };

        if (edge.data.action === "next") {
          delete step.position;
          delete step.target;
        }

        steps.push(step);
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
