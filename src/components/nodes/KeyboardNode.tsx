import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";

const KeyboardNode = ({ data, id, deleteNode }) => {
  const [value, setValue] = useState(data?.value || "");
  const [type, setType] = useState(data?.type || "hotkey");

  useEffect(() => {
    data.value = value;
    data.type = type;
  }, [value, type]);

  return (
    <div
      style={{
        width: 140,
        padding: 8,
        border: "2px dashed #999",
        borderRadius: 6,
        background: "#fef3c7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative", // X 버튼 위치를 위해 추가
      }}
    >
      {/* 삭제 버튼 */}
      <button
        onClick={() => deleteNode(id)}
        style={{
          position: "absolute",
          top: -10,
          left: -10,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#ef4444",
          color: "white",
          border: "none",
          fontSize: 12,
          cursor: "pointer",
          lineHeight: "18px",
        }}
      >
        ×
      </button>

      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{
          fontSize: 11,
          marginBottom: 6,
          width: "100%",
          padding: "2px 4px",
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      >
        <option value="hotkey">hotkey</option>
        <option value="press">press</option>
        <option value="type">type</option>
      </select>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter key/value"
        style={{
          fontSize: 12,
          width: "100%",
          padding: "4px 6px",
          border: "1px solid #ccc",
          borderRadius: 4,
          textAlign: "center",
        }}
      />

      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
};

export default KeyboardNode;
