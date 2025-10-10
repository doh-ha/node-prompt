import React from "react";
import { NodeShell } from "./NodeShell";
import { NodeInput } from "../../styles/nodeStyles";

interface StartNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const StartNode: React.FC<StartNodeProps> = ({ data, selected, id }) => {
  const headerTitle = data.label || "Start";
  const headerIcon = data.icon || "▶️";
  return (
    <NodeShell
      id={id}
      selected={selected}
      title={headerTitle}
      icon={headerIcon}
      iconBg={data.iconBg || "#dcfce7"}
      iconColor={data.iconColor || "#16a34a"}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
    >
      <NodeInput
        placeholder="시작 조건/설명을 입력하세요..."
        value={data.content || ""}
        onChange={(e) => data.onContentChange?.(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </NodeShell>
  );
};
