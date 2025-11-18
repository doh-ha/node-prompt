import React, { useState } from "react";
import { NodeInput, ContextNodeContainer } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { useAutosizeTextArea } from "../../../hooks/useAutosizeTextArea";
import { RecommendationPanel, RecommendationIcon } from "../../ui";

interface AudienceNodeProps {
  data: {
    content: string;
    label?: string;
    icon?: string;
    iconColor?: string;
    nodeBg?: string;
    onContentChange?: (content: string, fileName?: string, description?: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const AudienceNode: React.FC<AudienceNodeProps> = ({ data, selected, id }) => {
  const [value, setValue] = useState(data.content ?? "");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const textAreaRef = useAutosizeTextArea(value);

  // 전체 프롬프트를 사용 (없으면 현재 노드의 내용만 사용)
  const currentPrompt = (data as any).currentFullPrompt || (value.trim() ? value.trim() : "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (data.onContentChange) {
      data.onContentChange(e.target.value);
    }
  };

  // handleFocus 제거 - 자동 추천 비활성화

  const handleSelectRecommendation = (recommendation: string, description?: string) => {
    setValue(recommendation);
    if (data.onContentChange) {
      data.onContentChange(recommendation, undefined, description);
    }
    setShowRecommendations(false);
  };

  const handleCloseRecommendations = () => {
    setShowRecommendations(false);
  };

  // 복사/붙여넣기 핸들러
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  return (
    <ContextNodeContainer>
      <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
        <NodeInput
          ref={textAreaRef}
          placeholder="대상 사용자(학습자)를 입력하세요..."
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

      <RecommendationIcon onClick={() => setShowRecommendations(!showRecommendations)} isVisible={showRecommendations} />

      <RecommendationPanel currentPrompt={currentPrompt} nodeType="audience" onSelectRecommendation={handleSelectRecommendation} isVisible={showRecommendations} onClose={handleCloseRecommendations} />
    </ContextNodeContainer>
  );
};
