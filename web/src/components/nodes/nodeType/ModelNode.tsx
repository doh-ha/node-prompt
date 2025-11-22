import React, { useState, useRef, useEffect } from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { DEFAULT_MODEL } from "../../../constants";

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

const modelInfo: Record<string, { name: string; description: string }> = {
  "gpt-4o": {
    name: "gpt-4o",
    description: "글·그림·음성까지 잘 다루는 가장 똑똑한 모델로, 복잡한 문제나 멀티미디어 작업에 적합",
  },
  "gpt-5-instant": {
    name: "gpt-5-instant",
    description: "초고속 응답이 가능한 GPT-5 모델로, 빠른 응답이 필요한 작업에 최적화",
  },
  "gpt-5-thinking": {
    name: "gpt-5-thinking",
    description: "심층 추론 능력을 갖춘 GPT-5 모델로, 복잡한 문제 해결이나 논리적 분석에 적합",
  },
};

export const ModelNode: React.FC<ModelNodeProps> = ({ data, selected, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // 모델이 존재하지 않으면 기본값으로 gpt-5-instant 사용
  const currentModel = modelInfo[data.model] || modelInfo["gpt-5-instant"] || { name: "gpt-5-instant", description: "초고속 응답이 가능한 GPT-5 모델" };

  return (
    <NodeShell
      id={id}
      selected={selected}
      title={(data as any).label}
      icon={(data as any).icon}
      iconColor={(data as any).iconColor}
      bg={(data as any).nodeBg}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
      nodeType="model"
    >
      <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
        {/* 선택된 값 표시 (모델 이름만) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            if (selectRef.current) {
              selectRef.current.focus();
              selectRef.current.size = isOpen ? 1 : 4;
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <span>{currentModel.name}</span>
          <span style={{ fontSize: "10px", color: "#6b7280" }}>▼</span>
        </div>

        {/* 실제 select (드롭다운 열었을 때만 표시) */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              maxHeight: "300px",
              overflowY: "auto",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {Object.entries(modelInfo).map(([value, info]) => (
              <div
                key={value}
                onClick={(e) => {
                  e.stopPropagation();
                  data.onModelChange?.(value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f3f4f6",
                  backgroundColor: data.model === value ? "#f0f9ff" : "white",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (data.model !== value) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (data.model !== value) {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px", color: "#111827" }}>{info.name}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.4" }}>{info.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* 숨겨진 select (접근성 및 폼 제출용) */}
        <select
          ref={selectRef}
          value={data.model}
          onChange={(e) => {
            data.onModelChange?.(e.target.value);
            setIsOpen(false);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            width: "1px",
            height: "1px",
          }}
          tabIndex={-1}
        >
          {Object.keys(modelInfo).map((value) => (
            <option key={value} value={value}>
              {modelInfo[value].name}
            </option>
          ))}
        </select>
      </div>
    </NodeShell>
  );
};
