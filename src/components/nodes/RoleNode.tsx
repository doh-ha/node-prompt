import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, NodeContent, NodeInput, DeleteButton } from "../../styles/nodeStyles";

interface RoleNodeProps {
  data: {
    role: string;
    description: string;
    examples: string[];
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const RoleNode: React.FC<RoleNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#fef3c7", color: "#d97706" }}>🎭</NodeIcon>
        역할 정의
        {selected && id && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            X
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{data.role}</strong>
        </div>
        <div>{data.description}</div>
        <NodeInput
          placeholder="역할 내용을 입력하세요..."
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
