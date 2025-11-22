import React, { useState, useEffect, useRef } from "react";
import { NodeShell } from "../NodeShell";
import { NodeInput } from "../../../styles/nodeStyles";
import { OutputRecommendationPanel } from "../../ui/OutputRecommendationPanel";
import { RiLightbulbLine } from "react-icons/ri";
import { colors } from "../../../constants";

interface OutputNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    result?: string;
    customName?: string;
    showNameInput?: boolean;
    onNameChange?: (name: string) => void;
    onDeleteNode?: (id: string) => void;
    onSizeChange?: (width: number, height: number) => void;
    width?: number;
    maxHeight?: number;
  };
  selected?: boolean;
  id?: string;
}

export const OutputNode: React.FC<OutputNodeProps> = ({ data, selected, id }) => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const lastSizeRef = useRef<{ width: number; height: number } | null>(null);

  const [showPanel, setShowPanel] = useState(false);
  const maxHeight = data.maxHeight || 600;

  /** Flow result에서 마지막 값 추출 */
  const getDisplayResult = () => {
    const r = data.result;
    if (!r) return "";
    if (typeof r === "object" && !Array.isArray(r)) {
      const keys = Object.keys(r);
      return keys.length ? r[keys[keys.length - 1]] : "";
    }
    return typeof r === "string" ? r : "";
  };

  const displayResult = getDisplayResult();

  /** 텍스트 박스 자동 리사이즈 */
  useEffect(() => {
    if (!textRef.current || !wrapperRef.current || !data.onSizeChange) return;

    const textarea = textRef.current;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    const textAreaHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${textAreaHeight}px`;

    // 텍스트 길이에 따라 노드 너비 자동 조정
    const baseWidth = 300; // 기본 너비
    const minWidth = 250; // 최소 너비
    const maxWidth = 800; // 최대 너비

    const textLength = displayResult.length;
    let nodeWidth = baseWidth;

    if (textLength > 500) {
      nodeWidth = Math.min(maxWidth, baseWidth + Math.floor((textLength - 500) / 10));
    } else if (textLength > 200) {
      nodeWidth = baseWidth + 50;
    }

    // 기존 width가 설정되어 있고, 계산된 너비보다 크면 기존 값 사용
    if (data.width && data.width > nodeWidth) {
      nodeWidth = data.width;
    }

    // 최소/최대 너비 제한
    nodeWidth = Math.max(minWidth, Math.min(maxWidth, nodeWidth));

    // wrapper 높이 반영하여 노드 전체 height 자동 반영
    const wrapperHeight = wrapperRef.current.offsetHeight;
    const newHeight = wrapperHeight + 60; // 헤더 포함 보정치

    // 이전 값과 비교하여 실제로 변경이 있을 때만 업데이트 (무한 루프 방지)
    const lastSize = lastSizeRef.current;
    if (!lastSize || lastSize.width !== nodeWidth || lastSize.height !== newHeight) {
      lastSizeRef.current = { width: nodeWidth, height: newHeight };
      data.onSizeChange(nodeWidth, newHeight);
    }
  }, [displayResult, maxHeight, data.onSizeChange]);

  /** 외부 클릭 시 추천 패널 닫기 */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    if (showPanel) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPanel]);

  return (
    <div ref={nodeRef} style={{ position: "relative" }}>
      <NodeShell
        id={id}
        selected={selected}
        icon={data.icon}
        iconColor={colors.nodeIcon.blue}
        bg={colors.nodeBg.lightGreen}
        title={data.label}
        customName={data.customName}
        showNameInput={data.showNameInput}
        onNameChange={data.onNameChange}
        onDelete={id ? () => data.onDeleteNode?.(id) : undefined}
        containerStyle={{
          width: data.width || 300,
          minWidth: data.width || 300,
          maxWidth: data.width || 300,
          paddingBottom: 12,
        }}
      >
        {/* 내부 래퍼 (실제 height 측정 대상) */}
        <div
          ref={wrapperRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            position: "relative",
          }}
        >
          {displayResult ? (
            <NodeInput
              as="textarea"
              ref={textRef}
              readOnly
              value={displayResult}
              style={{
                width: "100%",
                resize: "none",
                overflowY: "scroll",
                lineHeight: 1.45,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                padding: "10px",
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <div
              style={{
                border: "2px dashed #d1d5db",
                background: "#f9fafb",
                color: "#9ca3af",
                borderRadius: 8,
                padding: "16px",
                minHeight: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontStyle: "italic",
                fontSize: 13,
              }}
            >
              결과가 여기에 표시됩니다
            </div>
          )}

          {/* 추천 아이콘 */}
          {displayResult && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPanel((p) => !p);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: showPanel ? "#4f46e5" : "white",
                  color: showPanel ? "white" : "#4f46e5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {React.createElement(RiLightbulbLine as any, { size: 18 })}
              </button>
            </div>
          )}
        </div>

        {showPanel && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              right: 8,
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: "white",
                padding: 16,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                maxHeight: 300,
                overflowY: "auto",
                boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
              }}
            >
              <OutputRecommendationPanel isVisible={showPanel} currentPrompt={""} outputResult={displayResult} onClose={() => setShowPanel(false)} />
            </div>
          </div>
        )}
      </NodeShell>
    </div>
  );
};
