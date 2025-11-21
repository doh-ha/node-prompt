// 애플리케이션 상수 정의

// 색상 상수 export
export { colors } from "./colors";

// 모델 상수 export
export { DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "./models";

// 노드 타입 상수
export const NODE_TYPES = {
  ROLE: "role",
  OUTPUT_FORMAT: "outputFormat",
  CONDITION: "condition",
  CONTEXT: "context",
  PROMPT_TEMPLATE: "promptTemplate",
  MODEL: "model",
} as const;

// 컨텍스트 타입 상수
export const CONTEXT_TYPES = {
  SUBJECT: "subject",
  LEVEL: "level",
  STYLE: "style",
  CONSTRAINTS: "constraints",
  BACKGROUND: "background",
  EXAMPLE: "example",
  AUDIENCE: "audience",
  EDGE_CASE: "edgeCase",
  LENGTH: "length",
} as const;

// 출력 형식 상수
export const OUTPUT_FORMATS = {
  TEXT: "text",
  JSON: "json",
  MARKDOWN: "markdown",
  CODE: "code",
  LIST: "list",
} as const;

// 연산자 상수
export const OPERATORS = {
  EQUALS: "equals",
  CONTAINS: "contains",
  STARTS_WITH: "startsWith",
  ENDS_WITH: "endsWith",
  REGEX: "regex",
} as const;

// UI 상수
export const UI_CONSTANTS = {
  CANVAS_WIDTH: 1600,
  CANVAS_HEIGHT: 1200,
  NODE_MIN_WIDTH: 200,
  NODE_MIN_HEIGHT: 80,
  SNAP_DISTANCE: 20,
} as const;

// 색상 테마 (기존 호환성을 위해 유지)
export const COLORS = {
  PRIMARY: "#4f46e5",
  SECONDARY: "#7c3aed",
  SUCCESS: "#059669",
  WARNING: "#d97706",
  ERROR: "#dc2626",
  INFO: "#0ea5e9",
} as const;
