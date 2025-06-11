// FlowEditor.tsx
import React, { useState, useCallback, useMemo } from "react";
import type { Connection, ReactFlowInstance } from "reactflow";
import ReactFlow, {
  addEdge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from "reactflow";

import "reactflow/dist/style.css";
import Sidebar from "../panels/Sidebar";
import StepsPanel from "../panels/StepsPanel";
import ImageNode from "../nodes/ImageNode";
import KeyboardNode from "../nodes/KeyboardNode";
import ScreenNode from "../nodes/ScreenNode";
import ActionEdge from "../edges/ActionEdge";
import { buildScenarioJson } from "../../utils/scenarioBuilder";
import { nanoid } from "nanoid";

const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [selectedAction, setSelectedAction] = useState("click");
  const [inputPosition, setInputPosition] = useState("0.5,0.5");
  const [selectedPosition, setSelectedPosition] = useState<string | number[]>([0.5, 0.5]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({
    imageNode: (props: any) => <ImageNode {...props} deleteNode={deleteNode} />,
    keyboardNode: (props: any) => <KeyboardNode {...props} deleteNode={deleteNode} />,
    screenNode: (props: any) => <ScreenNode {...props} deleteNode={deleteNode} />,
  }), [deleteNode]);

  const edgeTypes = useMemo(() => ({ actionEdge: ActionEdge }), []);

  const onConnect = useCallback((params: Connection) => {
    setPendingConnection(params);
  }, []);

  const onPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setInputPosition(val);

    const keywords = ["left", "right", "top_left", "top_right", "bottom_left", "bottom_right", "center"];
    if (keywords.includes(val)) {
      setSelectedPosition(val);
      return;
    }

    const parts = val.split(",").map((v) => parseFloat(v.trim()));
    if (parts.length === 2 && parts.every((n) => !isNaN(n) && n >= 0 && n <= 1)) {
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

  const onDrop = useCallback((event: React.DragEvent) => {
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
        { id, type: "keyboardNode", position, data: { type: actualType, value: "" } },
      ]);
    } else if (type === "imageNode") {
      setNodes((nds) => [
        ...nds,
        { id, type: "imageNode", position, data: { src: "", label: "Image" } },
      ]);
    } else if (type === "screenNode") {
      setNodes((nds) => [
        ...nds,
        { id, type: "screenNode", position, data: { label: "Screen" } },
      ]);
    }
  }, [reactFlowInstance, setNodes]);

  const runScenario = async () => {
    const json = JSON.parse(buildScenarioJson(nodes, edges));
    console.log("시나리오 실행 준비:", json);
    alert("(임시) 시나리오 실행 로그는 콘솔에서 확인하세요");
  };

  const saveScenario = async () => {
    const json = JSON.parse(buildScenarioJson(nodes, edges));
    console.log("시나리오 저장 준비:", json);
    alert("(임시) 시나리오 저장 로그는 콘솔에서 확인하세요");
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
        <div style={{
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
        }}>
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
              <label style={{ display: "block", marginTop: 12, marginBottom: 6 }}>
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

      <div style={{
        position: "absolute",
        top: 8,
        right: 8,
        display: "flex",
        gap: 8,
        zIndex: 10,
      }}>
        <button onClick={saveScenario} style={{
          padding: "6px 12px",
          backgroundColor: "#10b981",
          border: "none",
          borderRadius: 4,
          color: "white",
          cursor: "pointer",
          fontSize: 13,
        }}>
          Save
        </button>
        <button onClick={runScenario} style={{
          padding: "6px 12px",
          backgroundColor: "#2563eb",
          border: "none",
          borderRadius: 4,
          color: "white",
          cursor: "pointer",
          fontSize: 13,
        }}>
          Run
        </button>
      </div>
    </div>
  );
};

export default FlowEditor;
