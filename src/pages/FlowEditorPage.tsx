import React from "react";
import { ReactFlowProvider } from "reactflow";
import FlowEditor from "../components/editors/FlowEditor";

const FlowEditorPage = () => {
  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </div>
  );
};

export default FlowEditorPage;