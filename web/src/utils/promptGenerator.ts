import { Node, Edge, GeneratedPrompt } from "../types/nodeTypes";
import { nodesRegistry } from "../components/nodes/registry";

// 노드 연결을 기반으로 프롬프트를 생성하는 함수
export const generatePromptFromWorkflow = (nodes: Node[], edges: Edge[]): GeneratedPrompt => {
  const registryFragments: string[] = [];
  nodes.forEach((node: any) => {
    let key = node.type as string;
    if (key === "context" && node?.data?.contextType) {
      key = node.data.contextType;
    }
    const entry: any = (nodesRegistry as any)[key];
    if (entry && typeof entry.toPrompt === "function") {
      const piece = entry.toPrompt(node.data);
      if (piece && typeof piece === "string" && piece.trim()) {
        registryFragments.push(piece.trim());
      }
    }
  });

  const finalPrompt = registryFragments.join("\n");

  return {
    finalPrompt,
    components: {
      role: "",
      context: [],
      conditions: [],
      outputFormat: "",
      template: "",
    },
  };
};

// 출력 형식별 지침 생성 (현재 미사용이나 향후 확장 대비)

// 출력 형식별 지침 생성
const getFormatInstructions = (format: string): string => {
  const formatMap: Record<string, string> = {
    text: "자연스러운 텍스트 형식으로 작성해주세요.",
    json: "JSON 형식으로 구조화된 데이터를 제공해주세요.",
    markdown: "마크다운 형식을 사용하여 구조화된 문서로 작성해주세요.",
    code: "코드 예시와 함께 설명해주세요.",
    list: "명확한 목록 형태로 정리해주세요.",
  };

  return formatMap[format] || "적절한 형식으로 작성해주세요.";
};

// 워크플로우 유효성 검사
export const validateWorkflow = (nodes: Node[], edges: Edge[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 최소한 하나의 노드가 있어야 함
  if (nodes.length === 0) {
    errors.push("최소한 하나의 노드를 추가해주세요.");
  }

  // 모든 노드는 선택사항이며 연결도 선택사항입니다

  return {
    isValid: errors.length === 0,
    errors,
  };
};
