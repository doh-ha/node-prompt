import React from "react";
import { Handle, Position } from "reactflow";
import { NodeContainer, NodeHeader, NodeIcon, NodeContent, NodeInput, DeleteButton } from "../../styles/nodeStyles";
import { operatorLabels } from "../../data/nodeTemplates";

interface ConditionNodeProps {
  data: {
    condition: string;
    operator: string;
    value: string;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#fecaca", color: "#dc2626" }}>⚡</NodeIcon>
        조건
        {selected && id && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            X
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{data.condition}</strong>
        </div>
        <div>
          {operatorLabels[data.operator]} {data.value}
        </div>
        <NodeInput
          placeholder="조건 내용을 입력하세요..."
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
