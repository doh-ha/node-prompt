import React, { useState, useRef } from "react";
import { NodeShell } from "../NodeShell";
import { Button } from "../../ui";

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
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      setFileName(fileName);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (data.onContentChange) {
          data.onContentChange(content, fileName);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined} nodeType="file">
      <div>
        <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: "none" }} />
        <div style={{ width: "100%", marginBottom: "8px" }}>
          <Button size="small" variant="secondary" onClick={handleFileButtonClick} style={{ width: "100%" }}>
            Upload File
          </Button>
        </div>
        {fileName && <div style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>File: {fileName}</div>}
      </div>
    </NodeShell>
  );
};
