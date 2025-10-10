import React from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";

interface ReferenceNodeProps {
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

export const ReferenceNode: React.FC<ReferenceNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeShell
      id={id}
      selected={selected}
      title={data.label || "Reference"}
      icon={data.icon || "📑"}
      iconColor={data.iconColor || "#475569"}
      bg={data.nodeBg || "#e0f2fe"}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
    >
      <NodeInput
        placeholder="참고 자료나 문헌을 입력하세요..."
        defaultValue={data.content || ""}
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
