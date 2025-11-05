import { RoleNode } from "./nodeType/RoleNode";
import { OutputFormatNode } from "./nodeType/OutputFormatNode";
import { TextOutputNode } from "./nodeType/TextOutputNode";
import { SpreadsheetOutputNode } from "./nodeType/SpreadsheetOutputNode";
import { PdfOutputNode } from "./nodeType/PdfOutputNode";
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
import { InputNode } from "./nodeType/InputNode";
import { OutputNode } from "./nodeType/OutputNode";
import { FlowNode } from "./nodeType/FlowNode";
import { colors } from "../../constants";

type NodeTypeKey =
  | "role"
  | "format"
  | "context"
  | "promptTemplate"
  | "model"
  | "reference"
  | "audience"
  | "style"
  | "text"
  | "example"
  | "length"
  | "start"
  | "result"
  | "textOutput"
  | "spreadsheetOutput"
  | "pdfOutput"
  | "input"
  | "output"
  | "flow";

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
      description: "AI의 역할을 정의",
      icon: "🎭",
      iconColor: colors.nodeIcon.purple,

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
      iconColor: colors.nodeIcon.gray,
      group: "input",
    },
    component: ReferenceNode,
    toPrompt: (d: any) => {
      if (!d.content || d.content.trim() === "") return null;
      // 파일명을 프롬프트에 표시
      const fileReference = d.fileName ? `${d.fileName}을 참고하여` : "참고 자료를 참고하여";
      return `[Reference]\n${fileReference}...`;
    },
  },

  // 추가 컨텍스트: Audience
  audience: {
    type: "audience",
    meta: {
      name: "Audience",
      description: "대상 사용자(학습자)",
      icon: "🧑‍🎓",
      iconColor: colors.nodeIcon.purple,
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
      iconColor: colors.nodeIcon.purple,
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
      iconColor: colors.nodeIcon.purple,
      group: "context",
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
      description: "예시",
      icon: "💡",
      iconColor: colors.nodeIcon.blue,
      group: "input",
    },
    component: ExampleNode,
    toPrompt: (d: any) => (d.content ? `[${d.name}]\n다음은 참고할 수 있는 예시입니다:\n${d.content}` : null),
  },
  // 입력용 자유 텍스트
  text: {
    type: "text",
    meta: {
      name: "Text Input",
      description: "텍스트 입력",
      icon: "✍️",
      iconColor: colors.nodeIcon.black,
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
      iconColor: colors.nodeIcon.purple,

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
      iconColor: colors.nodeIcon.purple,

      group: "flow",
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
      iconColor: colors.nodeIcon.green,
      group: "flow",
    },
    component: StartNode,
  },
  // 흐름용
  input: {
    type: "input",
    meta: {
      name: "Input",
      description: "input 관련 노드들을 연결",
      icon: "📥",
      iconColor: colors.nodeIcon.blue,
      group: "flow",
    },
    component: InputNode,
  },
  // 흐름용
  output: {
    type: "output",
    meta: {
      name: "Output",
      description: "output 관련 노드들을 연결",
      icon: "📤",
      iconColor: colors.nodeIcon.green,
      group: "flow",
    },
    component: OutputNode,
  },
  // 연결 흐름용 결과 노드
  result: {
    type: "result",
    meta: {
      name: "Result",
      description: "최종 결과",
      icon: "🏁",
      iconColor: colors.nodeIcon.red,
      group: "flow",
    },
    component: ResultNode,
  },
  textOutput: {
    type: "textOutput",
    meta: {
      name: "Text Output",
      description: "텍스트 결과 출력",
      icon: "📝",
      iconColor: colors.nodeIcon.darkGreen,
      group: "output",
    },
    component: TextOutputNode,
  },
  spreadsheetOutput: {
    type: "spreadsheetOutput",
    meta: {
      name: "Spreadsheet",
      description: "스프레드시트로 내보내기",
      icon: "📊",
      iconColor: colors.nodeIcon.darkGreen,
      group: "output",
    },
    component: SpreadsheetOutputNode,
  },
  pdfOutput: {
    type: "pdfOutput",
    meta: {
      name: "PDF",
      description: "PDF로 내보내기",
      icon: "📄",
      iconColor: colors.nodeIcon.darkGreen,
      group: "output",
    },
    component: PdfOutputNode,
  },
  flow: {
    type: "flow",
    meta: {
      name: "Flow",
      description: "완전한 워크플로우\n(Start, Input, Model, Output, Result)",
      icon: "⛓️",
      iconColor: colors.nodeIcon.purple,
      group: "structure",
    },
    component: FlowNode,
  },
} as Record<string, NodeEntry>;

