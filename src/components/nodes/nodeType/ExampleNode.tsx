import React from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";

interface ExampleNodeProps {
  data: {
    content: string;
    label?: string;
    icon?: string;
    iconColor?: string;
    nodeBg?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ExampleNode: React.FC<ExampleNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      <NodeInput
        placeholder="예시나 샘플을 입력하세요..."
        defaultValue={data.content ?? ""}
        onBlur={(e) => {
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
