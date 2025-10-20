// 노드 컴포넌트 인덱스 파일
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

export { RoleNode } from "./nodeType/RoleNode";
export { OutputFormatNode } from "./nodeType/OutputFormatNode";
export { TextOutputNode } from "./nodeType/TextOutputNode";
export { SpreadsheetOutputNode } from "./nodeType/SpreadsheetOutputNode";
export { PdfOutputNode } from "./nodeType/PdfOutputNode";

export { TaskNode } from "./nodeType/TaskNode";
export { ModelNode } from "./nodeType/ModelNode";
export { StartNode } from "./nodeType/StartNode";
export { ResultNode } from "./nodeType/ResultNode";
export { ReferenceNode } from "./nodeType/ReferenceNode";
export { AudienceNode } from "./nodeType/AudienceNode";
export { StyleNode } from "./nodeType/StyleNode";
export { TextNode } from "./nodeType/TextNode";
export { ExampleNode } from "./nodeType/ExampleNode";
export { LengthNode } from "./nodeType/LengthNode";

// 노드 컴포넌트 매핑
export const nodeComponents = {
  role: RoleNode,
  outputFormat: OutputFormatNode,
  textOutput: TextOutputNode,
  spreadsheetOutput: SpreadsheetOutputNode,
  pdfOutput: PdfOutputNode,

  promptTemplate: TaskNode,
  model: ModelNode,
  start: StartNode,
  result: ResultNode,
  reference: ReferenceNode,
  audience: AudienceNode,
  style: StyleNode,
  text: TextNode,
  example: ExampleNode,
  length: LengthNode,
};
