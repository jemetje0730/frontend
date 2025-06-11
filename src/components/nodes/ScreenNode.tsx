import React from "react";
import { NodeProps, Handle, Position } from "reactflow";

interface ScreenNodeProps extends NodeProps {
  deleteNode?: (id: string) => void;
}

const ScreenNode: React.FC<ScreenNodeProps> = ({ id, selected, deleteNode }) => {
  return (
    <div
      style={{
        position: "relative",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 6,
        border: "1px solid black",
        minWidth: 100,
        textAlign: "center",
      }}
    >
      {/* 삭제 버튼 */}
      <button
        onClick={() => deleteNode?.(id)}
        style={{
          position: "absolute",
          top: -9,
          left: -9,
          width: 18,
          height: 18,
          padding: 0,
          border: "none",
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          lineHeight: 1,
          fontSize: 10,
          userSelect: "none",
          zIndex: 10,
        }}
        title="Delete node"
        aria-label="Delete node"
      >
        ×
      </button>

      {/* 핸들 */}
      <Handle type="target" position={Position.Top} style={{ background: "#000" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#000" }} />

      <strong>Screen Compare</strong>
    </div>
  );
};

export default ScreenNode;
