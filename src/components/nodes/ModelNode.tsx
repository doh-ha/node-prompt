import React from "react";
import { NodeInput } from "../../styles/nodeStyles";
import { NodeShell } from "./NodeShell";

interface ModelNodeProps {
  data: {
    model: string;
    temperature: number;
    maxTokens: number;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ModelNode: React.FC<ModelNodeProps> = ({ data, selected, id }) => {
  const headerTitle = (data as any).label || "AI 모델";
  const headerIcon = (data as any).icon || "🤖";
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
        placeholder="모델 설정 내용을 입력하세요..."
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
