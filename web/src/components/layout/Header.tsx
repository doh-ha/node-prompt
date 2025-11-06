import React from "react";
import styled from "styled-components";
import type { Canvas } from "../../hooks/useCanvasManager";

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px; /* 좌우 여백 */
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

const CanvasTabs = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  overflow-x: auto;
  max-width: 60%;
`;

const CanvasTab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  background: #f3f4f6; /* 활성 탭도 배경 고정 */
  color: #374151;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const AddCanvasButton = styled.button`
  padding: 6px 10px;
  background: #4f46e5; /* 보라색 */
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
`;

const ActiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4f46e5; /* 보라색 점 */
  display: inline-block;
`;

const CanvasTabDelete = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  line-height: 18px;
  font-size: 12px;
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

interface HeaderProps {
  title?: string;
  canvases?: Canvas[];
  currentCanvasId?: string;
  onCanvasSwitch?: (canvasId: string) => void;
  onCanvasCreate?: () => void;
  onCanvasDelete?: (canvasId: string) => void; // reserved for future use in UI
  onCanvasRename?: (canvasId: string, newName: string) => void; // reserved for future use in UI
}

export const Header: React.FC<HeaderProps> = ({ title = "PromptFlow", canvases = [], currentCanvasId, onCanvasSwitch, onCanvasCreate, onCanvasDelete }) => {
  return (
    <HeaderContainer>
      <HeaderTitle>{title}</HeaderTitle>
      <CanvasTabs>
        {canvases.map((c) => (
          <CanvasTab key={c.id} $active={c.id === currentCanvasId} onClick={() => onCanvasSwitch?.(c.id)}>
            {c.id === currentCanvasId && <ActiveDot />}
            {c.name}
            {canvases.length > 1 && c.id === currentCanvasId && (
              <CanvasTabDelete
                onClick={(e) => {
                  e.stopPropagation();
                  onCanvasDelete?.(c.id);
                }}
                title="삭제"
                aria-label="캔버스 삭제"
              >
                ×
              </CanvasTabDelete>
            )}
          </CanvasTab>
        ))}
        <AddCanvasButton onClick={() => onCanvasCreate?.()}>+ 새 캔버스</AddCanvasButton>
      </CanvasTabs>
    </HeaderContainer>
  );
};
