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
  };
  selected?: boolean;
  id?: string;
}

export const OutputNode: React.FC<OutputNodeProps> = ({ data, selected, id }) => {
  const [nodeHeight, setNodeHeight] = useState(120);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isTextFormat = data.format === "text" || data.format === "markdown" || data.format === "table" || !data.format;
  const isFileFormat = data.format === "JSON" || data.format === "csv" || data.format === "pdf";

  // 텍스트 길이에 따라 노드 높이 자동 조정
  useEffect(() => {
    if (textareaRef.current && data.result && isTextFormat) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(120, Math.min(300, scrollHeight + 80));
      setNodeHeight(newHeight);
      textarea.style.height = `${newHeight - 80}px`;
    }
  }, [data.result, isTextFormat]);

  const handleDownload = () => {
    if (!data.result) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);

    if (data.format === "csv") {
      // CSV 다운로드
      const csvContent = convertToCSV(data.result);
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
        let jsonContent = data.result;
        try {
          const parsed = JSON.parse(data.result);
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
    if (!data.result) return;

    try {
      // 서버에서 PDF 생성
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: data.result }),
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
        // 서버 API가 없으면 클라이언트에서 간단한 PDF 생성
        generateClientSidePDF(data.result);
      }
    } catch (error) {
      console.error("PDF 생성 실패, 클라이언트에서 생성 시도:", error);
      // 서버 API가 없으면 클라이언트에서 간단한 PDF 생성
      generateClientSidePDF(data.result);
    }
  };

  const generateClientSidePDF = (text: string) => {
    // 간단한 방법: HTML을 PDF로 변환 (브라우저 인쇄 기능 활용)
    // 사용자가 "PDF로 저장" 옵션을 선택할 수 있도록 인쇄 다이얼로그 열기
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("팝업이 차단되었습니다. PDF를 다운로드하려면 팝업을 허용해주세요.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PDF Export</title>
          <style>
            @media print {
              @page { margin: 2cm; }
            }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              white-space: pre-wrap; 
              line-height: 1.6;
            }
          </style>
        </head>
        <body>${text.replace(/\n/g, "<br>").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
      </html>
    `);
    printWindow.document.close();

    // 인쇄 다이얼로그 열기 (사용자가 "PDF로 저장" 선택 가능)
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

        {isTextFormat && (
          <div style={{ marginTop: 8 }}>
            <NodeInput
              ref={textareaRef}
              as="textarea"
              readOnly
              placeholder="결과가 여기에 표시됩니다"
              value={data.result || ""}
              style={{
                minHeight: "80px",
                maxHeight: "260px",
                resize: "none",
                overflow: "auto",
                width: "100%",
              }}
            />
          </div>
        )}

        {isFileFormat && (
          <div style={{ marginTop: 8 }}>
            {data.result ? (
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
