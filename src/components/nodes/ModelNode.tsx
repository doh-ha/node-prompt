import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, NodeContent, NodeInput, DeleteButton } from "../../styles/nodeStyles";

interface ModelNodeProps {
  data: {
    model: string;
    temperature: number;
    maxTokens: number;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ModelNode: React.FC<ModelNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#f3e8ff", color: "#9333ea" }}>🤖</NodeIcon>
        AI 모델
        {selected && id && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            X
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{data.model}</strong>
        </div>
        <div>온도: {data.temperature}</div>
        <div>최대 토큰: {data.maxTokens}</div>
        <NodeInput
          placeholder="모델 설정 내용을 입력하세요..."
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
