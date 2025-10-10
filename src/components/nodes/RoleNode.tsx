import React from "react";
import { NodeInput } from "../../styles/nodeStyles";
import { NodeShell } from "./NodeShell";

interface RoleNodeProps {
  data: {
    role: string;
    description: string;
    examples: string[];
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
  };
  selected?: boolean;
  id?: string;
}

export const RoleNode: React.FC<RoleNodeProps> = ({ data, selected, id }) => {
  const headerTitle = data.label || "역할 정의";
  const headerIcon = data.icon || "🎭";
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
    </NodeShell>
  );
};
