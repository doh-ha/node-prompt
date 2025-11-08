import React from "react";
import styled from "styled-components";

const ToolbarContainer = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  height: 48px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  gap: 8px;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ToolbarButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background-color: ${(props) => (props.$active ? "#4f46e5" : "#f3f4f6")};
  color: ${(props) => (props.$active ? "white" : "#6b7280")};
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#4338ca" : "#e5e7eb")};
  }
`;

interface ModeToggleProps {
  mode: "pan" | "select" | "lock";
  onModeChange: (mode: "pan" | "select" | "lock") => void;
}

export const Toolbar: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <ToolbarContainer>
      <ToolbarButton $active={mode === "pan"} onClick={() => onModeChange("pan")}>
        ✋ 캔버스 이동
      </ToolbarButton>
      <ToolbarButton $active={mode === "select"} onClick={() => onModeChange("select")}>
        ⬜ 영역 선택
      </ToolbarButton>
      <ToolbarButton $active={mode === "lock"} onClick={() => onModeChange("lock")}>
        🔒 잠금
      </ToolbarButton>
    </ToolbarContainer>
  );
};
