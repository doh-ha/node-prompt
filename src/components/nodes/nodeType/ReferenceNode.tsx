import React, { useState, useRef } from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { Button } from "../../ui";

interface ReferenceNodeProps {
  data: {
    content: string;
    label?: string;
    icon?: string;
    iconColor?: string;
    nodeBg?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ReferenceNode: React.FC<ReferenceNodeProps> = ({ data, selected, id }) => {
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [fileName, setFileName] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
        if (data.onContentChange) {
          data.onContentChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (content: string) => {
    setTextContent(content);
    if (data.onContentChange) {
      data.onContentChange(content);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <Button size="small" variant={inputMode === "file" ? "primary" : "secondary"} onClick={() => setInputMode("file")}>
          파일 업로드
        </Button>
        <Button size="small" variant={inputMode === "text" ? "primary" : "secondary"} onClick={() => setInputMode("text")}>
          직접 입력
        </Button>
      </div>

      {inputMode === "text" ? (
        <NodeInput
          placeholder="참고 자료나 문헌을 입력하세요..."
          defaultValue={data.content ?? ""}
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
