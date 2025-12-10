import React, { useState, useEffect } from "react";
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
  const [nodeHeight, setNodeHeight] = useState(120);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // 텍스트 길이에 따라 노드 높이 자동 조정
  useEffect(() => {
    if (textareaRef.current && data.result) {
      const textarea = textareaRef.current;

      // 스크롤 높이를 측정하기 위해 임시로 높이를 리셋
      textarea.style.height = "auto";

      // 스크롤 높이 계산 (최소 80px, 최대 300px)
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(80, Math.min(300, scrollHeight + 40)); // 40px는 헤더 공간

      // 노드 전체 높이 설정
      setNodeHeight(newHeight);

      // 텍스트 영역 높이 설정
      textarea.style.height = `${newHeight - 40}px`;
    }
  }, [data.result]);

  return (
    <div style={{ width: "220px", minHeight: `${nodeHeight}px` }}>
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
        <NodeInput
          ref={textareaRef}
          as="textarea"
          readOnly
          placeholder="Result will be displayed here"
          value={data.result || ""}
          style={{
            minHeight: "80px",
            maxHeight: "260px",
            resize: "none",
            overflow: "auto",
            width: "100%",
          }}
        />
      </NodeShell>
    </div>
  );
};
