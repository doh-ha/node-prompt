import React from "react";
import styled from "styled-components";
import { Header } from "./Header";
import type { Canvas } from "../../hooks/useCanvasManager";
import { Toolbar } from "./Toolbar";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const MainContent = styled.main`
  margin-top: 108px;
  height: calc(100vh - 108px);
  position: relative;
`;

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showToolbar?: boolean;
  toolbarMode?: "pan" | "select" | "lock";
  onToolbarModeChange?: (mode: "pan" | "select" | "lock") => void;
  canvases?: Canvas[];
  currentCanvasId?: string;
  onCanvasSwitch?: (canvasId: string) => void;
  onCanvasCreate?: () => void;
  onCanvasDelete?: (canvasId: string) => void;
  onCanvasRename?: (canvasId: string, newName: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showToolbar = false,
  toolbarMode = "pan",
  onToolbarModeChange,
  canvases = [],
  currentCanvasId,
  onCanvasSwitch,
  onCanvasCreate,
  onCanvasDelete,
  onCanvasRename,
}) => {
  return (
    <AppContainer>
      <Header
        title={title}
        canvases={canvases}
        currentCanvasId={currentCanvasId}
        onCanvasSwitch={onCanvasSwitch}
        onCanvasCreate={onCanvasCreate}
        onCanvasDelete={onCanvasDelete}
        onCanvasRename={onCanvasRename}
      />
      {showToolbar && onToolbarModeChange && <Toolbar mode={toolbarMode} onModeChange={onToolbarModeChange} />}
      <MainContent>{children}</MainContent>
    </AppContainer>
  );
};
