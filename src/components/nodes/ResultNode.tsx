import React from "react";
import { NodeShell } from "./NodeShell";
import { NodeInput } from "../../styles/nodeStyles";

interface ResultNodeProps {
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

export const ResultNode: React.FC<ResultNodeProps> = ({ data, selected, id }) => {
  const headerTitle = data.label || "Result";
  const headerIcon = data.icon || "🏁";
  return (
    <NodeShell
      id={id}
      selected={selected}
      title={headerTitle}
      icon={headerIcon}
      iconBg={data.iconBg || "#e0f2fe"}
      iconColor={data.iconColor || "#0ea5e9"}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
    >
      <NodeInput
        placeholder="결과 설명/출력 요약을 입력하세요..."
        value={data.content || ""}
        onChange={(e) => data.onContentChange?.(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </NodeShell>
  );
};
