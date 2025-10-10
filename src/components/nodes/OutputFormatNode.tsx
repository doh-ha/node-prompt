import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, NodeContent, NodeInput, DeleteButton } from "../../styles/nodeStyles";
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
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#dbeafe", color: "#2563eb" }}>📄</NodeIcon>
        출력 형식
        {selected && id && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            X
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{formatLabels[data.format] || data.format}</strong>
        </div>
        {data.structure && <div>구조: {data.structure}</div>}
        <NodeInput
          placeholder="출력 형식 내용을 입력하세요..."
          value={data.content || ""}
          onChange={(e) => {
            if (data.onContentChange) {
              data.onContentChange(e.target.value);
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      </NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};
