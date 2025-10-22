import React from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";

interface ModelNodeProps {
  data: {
    model: string;
    temperature: number;
    maxTokens: number;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
    onModelChange?: (model: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ModelNode: React.FC<ModelNodeProps> = ({ data, selected, id }) => {
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
      <select
        value={data.model}
        onChange={(e) => data.onModelChange?.(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", width: "100%" }}
      >
        <option value="gpt-4o">gpt-4o</option>
        <option value="gpt-4o-mini">gpt-4o-mini</option>
        <option value="gpt-4.1">gpt-4.1</option>
        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
      </select>
    </NodeShell>
  );
};
