import React from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";

interface TaskNodeProps {
  data: {
    template: string;
    variables: string[];
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const TaskNode: React.FC<TaskNodeProps> = ({ data, selected, id }) => {
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
      <NodeInput
        placeholder="수행할 작업(지시문)을 입력하세요..."
        defaultValue={data.content ?? ""}
        onBlur={(e) => data.onContentChange?.(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </NodeShell>
  );
};
