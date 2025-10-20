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

  // Start 노드는 상단 연결점 없음, Result 노드는 하단 연결점 없음
  const showTopHandle = nodeType !== "start";
  const showBottomHandle = nodeType !== "result";
  const showLeftHandle = nodeType !== "start"; // start는 입력 불가
  const showRightHandle = nodeType !== "result"; // result는 출력 불가

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
