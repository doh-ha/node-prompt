import React, { useState } from "react";
import { NodeInput, ContextNodeContainer } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { useAutosizeTextArea } from "../../../hooks/useAutosizeTextArea";
import { RecommendationPanel, RecommendationIcon } from "../../ui";

interface RoleNodeProps {
  data: {
    role: string;
    description: string;
    examples: string[];
    content?: string;
    onContentChange?: (content: string, fileName?: string, description?: string) => void;
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

  // description에서 📝 description 부분만 추출 (impact, risk 제외)
  const extractDescriptionOnly = (fullDescription: string): string => {
    const descriptionMarker = "📝 description:";
    const impactMarker = "💡 impact:";
    
    if (!fullDescription.includes(descriptionMarker)) {
      return fullDescription; // 형식이 다르면 전체 반환
    }
    
    const descriptionStart = fullDescription.indexOf(descriptionMarker);
    const descriptionText = fullDescription.substring(descriptionStart + descriptionMarker.length);
    
    // 💡 impact: 또는 ⚠️ risk: 이전까지 추출
    const impactIndex = descriptionText.indexOf(impactMarker);
    if (impactIndex !== -1) {
      return descriptionText.substring(0, impactIndex).trim();
    }
    
    // impact가 없으면 risk 찾기
    const riskMarker = "⚠️ risk:";
    const riskIndex = descriptionText.indexOf(riskMarker);
    if (riskIndex !== -1) {
      return descriptionText.substring(0, riskIndex).trim();
    }
    
    // 둘 다 없으면 전체 반환
    return descriptionText.trim();
  };

  const handleSelectRecommendation = (recommendation: string, description?: string) => {
    // description에서 📝 description 부분만 추출하여 표시
    if (description) {
      const descriptionOnly = extractDescriptionOnly(description);
      const displayValue = descriptionOnly ? `${recommendation} (${descriptionOnly})` : recommendation;
      setValue(displayValue);
    } else {
      setValue(recommendation);
    }
    
    if (data.onContentChange) {
      // description에서 📝 description 부분만 추출하여 전달 (impact, risk 제외)
      const descriptionOnly = description ? extractDescriptionOnly(description) : undefined;
      data.onContentChange(recommendation, undefined, descriptionOnly);
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
      <NodeShell
        id={id}
        selected={selected}
        title={data.label}
        icon={data.icon}
        iconColor={data.iconColor}
        bg={(data as any).nodeBg}
        onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
        nodeType="role"
      >
        <NodeInput
          ref={textAreaRef}
          placeholder="역할 내용을 입력하세요..."
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

      <RecommendationPanel currentPrompt={currentPrompt} nodeType="role" onSelectRecommendation={handleSelectRecommendation} isVisible={showRecommendations} onClose={handleCloseRecommendations} />
    </ContextNodeContainer>
  );
};
