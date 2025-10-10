import React from "react";
import { NodeInput } from "../../styles/nodeStyles";
import { NodeShell } from "./NodeShell";

interface PromptTemplateNodeProps {
  data: {
    template: string;
    variables: string[];
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const PromptTemplateNode: React.FC<PromptTemplateNodeProps> = ({ data, selected, id }) => {
  const headerTitle = (data as any).label || "프롬프트 템플릿";
  const headerIcon = (data as any).icon || "📝";
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
      {/* 프리뷰 텍스트 제거 (… 표시 제거) */}
      <NodeInput
        placeholder="프롬프트 템플릿 내용을 입력하세요..."
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