export const nodeComponents = Object.fromEntries(
  Object.entries(nodesRegistry)
    .filter(([k]) =>
      (
        [
          "role",
          "outputFormat",
          "context",
          "promptTemplate",
          "model",
          "reference",
          "audience",
          "style",
          "text",
          "example",
          "length",
          "start",
          "result",
          "textOutput",
          "spreadsheetOutput",
          "pdfOutput",
          "input",
          "output",
          "flow",
        ] as const
      ).includes(k as any)
    )
    .map(([k, v]) => [v.type, v.component])
) as Record<NodeTypeKey, any>;

// 그룹별로 명시적으로 정의
const GROUP_CONFIG = {
  STRUCTURE: { title: "STRUCTURE", bg: colors.nodeBg.grey, order: 0 },
  INPUT: { title: "INPUT", bg: colors.nodeBg.blue, order: 1 },
  CONTEXT: { title: "CONTEXT", bg: colors.nodeBg.lightPurple, order: 2 },
  OUTPUT: { title: "OUTPUT", bg: colors.nodeBg.lightGreen, order: 3 },
};

// 각 그룹별 노드 순서 정의
const NODE_ORDERS = {
  // FLOW: { flow: 0, start: 1, input: 2, model: 3, output: 4, result: 5 },
  STRUCTURE: { flow: 0 },
  INPUT: { text: 0, reference: 1, example: 2 },
  CONTEXT: { role: 0, audience: 1, style: 2, promptTemplate: 3 },
  OUTPUT: { outputFormat: 0, textOutput: 1, spreadsheetOutput: 2, pdfOutput: 3, length: 4 },
};

export const groupedTemplates = Object.entries(GROUP_CONFIG)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([groupKey, config]) => {
    const items = Object.values(nodesRegistry)
      .filter((entry) => {
        const original = entry.meta.group;
        const mappedTitle = original === "structure" ? "STRUCTURE" : original === "flow" ? "FLOW" : original === "input" ? "INPUT" : original === "output" ? "OUTPUT" : "CONTEXT";
        return mappedTitle === groupKey;
      })
      .map((entry) => ({
        type: entry.type,
        name: entry.meta.name,
        description: entry.meta.description,
        icon: entry.meta.icon,
        iconColor: entry.meta.iconColor,
        iconBg: undefined as any,
        // 기본은 그룹 배경색이나, 요청에 따라 특정 노드는 다른 그룹 색상을 사용
        nodeBg:
          entry.type === "input"
            ? GROUP_CONFIG.INPUT.bg // start는 INPUT 색상
            : entry.type === "model"
            ? GROUP_CONFIG.CONTEXT.bg // model은 CONTEXT 색상
            : entry.type === "output"
            ? GROUP_CONFIG.OUTPUT.bg // result는 OUTPUT 색상
            : config.bg,
      }))
      .sort((a, b) => {
        // 각 그룹별로 정의된 순서 사용
        const nodeOrder = NODE_ORDERS[groupKey as keyof typeof NODE_ORDERS];
        if (nodeOrder) {
          const aOrder = (nodeOrder as any)[a.type];
          const bOrder = (nodeOrder as any)[b.type];

          // 정의되지 않은 노드는 맨 뒤로
          if (aOrder === undefined && bOrder === undefined) return 0;
          if (aOrder === undefined) return 1;
          if (bOrder === undefined) return -1;

          return aOrder - bOrder;
        }
        return 0; // 순서가 정의되지 않은 경우 기존 순서 유지
      });

    return {
      title: config.title,
      items,
    };
  });
