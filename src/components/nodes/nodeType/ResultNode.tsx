import React from "react";
import { NodeShell } from "../NodeShell";
import { NodeInput } from "../../../styles/nodeStyles";

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
  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={(data as any).nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      <NodeInput
        placeholder="결과 설명/출력 요약을 입력하세요..."
        defaultValue={data.content ?? ""}
        onBlur={(e) => data.onContentChange?.(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </NodeShell>
  );
};
