import React from "react";
import { NodeShell } from "../NodeShell";
import { Button } from "../../ui";

interface StartNodeProps {
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

export const StartNode: React.FC<StartNodeProps> = ({ data, selected, id }) => {
  const handleStart = () => {
    if (data.onContentChange) {
      data.onContentChange("START");
    }
  };

  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={(data as any).nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      <Button onClick={handleStart} variant="primary" size="large" style={{ width: "100%", marginTop: "8px" }}>
        START
      </Button>
    </NodeShell>
  );
};
