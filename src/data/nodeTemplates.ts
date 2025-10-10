// 노드 템플릿 데이터 정의
export interface NodeTemplate {
  type: "role" | "outputFormat" | "condition" | "context" | "promptTemplate" | "model";
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  defaultData: any;
}

export interface TemplateGroup {
  title: string;
  items: NodeTemplate[];
}

// 노드 템플릿 그룹 정의
export const groupedTemplates: TemplateGroup[] = [
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
        description: "배경 정보 및 맥락 제공",
        icon: "📚",
        iconColor: "#059669",
        iconBg: "#d1fae5",
        defaultData: {
          contextType: "background",
          content: "수학 기초 개념",
        },
      },
      {
        type: "context",
        name: "Example",
        description: "예시 및 참고 사항",
        icon: "💡",
        iconColor: "#7c2d12",
        iconBg: "#fed7aa",
        defaultData: {
          contextType: "example",
          content: "구체적인 예시를 포함하여 설명",
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
        description: "제약사항 및 제한 조건",
        icon: "⚠️",
        iconColor: "#dc2626",
        iconBg: "#fecaca",
        defaultData: {
          contextType: "constraints",
          content: "200자 이내로 답변",
        },
      },
      {
        type: "context",
        name: "Edge Case",
        description: "예외 상황 및 특이 케이스",
        icon: "🔍",
        iconColor: "#7c3aed",
        iconBg: "#e0e7ff",
        defaultData: {
          contextType: "edgeCase",
          content: "복잡한 수식의 경우 단계별 설명",
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
        description: "출력 형식 및 구조 정의",
        icon: "📄",
        iconColor: "#2563eb",
        iconBg: "#dbeafe",
        defaultData: {
          format: "text",
          structure: "단락형",
        },
      },
      {
        type: "context",
        name: "Length",
        description: "출력 길이 및 분량 설정",
        icon: "📏",
        iconColor: "#6b7280",
        iconBg: "#f3f4f6",
        defaultData: {
          contextType: "length",
          content: "간결하고 명확하게",
        },
      },
      {
        type: "context",
        name: "Style",
        description: "문체 및 톤앤매너 설정",
        icon: "🎨",
        iconColor: "#a855f7",
        iconBg: "#f3e8ff",
        defaultData: {
          contextType: "style",
          content: "친근하고 이해하기 쉽게",
        },
      },
    ],
  },
];

// 노드 타입별 라벨 매핑
export const formatLabels: Record<string, string> = {
  text: "텍스트",
  json: "JSON",
  markdown: "마크다운",
  code: "코드",
  list: "목록",
};

export const operatorLabels: Record<string, string> = {
  equals: "=",
  contains: "포함",
  startsWith: "시작",
  endsWith: "끝",
  regex: "정규식",
};

export const contextLabels: Record<string, string> = {
  subject: "주제",
  level: "수준",
  style: "스타일",
  constraints: "제약사항",
  background: "배경",
  example: "예시",
  audience: "대상",
  edgeCase: "특이사항",
  length: "길이",
};
