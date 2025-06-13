import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { Connection, ReactFlowInstance } from "reactflow";
import { buildSteps } from "../../utils/buildSteps";
import ReactFlow, {
  addEdge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from "reactflow";

import WaitNode from "../nodes/WaitNode";
import "reactflow/dist/style.css";
import Sidebar from "../panels/Sidebar";
import StepsPanel from "../panels/StepsPanel";
import ImageNode from "../nodes/ImageNode";
import KeyboardNode from "../nodes/KeyboardNode";
import ScreenNode from "../nodes/ScreenNode";
import ActionEdge from "../edges/ActionEdge";
import { nanoid } from "nanoid";

const LOCAL_STORAGE_KEY = "flow_scenario_state";

const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null
  );
  const [selectedAction, setSelectedAction] = useState("click");
  const [inputPosition, setInputPosition] = useState("0.5,0.5");
  const [selectedPosition, setSelectedPosition] = useState<string | number[]>([
    0.5, 0.5,
  ]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 복원
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        setNodes(savedNodes || []);
        setEdges(savedEdges || []);
      } catch (e) {
        console.error("복원 실패:", e);
      }
    }
    setInitialized(true);
  }, []);

  // 저장
  useEffect(() => {
    if (initialized && !isResetting) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ nodes, edges }));
    }
  }, [nodes, edges, initialized, isResetting]);

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      );
    },
    [setNodes, setEdges]
  );

  const nodeTypes = useMemo(
    () => ({
      imageNode: (props) => <ImageNode {...props} deleteNode={deleteNode} />,
      keyboardNode: (props) => (
        <KeyboardNode {...props} deleteNode={deleteNode} />
      ),
      screenNode: (props) => <ScreenNode {...props} deleteNode={deleteNode} />,
      waitNode: (props) => <WaitNode {...props} deleteNode={deleteNode} />,
    }),
    [deleteNode]
  );

  const edgeTypes = useMemo(() => ({ actionEdge: ActionEdge }), []);

  const onConnect = useCallback((params: Connection) => {
    setPendingConnection(params);
  }, []);

  const onPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setInputPosition(val);

    const keywords = [
      "left",
      "right",
      "top_left",
      "top_right",
      "bottom_left",
      "bottom_right",
      "center",
    ];
    if (keywords.includes(val)) {
      setSelectedPosition(val);
      return;
    }

    const parts = val.split(",").map((v) => parseFloat(v.trim()));
    if (
      parts.length === 2 &&
      parts.every((n) => !isNaN(n) && n >= 0 && n <= 1)
    ) {
      setSelectedPosition(parts);
    }
  };

  const onConfirmAction = () => {
    if (!pendingConnection) return;

    const edgeData: any = { action: selectedAction };
    if (selectedAction !== "next") {
      edgeData.position = selectedPosition;
    }

    setEdges((eds) =>
      addEdge(
        {
          ...pendingConnection,
          type: "actionEdge",
          data: edgeData,
        },
        eds
      )
    );

    setPendingConnection(null);
    setSelectedAction("click");
    setInputPosition("0.5,0.5");
    setSelectedPosition([0.5, 0.5]);
  };

  const onCancel = () => {
    setPendingConnection(null);
    setSelectedAction("click");
    setInputPosition("0.5,0.5");
    setSelectedPosition([0.5, 0.5]);
  };

  const onActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAction(e.target.value);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = nanoid();

      if (type.startsWith("keyboard:")) {
        const actualType = type.split(":")[1];
        setNodes((nds) => [
          ...nds,
          {
            id,
            type: "keyboardNode",
            position,
            data: { type: actualType, value: "" },
          },
        ]);
      } else if (type === "waitNode") {
        setNodes((nds) => [
          ...nds,
          {
            id,
            type: "waitNode",
            position,
            data: {
              wait: 0.5,
              onChange: (nodeId, newWait) =>
                setNodes((nodes) =>
                  nodes.map((n) =>
                    n.id === nodeId
                      ? { ...n, data: { ...n.data, wait: newWait } }
                      : n
                  )
                ),
            },
          },
        ]);
      } else if (type === "imageNode") {
        setNodes((nds) => [
          ...nds,
          {
            id,
            type: "imageNode",
            position,
            data: { src: "", label: "Image" },
          },
        ]);
      } else if (type === "screenNode") {
        setNodes((nds) => [
          ...nds,
          { id, type: "screenNode", position, data: { label: "Screen" } },
        ]);
      }
    },
    [reactFlowInstance, setNodes]
  );

  const runScenario = async () => {
    try {
      const res = await fetch("http://localhost:5000/run-scenario", {
        method: "POST",
      });
      const result = await res.json();
      console.log("실행 결과:", result);
      alert(result.message || "시나리오 실행 완료!");
    } catch (err) {
      console.error("실행 실패:", err);
      alert("시나리오 실행 실패");
    }
  };

  const steps = buildSteps(nodes, edges);

  // 서버 저장 함수
  const saveScenario = async () => {
    // 노드가 존재하고 엣지가 하나도 없으면 저장 불가
    if (nodes.length > 0 && edges.length === 0) {
      alert("노드는 존재하지만 연결된 엣지가 없습니다. 저장할 수 없습니다.");
      return;
    }

    // 모든 노드가 적어도 하나의 엣지와 연결되어 있는지 체크
    const disconnectedNodes = nodes.filter(
      (node) =>
        !edges.some(
          (edge) => edge.source === node.id || edge.target === node.id
        )
    );

    if (disconnectedNodes.length > 0) {
      alert(
        `연결되지 않은 노드가 존재합니다.`
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/save-scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildSteps(nodes, edges)),
      });

      const result = await res.json();
      console.log("서버 응답:", result);
      alert("시나리오 저장 완료!");
    } catch (err) {
      console.error("저장 실패:", err);
      alert("시나리오 저장 실패");
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <Sidebar setNodes={setNodes} />
      <StepsPanel nodes={nodes} edges={edges} />

      <ReactFlow
        onInit={setReactFlowInstance}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <MiniMap />
        <Background />
      </ReactFlow>

      {pendingConnection && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            padding: 20,
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: 4,
            zIndex: 100,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            width: 280,
          }}
        >
          <h3 style={{ marginBottom: 10 }}>Mouse Action type 선택</h3>
          {["click", "double_click", "right_click", "next"].map((action) => (
            <label key={action} style={{ display: "block", marginBottom: 8 }}>
              <input
                type="radio"
                name="action"
                value={action}
                checked={selectedAction === action}
                onChange={onActionChange}
                style={{ marginRight: 8 }}
              />
              {action.replace("_", " ")}
            </label>
          ))}

          {selectedAction !== "next" && (
            <>
              <label
                style={{ display: "block", marginTop: 12, marginBottom: 6 }}
              >
                <strong>Position 입력 (0~1 범위, 쉼표 또는 키워드)</strong>
              </label>
              <input
                type="text"
                value={inputPosition}
                onChange={onPositionChange}
                placeholder="예: 0.5,0.5 또는 right"
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
            </>
          )}

          <div style={{ marginTop: 12 }}>
            <button
              onClick={onConfirmAction}
              style={{
                padding: "6px 12px",
                marginRight: 8,
                backgroundColor: "#10b981",
                border: "none",
                borderRadius: 4,
                color: "white",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              확인
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: "6px 12px",
                backgroundColor: "#ef4444",
                border: "none",
                borderRadius: 4,
                color: "white",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 8,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => {
            setIsResetting(true);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setNodes([]);
            setEdges([]);
            setTimeout(() => setIsResetting(false), 0);
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: "#f97316",
            border: "none",
            borderRadius: 4,
            color: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Reset
        </button>
        <button
          onClick={saveScenario}
          style={{
            padding: "6px 12px",
            backgroundColor: "#10b981",
            border: "none",
            borderRadius: 4,
            color: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Save
        </button>
        <button
          onClick={runScenario}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2563eb",
            border: "none",
            borderRadius: 4,
            color: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Run
        </button>
      </div>
    </div>
  );
};

export default FlowEditor;
