import React, { useState, useEffect } from "react";
import { NodeShell } from "../NodeShell";
import { NodeInput } from "../../../styles/nodeStyles";

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
  };
  selected?: boolean;
  id?: string;
}

export const OutputNode: React.FC<OutputNodeProps> = ({ data, selected, id }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isTextFormat = data.format === "text" || data.format === "markdown" || data.format === "table" || data.format === "JSON" || !data.format;
  const isFileFormat = data.format === "JSON" || data.format === "csv" || data.format === "pdf";
  const showTextArea = isTextFormat || data.format === "JSON"; // JSON 형식일 때도 텍스트 영역 표시

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

  // 텍스트 길이에 따라 노드 크기 자동 조정
  useEffect(() => {
    if (!data.onSizeChange || !showTextArea) return;

    // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 크기 계산
    const timeoutId = setTimeout(() => {
      if (textareaRef.current && containerRef.current) {
        const textarea = textareaRef.current;
        const container = containerRef.current;

        // 텍스트 영역 높이 자동 조정
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;

        // 최소 높이: 120px, 최대 높이: 800px (더 많은 텍스트를 볼 수 있도록)
        const minHeight = 120;
        const maxHeight = 800;
        const textAreaHeight = Math.max(80, Math.min(720, scrollHeight));

        // 노드 전체 높이 계산 (헤더 + 선택박스 + 텍스트영역 + 여백)
        const headerHeight = 40; // NodeShell 헤더 높이
        const selectHeight = 36; // 선택박스 높이
        const padding = 32; // 상하 여백
        const newHeight = Math.max(minHeight, Math.min(maxHeight, headerHeight + selectHeight + textAreaHeight + padding));

        // 텍스트 영역 높이 설정
        textarea.style.height = `${textAreaHeight}px`;

        // 노드 너비는 기본값 유지 (220px) 또는 기존 width 사용
        const nodeWidth = data.width || 220;

        // 크기 변경 콜백 호출
        if (data.onSizeChange) {
          data.onSizeChange(nodeWidth, newHeight);
        }
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [displayResult, showTextArea, data.onSizeChange, data.width]);

  const handleDownload = () => {
    const resultToDownload = getDisplayResult();
    if (!resultToDownload) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);

    if (data.format === "csv") {
      // CSV 다운로드
      const csvContent = convertToCSV(resultToDownload);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `output_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (data.format === "JSON") {
      // JSON 다운로드
      try {
        // JSON 형식인지 확인하고 파싱 시도
        let jsonContent = resultToDownload;
        try {
          const parsed = JSON.parse(resultToDownload);
          jsonContent = JSON.stringify(parsed, null, 2);
        } catch {
          // JSON이 아니면 그대로 사용
        }
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `output_${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("JSON 다운로드 실패:", error);
      }
    } else if (data.format === "pdf") {
      // PDF 다운로드
      handleDownloadPDF();
    }
  };

  const convertToCSV = (text: string): string => {
    // 텍스트를 CSV 형식으로 변환
    // 줄바꿈으로 구분된 텍스트를 CSV 행으로 변환
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return "";

    // 첫 줄이 헤더처럼 보이면 그대로 사용, 아니면 기본 헤더 추가
    const csvLines = lines.map((line) => {
      // 쉼표나 탭이 있으면 그대로 사용, 없으면 전체를 하나의 컬럼으로
      if (line.includes(",") || line.includes("\t")) {
        return line;
      }
      return `"${line.replace(/"/g, '""')}"`;
    });

    return csvLines.join("\n");
  };

  const handleDownloadPDF = async () => {
    const resultToDownload = getDisplayResult();
    if (!resultToDownload) return;

    try {
      // 서버에서 PDF 생성
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: resultToDownload }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
        link.href = url;
        link.download = `output_${timestamp}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("PDF 생성 API에 연결할 수 없습니다.");
      }
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      alert("PDF 생성 API에 연결할 수 없습니다.");
    }
  };

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
      showNameInput={data.showNameInput}
      customName={data.customName}
      onNameChange={data.onNameChange}
    >
      <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <select
          value={data.format || "text"}
          onChange={(e) => data.onFormatChange?.(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", width: "100%" }}
        >
          <option value="text">text</option>
          <option value="table">table</option>
          <option value="markdown">markdown</option>
          <option value="JSON">JSON</option>
          <option value="csv">csv</option>
          <option value="pdf">pdf</option>
        </select>

        {showTextArea && (
          <div style={{ marginTop: 8 }}>
            {displayResult ? (
              <NodeInput
                ref={textareaRef}
                as="textarea"
                readOnly
                value={
                  data.format === "JSON" && displayResult
                    ? (() => {
                        try {
                          const parsed = JSON.parse(displayResult);
                          return JSON.stringify(parsed, null, 2);
                        } catch {
                          return displayResult;
                        }
                      })()
                    : displayResult || ""
                }
                onMouseDown={(e) => {
                  // 텍스트 선택을 허용하기 위해 이벤트 전파만 막음
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  // 텍스트 선택을 허용하기 위해 이벤트 전파만 막음
                  e.stopPropagation();
                }}
                onSelect={(e) => {
                  // 텍스트 선택 시 이벤트 전파 막기
                  e.stopPropagation();
                }}
                style={{
                  minHeight: "80px",
                  maxHeight: "720px",
                  resize: "none",
                  overflow: "auto",
                  width: "100%",
                  fontFamily: data.format === "JSON" ? "monospace" : "inherit",
                  userSelect: "text",
                  WebkitUserSelect: "text",
                  MozUserSelect: "text",
                  msUserSelect: "text",
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
                  minHeight: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontStyle: "italic",
                }}
              >
                결과가 여기에 표시됩니다
              </div>
            )}
          </div>
        )}

        {isFileFormat && (
          <div style={{ marginTop: 8 }}>
            {displayResult ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#4f46e5",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  width: "100%",
                }}
              >
                {data.format === "pdf" ? "PDF 다운로드" : data.format === "csv" ? "CSV 다운로드" : data.format === "JSON" ? "JSON 다운로드" : "파일 다운로드"}
              </button>
            ) : (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#6b7280",
                  fontSize: 12,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Flow를 실행하면 파일이 생성됩니다
              </div>
            )}
          </div>
        )}
      </div>
    </NodeShell>
  );
};
