// 노드 컴포넌트 인덱스 파일
import { RoleNode } from "./RoleNode";
import { OutputFormatNode } from "./OutputFormatNode";
import { ConditionNode } from "./ConditionNode";
import { ContextNode } from "./ContextNode";
import { PromptTemplateNode } from "./PromptTemplateNode";
import { ModelNode } from "./ModelNode";
import { StartNode } from "./StartNode";
import { ResultNode } from "./ResultNode";

export { RoleNode } from "./RoleNode";
export { OutputFormatNode } from "./OutputFormatNode";
export { ConditionNode } from "./ConditionNode";
export { ContextNode } from "./ContextNode";
export { PromptTemplateNode } from "./PromptTemplateNode";
export { ModelNode } from "./ModelNode";
export { StartNode } from "./StartNode";
export { ResultNode } from "./ResultNode";

// 노드 컴포넌트 매핑
export const nodeComponents = {
  role: RoleNode,
  outputFormat: OutputFormatNode,
  condition: ConditionNode,
  context: ContextNode,
  promptTemplate: PromptTemplateNode,
  model: ModelNode,
  start: StartNode,
  result: ResultNode,
};
