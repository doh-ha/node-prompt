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

const GroupTitle = styled.div`
  margin: 12px 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.02em;
  text-transform: uppercase;
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
  type: "role" | "outputFormat" | "condition" | "context" | "promptTemplate" | "model";
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  defaultData: any;
}

interface TemplateGroup {
  title: string;
  items: NodeTemplate[];
}

const groupedTemplates: TemplateGroup[] = [
  {
    title: "주요 설정",
    items: [
      {
        type: "role",
        name: "Role",
        description: "AI의 역할과 전문성을 정의",
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
        type: "promptTemplate",
        name: "Task",
        description: "수행할 작업(지시문) 정의",
        icon: "📝",
        iconColor: "#7c3aed",
        iconBg: "#e0e7ff",
        defaultData: {
          template: "다음 작업을 수행하세요: {task}",
          variables: ["task"],
        },
      },
      {
        type: "context",
        name: "Audience",
        description: "대상 사용자(학습자) 정보",
        icon: "🧑‍🎓",
        iconColor: "#0ea5e9",
        iconBg: "#e0f2fe",
        defaultData: {
          contextType: "audience",
          content: "고등학생",
        },
      },
    ],
  },
  {
    title: "컨텍스트",
    items: [
      {
        type: "context",
        name: "Background",
        description: "배경/사전지식/상황",
        icon: "📚",
        iconColor: "#059669",
        iconBg: "#d1fae5",
        defaultData: {
          contextType: "background",
          content: "해당 단원은 이차함수의 그래프입니다.",
        },
      },
      {
        type: "context",
        name: "Example",
        description: "예시/샘플 입력",
        icon: "💡",
        iconColor: "#16a34a",
        iconBg: "#dcfce7",
        defaultData: {
          contextType: "example",
          content: "문제 예시: y = x^2 + 2x + 1",
        },
      },
      {
        type: "context",
        name: "Edge case",
        description: "특이/극단 상황",
        icon: "🧪",
        iconColor: "#ea580c",
        iconBg: "#ffedd5",
        defaultData: {
          contextType: "edgeCase",
          content: "입력 데이터가 불완전한 경우",
        },
      },
    ],
  },
  {
    title: "요구사항/제약",
    items: [
      {
        type: "context",
        name: "Constraints",
        description: "지켜야 할 제약/규칙",
        icon: "🔒",
        iconColor: "#dc2626",
        iconBg: "#fee2e2",
        defaultData: {
          contextType: "constraints",
          content: "전문 용어는 최소화하고 간결하게 설명",
        },
      },
      {
        type: "context",
        name: "Length",
        description: "길이/분량 제한",
        icon: "📏",
        iconColor: "#475569",
        iconBg: "#e2e8f0",
        defaultData: {
          contextType: "length",
          content: "300자 이내",
        },
      },
      {
        type: "context",
        name: "Style",
        description: "문체/톤/말투",
        icon: "🎨",
        iconColor: "#a21caf",
        iconBg: "#fae8ff",
        defaultData: {
          contextType: "style",
          content: "친근하고 단계적인 설명",
        },
      },
    ],
  },
  {
    title: "출력 구성",
    items: [
      {
        type: "outputFormat",
        name: "Format",
        description: "응답 형식/구조",
        icon: "📄",
        iconColor: "#2563eb",
        iconBg: "#dbeafe",
        defaultData: {
          format: "text",
          structure: "",
          template: "",
        },
      },
    ],
  },
];

interface LibraryPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onDragStart }) => {
  return (
    <PaletteContainer>
      <PaletteTitle>라이브러리</PaletteTitle>
      {groupedTemplates.map((group, gi) => (
        <div key={gi}>
          <GroupTitle>{group.title}</GroupTitle>
          {group.items.map((template, ti) => (
            <NodeItem
              key={`${gi}-${ti}`}
              draggable
              onDragStart={(e) => {
                // 드래그 프리뷰를 원본 요소로 설정
                const el = e.currentTarget as HTMLElement;
                const rect = el.getBoundingClientRect();
                e.dataTransfer.setDragImage(el, Math.min(24, rect.width / 4), Math.min(16, rect.height / 4));
                onDragStart(e, template.type, { ...template.defaultData, label: template.name, name: template.name });
              }}
            >
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
        </div>
      ))}
    </PaletteContainer>
  );
};
