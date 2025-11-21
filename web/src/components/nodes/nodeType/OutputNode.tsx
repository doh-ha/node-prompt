import React, { useState, useEffect } from "react";
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
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
    format?: string;
    onFormatChange?: (format: string) => void;
    result?: string;
    showNameInput?: boolean;
    customName?: string;
    onNameChange?: (name: string) => void;
    onSizeChange?: (width: number, height: number) => void;
    width?: number;
    height?: number;
    maxHeight?: number;
  };
  selected?: boolean;
  id?: string;
}

export const OutputNode: React.FC<OutputNodeProps> = ({ data, selected, id }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false);

  // 최대 높이 계산 (사용자 지정 또는 기본값)
  const maxHeight = data.maxHeight || 600;
  const headerHeight = 40; // NodeShell 헤더 높이
  const padding = 32; // 상하 여백
  const minTextAreaHeight = 80;

  // Flow별 결과에서 현재 표시할 결과 추출
  const getDisplayResult = (): string => {
    const result = data.result;
    if (!result) return "";

    // 결과가 객체 형태면 (Flow별 결과 저장)
    if (typeof result === "object" && !Array.isArray(result)) {
      // 가장 최근에 실행된 Flow의 결과를 표시 (마지막 키의 값)
      const flowNames = Object.keys(result);
      if (flowNames.length > 0) {
        // 마지막 Flow의 결과 반환 (가장 최근 실행)
        return result[flowNames[flowNames.length - 1]] || "";
      }
      return "";
    }

    // 문자열이면 그대로 반환
    return typeof result === "string" ? result : "";
  };

  const displayResult = getDisplayResult();

  // 전체 프롬프트 가져오기
  const currentPrompt = (data as any).currentFullPrompt || "";

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
        setShowRecommendationPanel(false);
      }
    };

    if (showRecommendationPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRecommendationPanel]);

  // 텍스트 길이에 따라 노드 크기 자동 조정
  useEffect(() => {
    if (!data.onSizeChange || !textareaRef.current) return;

    // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 크기 계산
    const timeoutId = setTimeout(() => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;

        // 텍스트 영역 높이 자동 조정
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;

        // 텍스트 영역 높이 계산 (최소 높이 보장)
        const textAreaHeight = Math.max(minTextAreaHeight, scrollHeight);

        // 노드 전체 높이 계산 (헤더 + 텍스트영역 + 여백)
        const newHeight = Math.max(120, Math.min(maxHeight, headerHeight + textAreaHeight + padding));

        // 텍스트 영역 높이 설정
        textarea.style.height = `${textAreaHeight}px`;

        // 노드 너비 계산: 텍스트 길이에 따라 자동으로 증가
        const baseWidth = 300; // 기본 너비
        const minWidth = 250; // 최소 너비
        const maxWidth = 800; // 최대 너비

        // 텍스트 길이에 따라 너비 계산
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

        // 크기 변경 콜백 호출
        if (data.onSizeChange) {
          data.onSizeChange(nodeWidth, newHeight);
        }
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [displayResult, data.onSizeChange, data.width, data.maxHeight, headerHeight, padding, minTextAreaHeight]);

  // 노드 크기 스타일 계산 - NodeContainer에 직접 적용
  const containerStyle: React.CSSProperties = {};
  if (data.width) {
    containerStyle.width = `${data.width}px`;
    containerStyle.minWidth = `${data.width}px`;
    containerStyle.maxWidth = `${data.width}px`;
  }
  if (data.height) {
    containerStyle.height = `${data.height}px`;
    containerStyle.minHeight = `${data.height}px`;
    containerStyle.maxHeight = `${data.height}px`;
  }

  return (
    <div ref={nodeRef} style={{ position: "relative" }}>
      <NodeShell
        id={id}
        selected={selected}
        title={data.label}
        icon={data.icon}
        iconColor={data.iconColor}
        bg={colors.nodeBg.lightGreen}
        onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
        nodeType="output"
        showNameInput={data.showNameInput}
        customName={data.customName}
        onNameChange={data.onNameChange}
        containerStyle={containerStyle}
      >
        <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
          {displayResult ? (
            <NodeInput
              ref={textareaRef}
              as="textarea"
              readOnly
              value={displayResult || ""}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onSelect={(e) => {
                e.stopPropagation();
              }}
              style={{
                minHeight: `${minTextAreaHeight}px`,
                resize: "none",
                overflow: "auto",
                width: "100%",
                fontFamily: "inherit",
                userSelect: "text",
                WebkitUserSelect: "text",
                MozUserSelect: "text",
                msUserSelect: "text",
                boxSizing: "border-box",
                border: "none",
                background: "white",
                padding: "8px",
                borderRadius: "4px",
              }}
            />
          ) : (
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                border: "2px dashed #d1d5db",
                background: "#f9fafb",
                color: "#9ca3af",
                fontSize: "13px",
                textAlign: "center",
                minHeight: `${minTextAreaHeight}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontStyle: "italic",
              }}
            >
              결과가 여기에 표시됩니다
            </div>
          )}

          {/* 추천 버튼 - NodeInput 외부, NodeShell 내부 오른쪽 하단 */}
          {displayResult && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRecommendationPanel(!showRecommendationPanel);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  background: showRecommendationPanel ? "#4f46e5" : "white",
                  color: showRecommendationPanel ? "white" : "#4f46e5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!showRecommendationPanel) {
                    e.currentTarget.style.background = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showRecommendationPanel) {
                    e.currentTarget.style.background = "white";
                  }
                }}
                title="추천 보기"
              >
                {React.createElement(RiLightbulbLine as any, { size: 18 })}
              </button>
            </div>
          )}
        </div>
        {showRecommendationPanel && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              right: "8px",
              maxHeight: "300px",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                padding: "16px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              <OutputRecommendationPanel currentPrompt={currentPrompt} outputResult={displayResult} isVisible={showRecommendationPanel} onClose={() => setShowRecommendationPanel(false)} />
            </div>
          </div>
        )}
      </NodeShell>
    </div>
  );
};
