import React, { useState } from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { useAutosizeTextArea } from "../../../hooks/useAutosizeTextArea";

interface TextNodeProps {
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

export const TextNode: React.FC<TextNodeProps> = ({ data, selected, id }) => {
  const [value, setValue] = useState(data.content ?? "");
  const textAreaRef = useAutosizeTextArea(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (data.onContentChange) {
      data.onContentChange(e.target.value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // onChange에서 이미 반영
  };

  // 복사/붙여넣기 핸들러
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 기본 붙여넣기 동작 허용
    e.stopPropagation();
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 기본 복사 동작 허용
    e.stopPropagation();
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 기본 잘라내기 동작 허용
    e.stopPropagation();
  };

  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined} nodeType="text">
      <NodeInput
        ref={textAreaRef}
        placeholder="Enter additional information..."
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onCopy={handleCopy}
        onCut={handleCut}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </NodeShell>
  );
};
