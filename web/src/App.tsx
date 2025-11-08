import React, { useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { MainLayout } from "./components/layout";
import CanvasEditor from "./components/CanvasEditor";
import { PreviewPanel } from "./components/PreviewPanel";
import { LibraryPanel } from "./components/LibraryPanel";
import { useCanvasManager } from "./hooks/useCanvasManager";
import type { Node, Edge } from "./types/nodeTypes";

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
  const { canvases, currentCanvas, currentCanvasId, createCanvas, deleteCanvas, renameCanvas, switchCanvas, updateCurrentCanvas } = useCanvasManager();
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [canvasMode, setCanvasMode] = useState<"pan" | "select">("pan");

  // 이전 노드/엣지 값을 추적하여 실제 변경 시에만 업데이트
  const prevNodesRef = useRef<Node[]>(currentCanvas?.nodes || []);
  const prevEdgesRef = useRef<Edge[]>(currentCanvas?.edges || []);
  const updateCurrentCanvasRef = useRef(updateCurrentCanvas);
  const currentCanvasRef = useRef(currentCanvas);
  const prevCanvasIdRef = useRef<string>(currentCanvasId);

  // ref 업데이트 - currentCanvasId가 변경될 때만
  React.useEffect(() => {
    updateCurrentCanvasRef.current = updateCurrentCanvas;
  }, [updateCurrentCanvas]);

  // 캔버스가 변경되었을 때만 ref 업데이트
  React.useEffect(() => {
    if (currentCanvasId !== prevCanvasIdRef.current) {
      prevCanvasIdRef.current = currentCanvasId;
      currentCanvasRef.current = currentCanvas;
      prevNodesRef.current = currentCanvas?.nodes || [];
      prevEdgesRef.current = currentCanvas?.edges || [];
    } else {
      // 같은 캔버스이지만 currentCanvas 객체가 변경된 경우 (노드/엣지 업데이트)
      currentCanvasRef.current = currentCanvas;
    }
  }, [currentCanvasId, currentCanvas]);

  // 노드 변경 핸들러 - 실제 변경 시에만 업데이트
  const handleNodesChange = useCallback((nodes: Node[]) => {
    const nodesString = JSON.stringify(nodes);
    const prevNodesString = JSON.stringify(prevNodesRef.current);
    if (nodesString !== prevNodesString) {
      prevNodesRef.current = nodes;
      // 현재 캔버스의 엣지는 그대로 유지
      const currentEdges = currentCanvasRef.current?.edges || prevEdgesRef.current;
      updateCurrentCanvasRef.current(nodes, currentEdges);
    }
  }, []);

  // 엣지 변경 핸들러 - 실제 변경 시에만 업데이트
  const handleEdgesChange = useCallback((edges: Edge[]) => {
    const edgesString = JSON.stringify(edges);
    const prevEdgesString = JSON.stringify(prevEdgesRef.current);
    if (edgesString !== prevEdgesString) {
      prevEdgesRef.current = edges;
      // 현재 캔버스의 노드는 그대로 유지
      const currentNodes = currentCanvasRef.current?.nodes || prevNodesRef.current;
      updateCurrentCanvasRef.current(currentNodes, edges);
    }
  }, []);

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
    <MainLayout
      title="PromptFlow"
      showToolbar={true}
      toolbarMode={canvasMode}
      onToolbarModeChange={setCanvasMode}
      canvases={canvases}
      currentCanvasId={currentCanvasId}
      onCanvasSwitch={switchCanvas}
      onCanvasCreate={createCanvas}
      onCanvasDelete={deleteCanvas}
      onCanvasRename={renameCanvas}
    >
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
          <CanvasEditor
            key={currentCanvasId}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            canvasMode={canvasMode}
            initialNodes={currentCanvas?.nodes}
            initialEdges={currentCanvas?.edges}
            canvasId={currentCanvasId}
            canvasName={currentCanvas?.name}
          />
        </CanvasContainer>

        {rightPanelOpen && currentCanvas && (
          <PanelContainer $isOpen={rightPanelOpen} $position="right">
            <PreviewPanel nodes={currentCanvas.nodes} edges={currentCanvas.edges} onClose={() => setRightPanelOpen(false)} />
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
