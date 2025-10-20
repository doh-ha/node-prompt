import React from "react";
import { NodeShell } from "../NodeShell";

interface PdfOutputNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const PdfOutputNode: React.FC<PdfOutputNodeProps> = ({ data, selected, id }) => {
  return (
    <NodeShell
      id={id}
      selected={selected}
      title={data.label}
      icon={data.icon}
      iconColor={data.iconColor}
      bg={(data as any).nodeBg}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
      nodeType="output"
    >
      <div
        style={{
          padding: "12px",
          backgroundColor: "#f8fafc",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          marginTop: "8px",
          minHeight: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        파일이 여기에 생성됩니다
      </div>
    </NodeShell>
  );
};
