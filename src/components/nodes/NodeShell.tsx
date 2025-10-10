import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, DeleteButton, NodeContent } from "../../styles/nodeStyles";

interface NodeShellProps {
  id?: string;
  selected?: boolean;
  title?: string;
  icon?: string;
  iconColor?: string;
  bg?: string;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export const NodeShell: React.FC<NodeShellProps> = ({ id, selected, title, icon = "⬚", iconColor = "#4f46e5", bg, onDelete, children }) => {
  const iconStyle = { background: "transparent", color: iconColor } as React.CSSProperties;
  return (
    <NodeContainer className={selected ? "selected" : ""} style={bg ? { background: bg } : undefined}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={iconStyle}>{icon}</NodeIcon>
        {title || "Node"}
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
