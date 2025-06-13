import { Handle, Position } from "reactflow";

const ImageNode = ({ id, data, deleteNode }) => {
  const size = 140; // 이미지 크기

  return (
    <div
      style={{
        position: "relative", // 삭제 버튼 위치를 위해 상대 위치
        padding: 8,
        border: "1px solid #ddd",
        borderRadius: 6,
        background: "white",
        width: size,          // 전체 width = size
        height: size + 10,    // 이미지 + 라벨 공간
        boxSizing: "border-box", // padding도 width, height에 포함
        textAlign: "center",
        userSelect: "none",
      }}
    >
      {/* 삭제 버튼 */}
      <button
        onClick={() => deleteNode(id)}
        style={{
          position: "absolute",
          top: 4,
          left: 4,
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
          fontSize: 14,
          userSelect: "none",
          zIndex: 10,
        }}
        title="Delete node"
        aria-label="Delete node"
      >
        ×
      </button>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
        id="top"
      />

      <img
        src={data.imageUrl}
        alt="node"
        style={{
          width: "100%",        // 컨테이너 가득 채우기
          height: size,
          objectFit: "contain",
          borderRadius: 6,
          pointerEvents: "none",
          userSelect: "none",
          display: "block",
        }}
        draggable={false}
      />

      <div
        style={{
          marginTop: -30,
          marginBottom: 2,
          fontSize: 12,
          fontWeight: "bold",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {data.label || "Unnamed"}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
        id="bottom"
      />
    </div>
  );
};

export default ImageNode;
