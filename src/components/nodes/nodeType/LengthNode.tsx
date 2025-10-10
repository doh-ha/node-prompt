import React from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";

interface LengthNodeProps {
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

export const LengthNode: React.FC<LengthNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeShell
      id={id}
      selected={selected}
      title={data.label || "Length"}
      icon={data.icon || "📏"}
      iconColor={data.iconColor || "#7c3aed"}
      bg={data.nodeBg || "#ecfdf5"}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
    >
      <NodeInput
        placeholder="권장 길이를 입력하세요..."
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
