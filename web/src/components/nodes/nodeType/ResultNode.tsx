import React from "react";
import { NodeShell } from "../NodeShell";
import { NodeInput } from "../../../styles/nodeStyles";

interface ResultNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    content?: string;
    result?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ResultNode: React.FC<ResultNodeProps> = ({ data, selected, id }) => {
  return (
    <div style={{ width: "220px", minHeight: "120px" }}>
      <NodeShell
        id={id}
        selected={selected}
        title={data.label}
        icon={data.icon}
        iconColor={data.iconColor}
        bg={(data as any).nodeBg}
        onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
        nodeType="result"
      >
        <NodeInput as="textarea" readOnly placeholder="결과가 여기에 표시됩니다" value={data.result || ""} style={{ minHeight: "80px" }} />
      </NodeShell>
    </div>
  );
};
