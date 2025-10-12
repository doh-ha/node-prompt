import { RoleNode } from "./nodeType/RoleNode";
import { OutputFormatNode } from "./nodeType/OutputFormatNode";
import { TaskNode } from "./nodeType/TaskNode";
import { ModelNode } from "./nodeType/ModelNode";
import { StartNode } from "./nodeType/StartNode";
import { ResultNode } from "./nodeType/ResultNode";
import { ReferenceNode } from "./nodeType/ReferenceNode";
import { AudienceNode } from "./nodeType/AudienceNode";
import { StyleNode } from "./nodeType/StyleNode";
import { TextNode } from "./nodeType/TextNode";
import { ExampleNode } from "./nodeType/ExampleNode";
import { LengthNode } from "./nodeType/LengthNode";

type NodeTypeKey = "role" | "outputFormat" | "context" | "promptTemplate" | "model" | "reference" | "audience" | "style" | "text" | "example" | "length" | "start" | "result";

interface NodeMeta {
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  group: string;
  contextType?: string;
  defaultSuggestions?: string[];
}

interface NodeEntry {
  type: NodeTypeKey;
  meta: NodeMeta;
  component: any;
  toPrompt?: (data: any) => string | null;
  validate?: (data: any) => string[];
}

export const nodesRegistry = {
  role: {
    type: "role",
    meta: {
      name: "Role",
      description: "AI의 역할과 전문성을 정의",
      icon: "🎭",
      iconColor: "#7c3aed",

      group: "context",
    },
    component: RoleNode,
    toPrompt: (d) => (d.content || d.role ? `[${d.name}]\n당신은 ${d.content || d.role} 입니다.` : null),
  },
  // 추가 컨텍스트: Reference
  reference: {
    type: "reference",
    meta: {
      name: "Reference",
      description: "참고 자료/문헌",
      icon: "📑",
      iconColor: "#475569",
      group: "input",
    },
    component: ReferenceNode,
    toPrompt: (d: any) => (d.content ? `[${d.name}]\n필요하다면 다음 참고 정보를 기반으로 답변하세요.` : null),
  },
  outputFormat: {
    type: "outputFormat",
    meta: {
      name: "Format",
      description: "출력 형식 및 구조 정의",
      icon: "💬",
      iconColor: "#059669",
      group: "output",
      defaultSuggestions: ["자유 형식", "목록 형식", "표 형식", "단계별 형식"],
    },
    component: OutputFormatNode,
    toPrompt: (d) => (d.format ? `[${d.name}]\n최종 답변은 다음 형식으로 출력하세요:\n${d.format}${d.structure ? ` (${d.structure})` : ""}` : null),
  },

  // 추가 컨텍스트: Audience
  audience: {
    type: "audience",
    meta: {
      name: "Audience",
      description: "대상 사용자(학습자)",
      icon: "🧑‍🎓",
      iconColor: "#7c3aed",
      group: "context",
    },
    component: AudienceNode,
    toPrompt: (d: any) => (d.content ? `[${d.name}]\n당신의 주요 독자(청중)는 ${d.content} 입니다.` : null),
  },
  // 추가 컨텍스트: Style
  style: {
    type: "style",
    meta: {
      name: "Style",
      description: "문체/톤/말투",
      icon: "🎨",
      iconColor: "#7c3aed",
      group: "context",
      defaultSuggestions: ["친근하고 따뜻한", "전문적이고 정확한", "간결하고 명확한", "유머러스하고 재미있는"],
    },
    component: StyleNode,
    toPrompt: (d: any) => (d.content ? `[${d.name}]\n답변은 ${d.content} 스타일로 작성하세요.` : null),
  },

  // 누락 컨텍스트: Length
  length: {
    type: "length",
    meta: {
      name: "Length",
      description: "길이",
      icon: "📏",
      iconColor: "#7c3aed",
      group: "output",
      defaultSuggestions: ["짧게 (1-2문단)", "보통 (3-5문단)", "길게 (6-10문단)", "매우 길게 (10문단 이상)"],
    },
    component: LengthNode,
    toPrompt: (d: any) => (d.content ? `[${d.name}]\n권장 길이: ${d.content}` : null),
  },

  // 추가 컨텍스트: Example
  example: {
    type: "example",
    meta: {
      name: "Example",
      description: "예시/샘플",
      icon: "💡",
      iconColor: "#0ea5e9",
      group: "input",
    },
    component: ExampleNode,
    toPrompt: (d: any) => (d.content ? `[${d.name}]\n다음은 참고할 수 있는 예시입니다:\n${d.content}` : null),
  },
  // 입력용 자유 텍스트
  text: {
    type: "text",
    meta: {
      name: "Text",
      description: "자유 텍스트 입력",
      icon: "✍️",
      iconColor: "#111827",
      group: "input",
    },
    component: TextNode,
    toPrompt: (d: any) => (d.content ? d.content : null),
  },
  promptTemplate: {
    type: "promptTemplate",
    meta: {
      name: "Task",
      description: "프롬프트 템플릿",
      icon: "📝",
      iconColor: "#7c3aed",

      group: "context",
    },
    component: TaskNode,
    toPrompt: (d) => (d.content || d.template ? `[${d.name}]\n다음 작업을 수행하세요: ${d.content || d.template}.` : null),
  },
  model: {
    type: "model",
    meta: {
      name: "Model",
      description: "AI 모델 설정",
      icon: "🤖",
      iconColor: "#7c3aed",

      group: "context",
    },
    component: ModelNode,
  },
  // 연결 흐름용 시작 노드
  start: {
    type: "start",
    meta: {
      name: "Start",
      description: "플로우 시작",
      icon: "▶️",
      iconColor: "#16a34a",
      group: "input",
    },
    component: StartNode,
  },
  // 연결 흐름용 결과 노드
  result: {
    type: "result",
    meta: {
      name: "Result",
      description: "최종 결과",
      icon: "🏁",
      iconColor: "#059669",
      group: "output",
    },
    component: ResultNode,
  },
} as Record<string, NodeEntry>;

export const nodeComponents = Object.fromEntries(
  Object.entries(nodesRegistry)
    .filter(([k]) => (["role", "outputFormat", "context", "promptTemplate", "model", "reference", "audience", "style", "text", "example", "length", "start", "result"] as const).includes(k as any))
    .map(([k, v]) => [v.type, v.component])
) as Record<NodeTypeKey, any>;

export const groupedTemplates = Object.values(nodesRegistry).reduce(
  (acc: { title: string; items: Array<{ type: any; name: string; description: string; icon: string; iconColor: string; iconBg: string; nodeBg: string; defaultData?: any }> }[], entry) => {
    const original = entry.meta.group;
    const mappedTitle = original === "input" ? "INPUT" : original === "output" ? "OUTPUT" : "CONTEXT";
    const GROUP_BG: Record<string, string> = { INPUT: "#e0f2fe", OUTPUT: "#ecfdf5", CONTEXT: "#f5f3ff" };
    let group = acc.find((g) => g.title === mappedTitle);
    if (!group) {
      group = { title: mappedTitle, items: [] };
      acc.push(group);
    }
    group.items.push({
      type: entry.type,
      name: entry.meta.name,
      description: entry.meta.description,
      icon: entry.meta.icon,
      iconColor: entry.meta.iconColor,
      iconBg: undefined as any,
      nodeBg: GROUP_BG[mappedTitle],
    });
    return acc;
  },
  []
);
