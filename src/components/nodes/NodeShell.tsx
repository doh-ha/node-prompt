import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, DeleteButton, NodeContent } from "../../styles/nodeStyles";

interface NodeShellProps {
  id?: string;
  selected?: boolean;
  title: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export const NodeShell: React.FC<NodeShellProps> = ({ id, selected, title, icon = "⬚", iconBg = "#eef2ff", iconColor = "#4f46e5", onDelete, children }) => {
  const iconStyle = { background: iconBg, color: iconColor } as React.CSSProperties;
  const containerStyle = { background: iconBg } as React.CSSProperties;
  return (
    <NodeContainer className={selected ? "selected" : ""} style={containerStyle}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={iconStyle}>{icon}</NodeIcon>
        {title}
        {selected && onDelete && (
          <DeleteButton onClick={onDelete} title="삭제">
            X
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>{children}</NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};
