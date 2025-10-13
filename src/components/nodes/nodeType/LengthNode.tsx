import React, { useState } from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { RadioSuggestions } from "../RadioSuggestions";
import { useAutosizeTextArea } from "../../../hooks/useAutosizeTextArea";

interface LengthNodeProps {
  data: {
    content: string;
    label?: string;
    icon?: string;
    iconColor?: string;
    nodeBg?: string;
    suggestions?: string[];
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const LengthNode: React.FC<LengthNodeProps> = ({ data, selected, id }) => {
  const [value, setValue] = useState(data.content === "직접 입력" ? "" : data.content ?? "");
  const textAreaRef = useAutosizeTextArea(value);
  const showInputField = data.content === "직접 입력" || (data.content && !data.suggestions?.includes(data.content));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (data.onContentChange) {
      // 직접 입력 모드에서는 "직접 입력" 상태를 유지하면서 실제 내용도 저장
      data.onContentChange("직접 입력");
    }
  };

  const handleRadioChange = (radioValue: string) => {
    if (data.onContentChange) {
      data.onContentChange(radioValue);
    }
    if (radioValue === "직접 입력") {
      setValue("");
    } else {
      // 라디오 버튼 선택 시 input field 값 초기화
      setValue("");
    }
  };

  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      {data.suggestions && data.suggestions.length > 0 && <RadioSuggestions suggestions={[...data.suggestions, "직접 입력"]} selectedValue={data.content} onSelectionChange={handleRadioChange} />}
      {showInputField && (
        <NodeInput
          ref={textAreaRef}
          placeholder="권장 길이를 입력하세요..."
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </NodeShell>
  );
};
