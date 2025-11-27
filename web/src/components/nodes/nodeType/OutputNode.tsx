import React, { useState, useEffect, useRef } from "react";
import { NodeShell } from "../NodeShell";
import { NodeInput } from "../../../styles/nodeStyles";
import { OutputRecommendationPanel } from "../../ui/OutputRecommendationPanel";
import { RiLightbulbLine, RiZoomInLine } from "react-icons/ri";
import { colors } from "../../../constants";

interface OutputNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    result?: string;
    format?: string;
    onFormatChange?: (format: string) => void;
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
  const [showModal, setShowModal] = useState(false);
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

    // wrapper 높이 반영하여 노드 전체 height 자동 반영
    const wrapperHeight = wrapperRef.current.offsetHeight;
    const newHeight = wrapperHeight + 60; // 헤더 포함 보정치

    // 이전 값과 비교하여 실제로 변경이 있을 때만 업데이트 (무한 루프 방지)
    // data.width가 있으면 너비도 함께 업데이트, 없으면 높이만 업데이트 (너비는 자동 조정)
    const lastSize = lastSizeRef.current;
    if (data.width) {
      // width가 설정되어 있으면 너비와 높이 모두 업데이트
      if (!lastSize || lastSize.width !== data.width || lastSize.height !== newHeight) {
        lastSizeRef.current = { width: data.width, height: newHeight };
        data.onSizeChange(data.width, newHeight);
      }
    } else {
      // width가 없으면 높이만 업데이트 (너비는 자동 조정되므로 업데이트하지 않음)
      if (!lastSize || lastSize.height !== newHeight) {
        lastSizeRef.current = { width: 0, height: newHeight };
        // 높이만 업데이트하려면 기존 width를 유지하거나 업데이트하지 않음
        // 다른 노드들처럼 컨텐츠에 맞춰 자동으로 너비가 조정됨
      }
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
          ...(data.width ? { width: data.width, minWidth: data.width, maxWidth: data.width } : {}),
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
          {/* Format 드롭다운 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#6b7280",
                whiteSpace: "nowrap",
              }}
            >
              형식:
            </label>
            <select
              value={data.format || "text"}
              onChange={(e) => {
                e.stopPropagation();
                data.onFormatChange?.(e.target.value);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                padding: "6px 8px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                fontSize: 13,
                backgroundColor: "white",
                color: "#374151",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="text">텍스트</option>
              <option value="csv">CSV</option>
              <option value="markdown">Markdown</option>
              <option value="table">Table</option>
            </select>
          </div>
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

          {/* 버튼들 */}
          {displayResult && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  color: "#4f46e5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="확대"
              >
                {React.createElement(RiZoomInLine as any, { size: 18 })}
              </button>
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
                title="추천 보기"
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

      {/* 확대 모달 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "50vw",
            height: "100vh",
            //backgroundColor: "rgba(0, 0, 0, 0.5)",
            backgroundColor: "transparent",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              width: "50vw",
              maxWidth: "80vw",
              height: "98vh",
              maxHeight: "98vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#111827" }}>전체 내용</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 24,
                  color: "#6b7280",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                ×
              </button>
            </div>

            {/* 내용 */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 32,
                backgroundColor: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 15,
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "monospace",
                minHeight: 0,
              }}
            >
              {displayResult || "내용이 없습니다."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
