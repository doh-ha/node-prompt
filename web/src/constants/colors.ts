// 색상 상수 정의
export const colors = {
  // 기본 색상
  primary: "#4f46e5",
  secondary: "#7c3aed",
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  info: "#0ea5e9",

  // 회색 톤
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // 노드 배경색
  nodeBg: {
    yellow: "#fef3c7", // 노란색 (start)
    purple: "#f3e8ff", // 보라색 (model)
    red: "#fef2f2", // 빨간색 (result)
    blue: "#e0f2fe", // 파란색 (input)
    lightPurple: "#f5f3ff", // 연보라색 (context)
    lightGreen: "#ecfdf5", // 연녹색 (output)
    grey: "#f3f4f6", // 회색 (flow 등 공용 배경)
  },

  // 노드 아이콘 색상
  nodeIcon: {
    green: "#16a34a", // 녹색 (start)
    purple: "#7c3aed", // 보라색 (model)
    red: "#dc2626", // 빨간색 (result)
    gray: "#475569", // 회색 (role)
    blue: "#0ea5e9", // 파란색 (outputFormat)
    black: "#111827", // 검은색 (reference)
    darkGreen: "#059669", // 진녹색 (pdf, spreadsheet, textOutput)
  },

  // UI 색상
  ui: {
    background: "#f8fafc",
    surface: "#ffffff",
    border: "#e5e7eb",
    borderLight: "#d1d5db",
    text: "#374151",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    hover: "#f3f4f6",
    active: "#4f46e5",
    disabled: "#9ca3af",
  },

  // 상태 색상
  status: {
    selected: "#4f46e5",
    hover: "#4338ca",
    error: "#ef4444",
    errorHover: "#dc2626",
    success: "#059669",
    successHover: "#047857",
  },

  // 엣지 색상
  edge: {
    default: "#94a3b8",
    background: "#e5e7eb",
  },

  // 그라데이션
  gradient: {
    primary: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  },
} as const;

// 타입 정의
export type ColorKey = keyof typeof colors;
export type NodeBgKey = keyof typeof colors.nodeBg;
export type NodeIconKey = keyof typeof colors.nodeIcon;
