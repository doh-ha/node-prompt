import React from "react";
import { NodeShell } from "../NodeShell";
import { colors } from "../../../constants";

interface FlowNodeProps {
  data: {
    onDeleteNode?: (id: string) => void;
  };
  id?: string;
  selected?: boolean;
}

export const FlowNode: React.FC<FlowNodeProps> = ({ data, id, selected }) => {
  return (
    <NodeShell
      id={id}
      selected={selected}
      title="Flow"
      icon="🔄"
      iconColor={colors.nodeIcon.purple}
      bg={colors.nodeBg.purple}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
      nodeType="flow"
    >
      <div style={{ padding: "8px", fontSize: "12px", color: colors.gray[600], textAlign: "center" }}>
        완전한 워크플로우
        <br />
        (4개 노드)
      </div>
    </NodeShell>
  );
};
