import React, { useState } from "react";
import styled from "styled-components";
import CanvasEditor from "./components/CanvasEditor";
import { PreviewPanel } from "./components/PreviewPanel";
import { Node, Edge } from "./types/nodeTypes";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const MainContent = styled.main`
  margin-top: 60px;
  height: calc(100vh - 60px);
  position: relative;
`;

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  return (
    <AppContainer>
      <Header>
        <HeaderTitle>AI 에이전트 설계 도구</HeaderTitle>
      </Header>

      <MainContent>
        <CanvasEditor onNodesChange={setNodes} onEdgesChange={setEdges} />
        <PreviewPanel nodes={nodes} edges={edges} />
      </MainContent>
    </AppContainer>
  );
}

export default App;
