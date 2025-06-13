import { Handle, Position } from "reactflow";

const WaitNode = ({ id, data, deleteNode }) => {
  const size = 100;

  const handleChange = (e) => {
    const val = parseFloat(e.target.value);
    data.onChange?.(id, isNaN(val) ? 0.5 : val);
  };

  return (
    <div
      style={{
        position: "relative",
        padding: 8,
        border: "1px solid black",
        borderRadius: 6,
        background: "white",
        width: size,
        height: size,
        textAlign: "center",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      <button
        onClick={() => deleteNode(id)}
        style={{
          position: "absolute",
          top: -8,
          left: -8,
          width: 18,
          height: 18,
          padding: 0,
          border: "none",
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
        }}
        title="Delete node"
      >
        ×
      </button>

      <Handle type="target" position={Position.Top} style={{ background: "#555" }} id="top" />
      <div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 6 }}>Wait</div>
      <input
        type="number"
        min="0"
        step="0.1"
        defaultValue={data.wait || 0.5}
        onChange={handleChange}
        style={{
          width: "100%",
          fontSize: 12,
          padding: "2px 1px",
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      />
      <div style={{ fontSize: 10, marginTop: 4 }}>seconds</div>
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} id="bottom" />
    </div>
  );
};

export default WaitNode;
