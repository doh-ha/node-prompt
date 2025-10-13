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
  const [isEditing, setIsEditing] = useState(false);
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
    setIsEditing(true);
  };

  const handleFlowNameBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // 포커스 이탈 시에는 편집 모드만 해제, 실제 업데이트는 submit 버튼으로
    setIsEditing(false);
  };

  const handleSubmitFlowName = () => {
    if (data.onFlowNameChange) {
      data.onFlowNameChange(flowName);
    }
    setIsEditing(false);
  };

  return (
    <div style={{ width: "180px", minHeight: "120px" }}>
      <NodeShell
        id={id}
        selected={selected}
        title={data.label}
        icon={data.icon}
        iconColor={data.iconColor}
        bg={(data as any).nodeBg}
        onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
        nodeType="start"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
          <NodeInput
            ref={textAreaRef}
            placeholder="flow 이름을 입력하세요..."
            value={flowName}
            onChange={handleFlowNameChange}
            onBlur={handleFlowNameBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              fontSize: "11px",
              minHeight: "24px",
              maxHeight: "32px",
              border: isEditing ? "2px solid #4f46e5" : "1px solid #d1d5db",
            }}
          />
          <button
            onClick={handleSubmitFlowName}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: isEditing ? "#4f46e5" : "#e5e7eb",
              border: "none",
              borderRadius: "4px",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              opacity: isEditing ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (isEditing) {
                e.currentTarget.style.background = "#4338ca";
              }
            }}
            onMouseLeave={(e) => {
              if (isEditing) {
                e.currentTarget.style.background = "#4f46e5";
              }
            }}
          >
            <span style={{ color: isEditing ? "white" : "#6b7280", fontSize: "12px" }}>✓</span>
          </button>
        </div>
        <Button onClick={handleStart} variant="primary" size="small" style={{ width: "100%", fontSize: "12px", padding: "4px 8px", height: "28px" }}>
          START
        </Button>
      </NodeShell>
    </div>
  );
};
