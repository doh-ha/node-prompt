import React from "react";
import { NodeInput } from "../../styles/nodeStyles";
import { NodeShell } from "./NodeShell";
import { operatorLabels } from "../../data/nodeTemplates";

interface ConditionNodeProps {
  data: {
    condition: string;
    operator: string;
    value: string;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data, selected, id }) => {
  const headerTitle = (data as any).label || "조건";
  const headerIcon = (data as any).icon || "⚡";
  return (
    <NodeShell
      id={id}
      selected={selected}
      title={headerTitle}
      icon={headerIcon}
      iconBg={(data as any).iconBg}
      iconColor={(data as any).iconColor}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
    >
      <NodeInput
        placeholder="조건 내용을 입력하세요..."
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
