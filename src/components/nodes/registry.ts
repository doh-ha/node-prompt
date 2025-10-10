import { RoleNode } from "./RoleNode";
import { OutputFormatNode } from "./OutputFormatNode";
import { ConditionNode } from "./ConditionNode";
import { ContextNode } from "./ContextNode";
import { PromptTemplateNode } from "./PromptTemplateNode";
import { ModelNode } from "./ModelNode";

type NodeTypeKey = "role" | "outputFormat" | "condition" | "context" | "promptTemplate" | "model";

interface NodeMeta {
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
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
      iconColor: "#d97706",
      iconBg: "#fef3c7",
      defaultData: { role: "학습 도우미", description: "", examples: [] },
      group: "주요 설정",
    },
    component: RoleNode,
    toPrompt: (d) => (d.content || d.role ? `당신은 ${d.content || d.role}입니다.` : null),
  },
  outputFormat: {
    type: "outputFormat",
    meta: {
      name: "Format",
      description: "출력 형식 및 구조 정의",
      icon: "📄",
      iconColor: "#2563eb",
      iconBg: "#dbeafe",
      defaultData: { format: "text", structure: "" },
      group: "출력 구성",
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
      iconColor: "#dc2626",
      iconBg: "#fecaca",
      defaultData: { condition: "", operator: "equals", value: "" },
      group: "요구사항/제약",
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
      iconColor: "#059669",
      iconBg: "#d1fae5",
      defaultData: { contextType: "background", content: "" },
      group: "컨텍스트",
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
      iconColor: "#0ea5e9",
      iconBg: "#e0f2fe",
      defaultData: { contextType: "audience", content: "" },
      group: "컨텍스트",
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
      iconColor: "#a855f7",
      iconBg: "#f3e8ff",
      defaultData: { contextType: "style", content: "" },
      group: "컨텍스트",
    },
    component: ContextNode,
    toPrompt: (d: any) => (d.content ? `스타일: ${d.content}` : null),
  },
  promptTemplate: {
    type: "promptTemplate",
    meta: {
      name: "Task",
      description: "프롬프트 템플릿",
      icon: "📝",
      iconColor: "#7c3aed",
      iconBg: "#e0e7ff",
      defaultData: { template: "", variables: [] },
      group: "주요 설정",
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
      iconColor: "#9333ea",
      iconBg: "#f3e8ff",
      defaultData: { model: "gpt-3.5-turbo", temperature: 0.7, maxTokens: 1000 },
      group: "주요 설정",
    },
    component: ModelNode,
  },
} as Record<string, NodeEntry>;

export const nodeComponents = Object.fromEntries(
  Object.entries(nodesRegistry)
    .filter(([k]) => (["role", "outputFormat", "condition", "context", "promptTemplate", "model"] as const).includes(k as any))
    .map(([k, v]) => [k, v.component])
) as Record<NodeTypeKey, any>;

export const groupedTemplates = Object.values(nodesRegistry).reduce(
  (acc: { title: string; items: Array<{ type: any; name: string; description: string; icon: string; iconColor: string; iconBg: string; defaultData: any }> }[], entry) => {
    let group = acc.find((g) => g.title === entry.meta.group);
    if (!group) {
      group = { title: entry.meta.group, items: [] };
      acc.push(group);
    }
    group.items.push({
      type: entry.type,
      name: entry.meta.name,
      description: entry.meta.description,
      icon: entry.meta.icon,
      iconColor: entry.meta.iconColor,
      iconBg: entry.meta.iconBg,
      defaultData: entry.meta.defaultData,
    });
    return acc;
  },
  []
);
