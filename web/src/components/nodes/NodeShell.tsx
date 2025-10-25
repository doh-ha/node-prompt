import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, DeleteButton, NodeContent } from "../../styles/nodeStyles";
import { colors } from "../../constants";

interface NodeShellProps {
  id?: string;
  selected?: boolean;
  title?: string;
  icon?: string;
  iconColor?: string;
  bg?: string;
  onDelete?: () => void;
  children?: React.ReactNode;
  nodeType?: string;
}

export const NodeShell: React.FC<NodeShellProps> = ({ id, selected, title, icon = "⬚", iconColor = colors.primary, bg, onDelete, children, nodeType }) => {
  const iconStyle = { background: "transparent", color: iconColor } as React.CSSProperties;

  // 연결점 표시 규칙
  // - start: 하단만
  // - result: 상단만
  // - 그 외(input/model/output 포함): 상하좌우 모두
  const isStart = nodeType === "start";
  const isResult = nodeType === "result";
  const showTopHandle = isResult ? true : isStart ? false : true;
  const showBottomHandle = isStart ? true : isResult ? false : true;
  const showLeftHandle = isStart || isResult ? false : true;
  const showRightHandle = isStart || isResult ? false : true;

  // 연결점 스타일 - 배경색보다 진한 색상으로 설정
  const getHandleColor = (bgColor: string) => {
    // 배경색에 따라 더 진한 색상 반환
    if (bgColor === colors.nodeBg.blue) return "#1e40af"; // 진한 파란색
    if (bgColor === colors.nodeBg.lightPurple) return "#7c3aed"; // 진한 보라색
    if (bgColor === colors.nodeBg.lightGreen) return "#16a34a"; // 진한 녹색
    if (bgColor === colors.nodeBg.yellow) return "#ca8a04"; // 진한 노란색
    if (bgColor === colors.nodeBg.grey) return "#6b7280"; // 진한 회색
    return "#6b7280"; // 기본값
  };

  // 연결점 스타일 - 위치별로 다르게 설정
  const getHandleStyle = (position: Position) => {
    const baseStyle = {
      width: "8px",
      height: "8px",
    };

    // 위치별로 다른 스타일 적용
    switch (position) {
      case Position.Top:
        return {
          ...baseStyle,
          background: "transparent", // 투명 배경
          border: "2px solid #6b7280", // 회색 테두리만
          transform: "translate(-50%, -50%)",
        };
      case Position.Bottom:
        return {
          ...baseStyle,
          background: "transparent", // 투명 배경
          border: "2px solid #6b7280", // 회색 테두리만
          transform: "translate(-50%, 50%)",
        };
      case Position.Left:
        return {
          ...baseStyle,
          background: "#ffffff",
          border: `2px solid ${getHandleColor(bg || colors.nodeBg.grey)}`,
          transform: "translate(-50%, -50%)",
        };
      case Position.Right:
        return {
          ...baseStyle,
          background: "#ffffff",
          border: `2px solid ${getHandleColor(bg || colors.nodeBg.grey)}`,
          transform: "translate(50%, -50%)",
        };
      default:
        return baseStyle;
    }
  };

  // 연결점의 색상 타입을 반환하는 함수
  const getHandleColorType = (position: Position) => {
    switch (position) {
      case Position.Top:
      case Position.Bottom:
        return "gray"; // 회색 연결점
      case Position.Left:
      case Position.Right:
        return "colored"; // 색상 연결점
      default:
        return "gray";
    }
  };

  // 잠금 UI 제거

  return (
    <NodeContainer className={selected ? "selected" : ""} style={bg ? { background: bg } : undefined}>
      {/* 좌/우 핸들: 규칙에 따라 표시 */}
      {showLeftHandle && <Handle id="left" isConnectable={true} type="target" position={Position.Left} style={getHandleStyle(Position.Left)} data-handle-type={getHandleColorType(Position.Left)} />}
      {showTopHandle && <Handle id="top" isConnectable={true} type="target" position={Position.Top} style={getHandleStyle(Position.Top)} data-handle-type={getHandleColorType(Position.Top)} />}
      <NodeHeader>
        <NodeIcon style={iconStyle}>{icon}</NodeIcon>
        {title || "Node"}
        {selected && onDelete && (
          <DeleteButton onClick={onDelete} title="삭제" style={{ marginLeft: "auto" }}>
            X
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>{children}</NodeContent>
      {showBottomHandle && (
        <Handle id="bottom" isConnectable={true} type="source" position={Position.Bottom} style={getHandleStyle(Position.Bottom)} data-handle-type={getHandleColorType(Position.Bottom)} />
      )}
      {showRightHandle && (
        <Handle id="right" isConnectable={true} type="source" position={Position.Right} style={getHandleStyle(Position.Right)} data-handle-type={getHandleColorType(Position.Right)} />
      )}
    </NodeContainer>
  );
};
