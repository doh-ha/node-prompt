import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { NodeShell } from "../NodeShell";
import { Button } from "../../ui";
import { NodeInput } from "../../../styles/nodeStyles";
import { useAutosizeTextArea } from "../../../hooks/useAutosizeTextArea";

interface StartNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    content?: string;
    flowName?: string;
    onContentChange?: (content: string) => void;
    onFlowNameChange?: (flowName: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const StartNode: React.FC<StartNodeProps> = ({ data, selected, id }) => {
  const [flowName, setFlowName] = useState(data.flowName || "Flow 1");
  const textAreaRef = useAutosizeTextArea(flowName);

  // data.flowName이 변경되면 로컬 상태도 업데이트
  React.useEffect(() => {
    if (data.flowName && data.flowName !== flowName) {
      setFlowName(data.flowName);
    }
  }, [data.flowName]);

  const handleStart = () => {
    if (data.onContentChange) {
      data.onContentChange("START");
    }
  };

  const handleFlowNameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFlowName(e.target.value);
  };

  const handleFlowNameBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (data.onFlowNameChange) {
      data.onFlowNameChange(e.target.value);
    }
  };

  return (
    <div style={{ width: "180px", minHeight: "120px" }}>
      <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={(data as any).nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
        <NodeInput
          ref={textAreaRef}
          placeholder="flow 이름을 입력하세요..."
          value={flowName}
          onChange={handleFlowNameChange}
          onBlur={handleFlowNameBlur}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{ marginBottom: "6px", fontSize: "11px", minHeight: "24px", maxHeight: "32px" }}
        />
        <Button onClick={handleStart} variant="primary" size="small" style={{ width: "100%", fontSize: "12px", padding: "4px 8px", height: "28px" }}>
          START
        </Button>
      </NodeShell>
    </div>
  );
};
