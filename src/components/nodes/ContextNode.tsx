import React from "react";
import { NodeInput } from "../../styles/nodeStyles";
import { NodeShell } from "./NodeShell";
import { contextLabels } from "../../data/nodeTemplates";

interface ContextNodeProps {
  data: {
    contextType: string;
    content: string;
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ContextNode: React.FC<ContextNodeProps> = ({ data, selected, id }) => {
  const headerTitle = contextLabels[data.contextType] || data.label || data.contextType;
  const headerIcon = data.icon || "📚";
  return (
    <NodeShell id={id} selected={selected} title={headerTitle} icon={headerIcon} iconBg={data.iconBg} iconColor={data.iconColor} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      <NodeInput
        placeholder="컨텍스트 내용을 입력하세요..."
        value={data.content || ""}
        onChange={(e) => {
          if (data.onContentChange) {
            data.onContentChange(e.target.value);
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </NodeShell>
  );
};
