import React from "react";
import { NodeInput } from "../../styles/nodeStyles";
import { NodeShell } from "./NodeShell";
import { formatLabels } from "../../data/nodeTemplates";

interface OutputFormatNodeProps {
  data: {
    format: string;
    structure?: string;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const OutputFormatNode: React.FC<OutputFormatNodeProps> = ({ data, selected, id }) => {
  const headerTitle = (data as any).label || "출력 형식";
  const headerIcon = (data as any).icon || "📄";
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
        placeholder="출력 형식 내용을 입력하세요..."
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
