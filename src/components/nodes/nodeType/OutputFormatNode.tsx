import React from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { RadioSuggestions } from "../RadioSuggestions";
import { formatLabels } from "../../../constants/labels";

interface OutputFormatNodeProps {
  data: {
    format: string;
    structure?: string;
    content?: string;
    suggestions?: string[];
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const OutputFormatNode: React.FC<OutputFormatNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeShell
      id={id}
      selected={selected}
      title={(data as any).label}
      icon={(data as any).icon}
      iconColor={(data as any).iconColor}
      bg={(data as any).nodeBg}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
    >
      {data.suggestions && data.suggestions.length > 0 && <RadioSuggestions suggestions={data.suggestions} selectedValue={data.content} onSelectionChange={(value) => data.onContentChange?.(value)} />}
      <NodeInput
        placeholder="출력 형식 내용을 입력하세요..."
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
