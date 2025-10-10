import React from "react";
import { MainLayout } from "./components/layout";
import CanvasEditor from "./components/CanvasEditor";
import { PreviewPanel } from "./components/PreviewPanel";
import { useNodeEditor } from "./hooks/useNodeEditor";

function App() {
  const { nodes, edges, setNodes, setEdges } = useNodeEditor();

  return (
    <MainLayout title="PromptFlow">
      <CanvasEditor onNodesChange={setNodes} onEdgesChange={setEdges} />
      <PreviewPanel nodes={nodes} edges={edges} />
    </MainLayout>
  );
}

export default App;
