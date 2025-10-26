import React, { useState } from "react";
import styled from "styled-components";
import { MainLayout } from "./components/layout";
import CanvasEditor from "./components/CanvasEditor";
import { PreviewPanel } from "./components/PreviewPanel";
import { LibraryPanel } from "./components/LibraryPanel";
import { useNodeEditor } from "./hooks/useNodeEditor";

const AppContainer = styled.div`
  display: flex;
  height: 100%;
`;

const PanelContainer = styled.div<{ $isOpen: boolean; $position: "left" | "right" }>`
  width: ${(props) => (props.$isOpen ? (props.$position === "left" ? "300px" : "400px") : "0")};
  min-width: ${(props) => (props.$isOpen ? (props.$position === "left" ? "300px" : "400px") : "0")};
  max-width: ${(props) => (props.$isOpen ? (props.$position === "left" ? "300px" : "400px") : "0")};
  transition: all 0.3s ease;
  overflow: hidden;
  background: white;
  border-right: ${(props) => (props.$position === "left" ? "1px solid #e5e7eb" : "none")};
  border-left: ${(props) => (props.$position === "right" ? "1px solid #e5e7eb" : "none")};
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  position: fixed;
  top: 60px;
  height: calc(100vh - 60px);
  left: ${(props) => (props.$position === "left" ? "0" : "auto")};
  right: ${(props) => (props.$position === "right" ? "0" : "auto")};
  z-index: 1000;
  display: ${(props) => (props.$isOpen ? "block" : "none")};
`;

const CanvasContainer = styled.div<{ $leftPanelOpen: boolean; $rightPanelOpen: boolean }>`
  flex: 1;
  transition: all 0.3s ease;
  margin-left: ${(props) => (props.$leftPanelOpen ? "300px" : "0")};
  margin-right: ${(props) => (props.$rightPanelOpen ? "400px" : "0")};
`;

function App() {
  const { nodes, edges, setNodes, setEdges } = useNodeEditor();
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // ResizeObserver 에러 무시
  React.useEffect(() => {
    const originalError = window.console.error;
    window.console.error = (...args) => {
      if (args[0]?.includes?.("ResizeObserver loop completed with undelivered notifications")) {
        return;
      }
      originalError.apply(window.console, args);
    };
    return () => {
      window.console.error = originalError;
    };
  }, []);

  return (
    <MainLayout title="PromptFlow">
      <AppContainer>
        {leftPanelOpen && (
          <PanelContainer $isOpen={leftPanelOpen} $position="left">
            <LibraryPanel
              onDragStart={(event, nodeType, data) => {
                event.dataTransfer.setData("application/reactflow", nodeType);
                event.dataTransfer.setData("application/reactflow-data", JSON.stringify(data));
                event.dataTransfer.effectAllowed = "move";
              }}
              onClose={() => setLeftPanelOpen(false)}
            />
          </PanelContainer>
        )}

        <CanvasContainer $leftPanelOpen={leftPanelOpen} $rightPanelOpen={rightPanelOpen}>
          <CanvasEditor onNodesChange={setNodes} onEdgesChange={setEdges} />
        </CanvasContainer>

        {rightPanelOpen && (
          <PanelContainer $isOpen={rightPanelOpen} $position="right">
            <PreviewPanel nodes={nodes} edges={edges} onClose={() => setRightPanelOpen(false)} />
          </PanelContainer>
        )}

        {!leftPanelOpen && (
          <div
            onClick={() => setLeftPanelOpen(true)}
            style={{
              position: "fixed",
              left: "0px",
              top: "100px",
              background: "#4f46e5",
              color: "white",
              padding: "20px 8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              zIndex: 99999,
              borderRadius: "0 8px 8px 0",
              boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            라이브러리
          </div>
        )}

        {!rightPanelOpen && (
          <div
            onClick={() => setRightPanelOpen(true)}
            style={{
              position: "fixed",
              right: "0px",
              top: "100px",
              background: "#4f46e5",
              color: "white",
              padding: "20px 8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              zIndex: 99999,
              borderRadius: "8px 0 0 8px",
              boxShadow: "-2px 0 8px rgba(0,0,0,0.3)",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            미리보기
          </div>
        )}
      </AppContainer>
    </MainLayout>
  );
}

export default App;
