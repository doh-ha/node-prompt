// AI 에이전트 구성 요소를 위한 노드 타입 정의
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "reactflow";

export interface BaseNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

// ReactFlow의 Node와 Edge 타입을 재export
export type Node = ReactFlowNode;
export type Edge = ReactFlowEdge;

// 역할 정의 노드
export interface RoleNode extends BaseNode {
  type: "role";
  data: {
    role: string;
    description: string;
    examples: string[];
  };
}

// 출력 형식 노드
export interface OutputFormatNode extends BaseNode {
  type: "outputFormat";
  data: {
    format: "text" | "json" | "markdown" | "code" | "list";
    structure?: string;
    template?: string;
  };
}

// 조건/규칙 노드
export interface ConditionNode extends BaseNode {
  type: "condition";
  data: {
    condition: string;
    operator: "equals" | "contains" | "startsWith" | "endsWith" | "regex";
    value: string;
  };
}

// 컨텍스트 노드
export interface ContextNode extends BaseNode {
  type: "context";
  data: {
    contextType: "subject" | "level" | "style" | "constraints";
    content: string;
  };
}

// 프롬프트 템플릿 노드
export interface PromptTemplateNode extends BaseNode {
  type: "promptTemplate";
  data: {
    template: string;
    variables: string[];
  };
}

// AI 모델 설정 노드
export interface ModelNode extends BaseNode {
  type: "model";
  data: {
    model: "gpt-3.5-turbo" | "gpt-4" | "claude-3" | "gemini-pro";
    temperature: number;
    maxTokens: number;
  };
}

// 모든 노드 타입의 유니온
export type NodeType = RoleNode | OutputFormatNode | ConditionNode | ContextNode | PromptTemplateNode | ModelNode;

// 노드 연결을 위한 엣지 타입 (ReactFlow Edge와 동일하므로 제거)

// 워크플로우 상태
export interface WorkflowState {
  nodes: NodeType[];
  edges: Edge[];
  selectedNode?: string;
}

// 프롬프트 생성 결과
export interface GeneratedPrompt {
  finalPrompt: string;
  components: {
    role: string;
    context: string[];
    conditions: string[];
    outputFormat: string;
    template: string;
  };
}
