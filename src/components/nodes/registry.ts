import { RoleNode } from "./RoleNode";
import { OutputFormatNode } from "./OutputFormatNode";
import { ConditionNode } from "./ConditionNode";
import { ContextNode } from "./ContextNode";
import { PromptTemplateNode } from "./PromptTemplateNode";
import { ModelNode } from "./ModelNode";
import { StartNode } from "./StartNode";
import { ResultNode } from "./ResultNode";

type NodeTypeKey = "role" | "outputFormat" | "condition" | "context" | "promptTemplate" | "model";

interface NodeMeta {
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  nodeBg: string;
  defaultData: any;
  group: string;
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
      nodeBg: "#f5f3ff",
      defaultData: { role: "학습 도우미", description: "", examples: [] },
      group: "setup",
    },
    component: RoleNode,
    toPrompt: (d) => (d.content || d.role ? `당신은 ${d.content || d.role}입니다.` : null),
  },
  // 추가 컨텍스트: Reference
  reference: {
    type: "context" as any,
    meta: {
      name: "Reference",
      description: "참고 자료/문헌",
      icon: "📑",
      iconColor: "#475569",
      nodeBg: "#e0f2fe",
      defaultData: { contextType: "reference", content: "" },
      group: "input",
    },
    component: ContextNode,
    toPrompt: (d: any) => (d.content ? `참고: ${d.content}` : null),
  },
  outputFormat: {
    type: "outputFormat",
    meta: {
      name: "Format",
      description: "출력 형식 및 구조 정의",
      icon: "💬",
      iconColor: "#059669",
      nodeBg: "#ecfdf5",
      defaultData: { format: "text", structure: "" },
      group: "output",
    },
    component: OutputFormatNode,
    toPrompt: (d) => (d.format ? `응답 형식: ${d.format}${d.structure ? ` (${d.structure})` : ""}` : null),
  },
  condition: {
    type: "condition",
    meta: {
      name: "Condition",
      description: "조건/규칙",
      icon: "⚡",
      iconColor: "#7c3aed",
      nodeBg: "#f5f3ff",
      defaultData: { condition: "", operator: "equals", value: "" },
      group: "constraints",
    },
    component: ConditionNode,
    toPrompt: (d) => (d.condition ? `조건: ${d.condition} ${d.operator} ${d.value}` : null),
  },
  context: {
    type: "context",
    meta: {
      name: "Context",
      description: "컨텍스트 정보",
      icon: "📚",
      iconColor: "#7c3aed",
      nodeBg: "#f5f3ff",
      defaultData: { contextType: "background", content: "" },
      group: "constraints",
    },
    component: ContextNode,
    toPrompt: (d) => (d.content ? d.content : null),
  },
  // 추가 컨텍스트: Audience
  audience: {
    // TS 키는 NodeTypeKey가 아니므로 레지스트리 빌드시 캐스팅해주기 위해 임시로 as any 처리
    // 런타임에서는 groupedTemplates로만 사용되며 ReactFlow type은 'context'로 생성됨
    type: "context" as any,
    meta: {
      name: "Audience",
      description: "대상 사용자(학습자)",
      icon: "🧑‍🎓",
      iconColor: "#7c3aed",
      nodeBg: "#f5f3ff",
      defaultData: { contextType: "audience", content: "" },
      group: "setup",
    },
    component: ContextNode,
    toPrompt: (d: any) => (d.content ? `대상: ${d.content}` : null),
  },
  // 추가 컨텍스트: Style
  style: {
    type: "context" as any,
    meta: {
      name: "Style",
      description: "문체/톤/말투",
      icon: "🎨",
      iconColor: "#7c3aed",
      iconBg: "transparent",
      nodeBg: "#f5f3ff",
      defaultData: { contextType: "style", content: "" },
      group: "constraints",
    },
    component: ContextNode,
    toPrompt: (d: any) => (d.content ? `스타일: ${d.content}` : null),
  },
  // 추가 컨텍스트: Example
  example: {
    type: "context" as any,
    meta: {
      name: "Example",
      description: "예시/샘플",
      icon: "💡",
      iconColor: "#0ea5e9",
      nodeBg: "#e0f2fe",
      defaultData: { contextType: "example", content: "" },
      group: "input",
    },
    component: ContextNode,
    toPrompt: (d: any) => (d.content ? `예시: ${d.content}` : null),
  },
  // 입력용 자유 텍스트
  text: {
    type: "context" as any,
    meta: {
      name: "Text",
      description: "자유 텍스트 입력",
      icon: "✍️",
      iconColor: "#111827",
      nodeBg: "#e0f2fe",
      defaultData: { contextType: "text", content: "" },
      group: "input",
    },
    component: ContextNode,
    toPrompt: (d: any) => (d.content ? d.content : null),
  },
  promptTemplate: {
    type: "promptTemplate",
    meta: {
      name: "Task",
      description: "프롬프트 템플릿",
      icon: "📝",
      iconColor: "#7c3aed",
      nodeBg: "#f5f3ff",
      defaultData: { template: "", variables: [] },
      group: "setup",
    },
    component: PromptTemplateNode,
    toPrompt: (d) => d.content || d.template || null,
  },
  model: {
    type: "model",
    meta: {
      name: "Model",
      description: "AI 모델 설정",
      icon: "🤖",
      iconColor: "#7c3aed",
      nodeBg: "#f5f3ff",
      defaultData: { model: "gpt-3.5-turbo", temperature: 0.7, maxTokens: 1000 },
      group: "model",
    },
    component: ModelNode,
  },
  // 연결 흐름용 시작 노드
  start: {
    type: "context" as any,
    meta: {
      name: "Start",
      description: "플로우 시작",
      icon: "▶️",
      iconColor: "#16a34a",
      iconBg: "transparent",
      nodeBg: "#f5f3ff",
      defaultData: { content: "" },
      group: "setup",
    },
    component: StartNode,
  },
  // 연결 흐름용 결과 노드
  result: {
    type: "context" as any,
    meta: {
      name: "Result",
      description: "최종 결과",
      icon: "🏁",
      iconColor: "#059669",
      nodeBg: "#ecfdf5",
      defaultData: { content: "" },
      group: "output",
    },
    component: ResultNode,
  },
} as Record<string, NodeEntry>;

export const nodeComponents = Object.fromEntries(
  Object.entries(nodesRegistry)
    .filter(([k]) => (["role", "outputFormat", "condition", "context", "promptTemplate", "model"] as const).includes(k as any))
    .map(([k, v]) => [k, v.component])
) as Record<NodeTypeKey, any>;

export const groupedTemplates = Object.values(nodesRegistry).reduce(
  (acc: { title: string; items: Array<{ type: any; name: string; description: string; icon: string; iconColor: string; iconBg: string; nodeBg: string; defaultData: any }> }[], entry) => {
    const original = entry.meta.group;
    const mappedTitle = original === "input" ? "INPUT" : original === "output" ? "OUTPUT" : "Model";
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
      nodeBg: entry.meta.nodeBg,
      defaultData: entry.meta.defaultData,
    });
    return acc;
  },
  []
);
