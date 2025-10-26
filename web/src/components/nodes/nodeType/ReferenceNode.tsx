import React, { useState, useRef } from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { Button } from "../../ui";
import { RadioSuggestions } from "../RadioSuggestions";

interface ReferenceNodeProps {
  data: {
    content: string;
    fileName?: string;
    label?: string;
    icon?: string;
    iconColor?: string;
    nodeBg?: string;
    onContentChange?: (content: string, fileName?: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ReferenceNode: React.FC<ReferenceNodeProps> = ({ data, selected, id }) => {
  const [inputMode, setInputMode] = useState<"text" | "file">("file");
  const [fileName, setFileName] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      setFileName(fileName);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
        // 파일 업로드 시 직접 입력 필드 비우기
        setTextContent("");
        if (data.onContentChange) {
          data.onContentChange(content, fileName);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (content: string) => {
    setTextContent(content);
    if (inputMode === "text" && data.onContentChange) {
      data.onContentChange(content);
    }
  };

  const handleModeChange = (mode: "text" | "file") => {
    setInputMode(mode);
    if (mode === "text") {
      // 직접 입력 모드로 전환 시 파일 관련 상태 초기화
      setFileName("");
      setFileContent("");
      setTextContent("");
      if (data.onContentChange) {
        data.onContentChange("");
      }
    } else {
      // 파일 업로드 모드로 전환 시 텍스트 내용 초기화
      setTextContent("");
      if (data.onContentChange) {
        data.onContentChange("");
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      <RadioSuggestions
        suggestions={["파일 업로드", "직접 입력"]}
        selectedValue={inputMode === "file" ? "파일 업로드" : "직접 입력"}
        onSelectionChange={(value) => {
          if (value === "파일 업로드") {
            handleModeChange("file");
          } else {
            handleModeChange("text");
          }
        }}
      />

      {inputMode === "text" ? (
        <NodeInput
          placeholder="참고 자료나 문헌을 입력하세요..."
          defaultValue={textContent}
          onBlur={(e) => {
            handleTextChange(e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div>
          <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: "none" }} />
          <div style={{ width: "100%", marginBottom: "8px" }}>
            <Button size="small" variant="secondary" onClick={handleFileButtonClick} style={{ width: "100%" }}>
              파일 선택
            </Button>
          </div>
          {fileName && <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>선택된 파일: {fileName}</div>}
        </div>
      )}
    </NodeShell>
  );
};
