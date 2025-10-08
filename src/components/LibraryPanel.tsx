import React from "react";
import styled from "styled-components";

const PaletteContainer = styled.div`
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1000;
`;

const PaletteTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  text-align: center;
`;

const NodeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.98);
  }
`;

const NodeIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 12px;
`;

const NodeInfo = styled.div`
  flex: 1;
`;

const NodeName = styled.div`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

const NodeDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
`;

interface NodeTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  defaultData: any;
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: "role",
    name: "역할 정의",
    description: "AI의 역할과 전문성을 설정",
    icon: "🎭",
    iconColor: "#d97706",
    iconBg: "#fef3c7",
    defaultData: {
      role: "학습 도우미",
      description: "학생의 학습을 돕는 친근한 AI 어시스턴트",
      examples: ["질문 답변", "개념 설명", "학습 계획 수립"],
    },
  },
  {
    type: "context",
    name: "컨텍스트",
    description: "학습 주제나 수준을 설정",
    icon: "📚",
    iconColor: "#059669",
    iconBg: "#d1fae5",
    defaultData: {
      contextType: "subject",
      content: "수학",
    },
  },
  {
    type: "outputFormat",
    name: "출력 형식",
    description: "AI 응답의 형식을 지정",
    icon: "📄",
    iconColor: "#2563eb",
    iconBg: "#dbeafe",
    defaultData: {
      format: "text",
      structure: "",
      template: "",
    },
  },
  {
    type: "condition",
    name: "조건",
    description: "특정 조건에 따른 응답 규칙",
    icon: "⚡",
    iconColor: "#dc2626",
    iconBg: "#fecaca",
    defaultData: {
      condition: "학년",
      operator: "equals",
      value: "고등학교",
    },
  },
  {
    type: "promptTemplate",
    name: "프롬프트 템플릿",
    description: "사용자 정의 프롬프트 템플릿",
    icon: "📝",
    iconColor: "#7c3aed",
    iconBg: "#e0e7ff",
    defaultData: {
      template: "당신은 {role}입니다. {context}에 대해 {format} 형식으로 답변해주세요.",
      variables: ["role", "context", "format"],
    },
  },
  {
    type: "model",
    name: "AI 모델",
    description: "사용할 AI 모델과 설정",
    icon: "🤖",
    iconColor: "#9333ea",
    iconBg: "#f3e8ff",
    defaultData: {
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
];

interface LibraryPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onDragStart }) => {
  return (
    <PaletteContainer>
      <PaletteTitle>라이브러리</PaletteTitle>
      {nodeTemplates.map((template) => (
        <NodeItem key={template.type} draggable onDragStart={(e) => onDragStart(e, template.type, template.defaultData)}>
          <NodeIcon
            style={{
              background: template.iconBg,
              color: template.iconColor,
            }}
          >
            {template.icon}
          </NodeIcon>
          <NodeInfo>
            <NodeName>{template.name}</NodeName>
            <NodeDescription>{template.description}</NodeDescription>
          </NodeInfo>
        </NodeItem>
      ))}
    </PaletteContainer>
  );
};
