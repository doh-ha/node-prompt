import React, { useState } from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { useAutosizeTextArea } from "../../../hooks/useAutosizeTextArea";
import { RecommendationPanel, RecommendationIcon } from "../../ui";

interface RoleNodeProps {
  data: {
    role: string;
    description: string;
    examples: string[];
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
  };
  selected?: boolean;
  id?: string;
}

export const RoleNode: React.FC<RoleNodeProps> = ({ data, selected, id }) => {
  const [value, setValue] = useState(data.content ?? "");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const textAreaRef = useAutosizeTextArea(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (data.onContentChange) {
      data.onContentChange(e.target.value);
    }
  };

  const handleFocus = () => {
    if (value.trim()) {
      setShowRecommendations(true);
    }
  };

  const handleSelectRecommendation = (recommendation: string) => {
    setValue(recommendation);
    if (data.onContentChange) {
      data.onContentChange(recommendation);
    }
    setShowRecommendations(false);
  };

  const handleCloseRecommendations = () => {
    setShowRecommendations(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={(data as any).nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
        <NodeInput
          ref={textAreaRef}
          placeholder="역할 내용을 입력하세요..."
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      </NodeShell>

      <RecommendationIcon onClick={() => setShowRecommendations(!showRecommendations)} isVisible={showRecommendations} />

      <RecommendationPanel currentPrompt={value} nodeType="style" onSelectRecommendation={handleSelectRecommendation} isVisible={showRecommendations} onClose={handleCloseRecommendations} />
    </div>
  );
};
