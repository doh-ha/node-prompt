import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, NodeContent, NodeInput, DeleteButton } from "../../styles/nodeStyles";
import { contextLabels } from "../../data/nodeTemplates";

interface ContextNodeProps {
  data: {
    contextType: string;
    content: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ContextNode: React.FC<ContextNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#d1fae5", color: "#059669" }}>📚</NodeIcon>
        컨텍스트
        {selected && id && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            X
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{contextLabels[data.contextType] || data.contextType}</strong>
        </div>
        <div>{data.content}</div>
        <NodeInput
          placeholder="컨텍스트 내용을 입력하세요..."
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
