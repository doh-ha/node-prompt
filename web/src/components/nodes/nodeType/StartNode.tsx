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
    onExecutePrompt?: (prompt: string, startNodeId?: string) => Promise<void>;
  };
  selected?: boolean;
  id?: string;
}

export const StartNode: React.FC<StartNodeProps> = ({ data, selected, id }) => {
  const [flowName, setFlowName] = useState(data.flowName || "Flow 1");
  const [isExecuting, setIsExecuting] = useState(false);
  const textAreaRef = useAutosizeTextArea(flowName);

  // data.flowName이 변경되면 로컬 상태도 업데이트
  React.useEffect(() => {
    if (data.flowName && data.flowName !== flowName) {
      setFlowName(data.flowName);
    }
  }, [data.flowName]);

  const handleStart = async () => {
    if (data.onContentChange) {
      data.onContentChange("START");
    }

    // 프롬프트 실행 기능이 있으면 실행
    if (data.onExecutePrompt && id) {
      setIsExecuting(true);
      try {
        await data.onExecutePrompt("", id);
      } catch (error) {
        console.error("❌ 프롬프트 실행 중 오류:", error);
      } finally {
        setIsExecuting(false);
      }
    }
  };

  const handleFlowNameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFlowName(e.target.value);
  };

  const handleFlowNameBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // 포커스 이탈 시 변경사항 적용
    if (data.onFlowNameChange) {
      data.onFlowNameChange(e.target.value);
    }
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
        <NodeInput
          ref={textAreaRef}
          placeholder="flow 이름을 입력하세요..."
          value={flowName}
          onChange={handleFlowNameChange}
          onBlur={handleFlowNameBlur}
          onPaste={(e) => e.stopPropagation()}
          onCopy={(e) => e.stopPropagation()}
          onCut={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{ marginBottom: "6px", fontSize: "11px", minHeight: "24px", maxHeight: "32px" }}
        />
        <Button onClick={handleStart} variant="primary" size="small" disabled={isExecuting} style={{ width: "100%", fontSize: "12px", padding: "4px 8px", height: "28px" }}>
          {isExecuting ? "실행 중..." : "START"}
        </Button>
      </NodeShell>
    </div>
  );
};
