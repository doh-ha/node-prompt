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

  // 잠금 UI 제거

  return (
    <NodeContainer className={selected ? "selected" : ""} style={bg ? { background: bg } : undefined}>
      {/* 좌/우 핸들: 규칙에 따라 표시 */}
      {showLeftHandle && <Handle id="left" isConnectable type="target" position={Position.Left} />}
      {showTopHandle && <Handle id="top" isConnectable type="target" position={Position.Top} />}
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
      {showBottomHandle && <Handle id="bottom" isConnectable type="source" position={Position.Bottom} />}
      {showRightHandle && <Handle id="right" isConnectable type="source" position={Position.Right} />}
    </NodeContainer>
  );
};
