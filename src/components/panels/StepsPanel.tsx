import React from "react";
import type { Node, Edge } from "reactflow";

interface Props {
  nodes: Node[];
  edges: Edge[];
}

const StepsPanel: React.FC<Props> = ({ nodes, edges }) => {
  const orderedSteps = React.useMemo(() => {
    const steps: string[] = [];
    const visited = new Set<string>();
    const edgeMap = new Map<string, string[]>();

    edges.forEach((edge) => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source)!.push(edge.target);
    });

    const findStartNode = () =>
      nodes.find((n) => !edges.some((e) => e.target === n.id));

    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (node.type === "imageNode") {
        steps.push(`${node.data.label || "이미지"}`);
      } else if (node.type === "keyboardNode") {
        const keyType = node.data?.type || "hotkey";
        const keyValue = node.data?.value || "";
        steps.push(`${keyType}: ${keyValue}`);
      } else if (node.type === "screenNode") {
        steps.push(`화면 비교`);
      }

      const outgoing = edges.filter((e) => e.source === nodeId);
      outgoing.forEach((edge) => {
        if (edge.data?.action && edge.data?.position) {
          const pos = Array.isArray(edge.data.position)
            ? `${edge.data.position[0]},${edge.data.position[1]}`
            : edge.data.position;
          steps.push(`${edge.data.action}: ${pos}`);
        } else if (edge.data?.action === "next") {
          steps.push(`next`);
        }

        dfs(edge.target);
      });
    };

    const startNode = findStartNode();
    if (startNode) {
      dfs(startNode.id);
    }

    return steps;
  }, [nodes, edges]);

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 250,
        height: "100%",
        background: "#f9fafb",
        borderLeft: "1px solid #ddd",
        padding: 16,
        overflowY: "auto",
        fontSize: 13,
        zIndex: 5,
      }}
    >
      <h3 style={{ marginBottom: 12 }}>Steps</h3>
      {orderedSteps.length > 0 ? (
        <ol style={{ paddingLeft: 16 }}>
          {orderedSteps.map((step, idx) => (
            <li key={idx} style={{ marginBottom: 8 }}>
              {step}
            </li>
          ))}
        </ol>
      ) : (
        <p style={{ color: "#999" }}>No steps yet</p>
      )}
    </div>
  );
};

export default StepsPanel;
