import React from "react";
import { NodeShell } from "../NodeShell";

interface ResultNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ResultNode: React.FC<ResultNodeProps> = ({ data, selected, id }) => {
  return (
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
      <div
        style={{
          padding: "12px",
          backgroundColor: "#f8fafc",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          marginTop: "8px",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {data.content || "결과가 여기에 표시됩니다"}
      </div>
    </NodeShell>
  );
};
