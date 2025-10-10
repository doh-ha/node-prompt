import { Node, Edge, GeneratedPrompt } from "../types/nodeTypes";
import { nodesRegistry } from "../components/nodes/registry";

// 노드 연결을 기반으로 프롬프트를 생성하는 함수
export const generatePromptFromWorkflow = (nodes: Node[], edges: Edge[]): GeneratedPrompt => {
  // 1) 우선 registry.toPrompt 기반으로 전역 프롬프트 조각을 생성
  const registryFragments: string[] = [];
  nodes.forEach((node: any) => {
    let key = node.type as string;
    if (key === "context" && node?.data?.contextType) {
      key = node.data.contextType; // audience/style/example/reference 등 매핑
    }
    const entry: any = (nodesRegistry as any)[key];
    if (entry && typeof entry.toPrompt === "function") {
      const piece = entry.toPrompt(node.data);
      if (piece && typeof piece === "string" && piece.trim()) {
        registryFragments.push(piece.trim());
      }
    }
  });

  const components = {
    role: "",
    context: [] as string[],
    conditions: [] as string[],
    outputFormat: "",
    template: "",
  };

  // 노드들을 타입별로 분류
  const nodesByType = nodes.reduce((acc, node) => {
    const nodeType = node.type || "unknown";
    if (!acc[nodeType]) {
      acc[nodeType] = [];
    }
    acc[nodeType].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  // 역할 노드 처리
  if (nodesByType.role && nodesByType.role.length > 0) {
    const roleNode = nodesByType.role[0];
    components.role = roleNode.data.content || roleNode.data.role || "AI 어시스턴트";
  }

  // 컨텍스트 노드들 처리
  if (nodesByType.context) {
    nodesByType.context.forEach((contextNode: any) => {
      const contextType = contextNode.data.contextType;
      const content = contextNode.data.content;

      if (content) {
        switch (contextType) {
          case "subject":
            components.context.push(`주제: ${content}`);
            break;
          case "level":
            components.context.push(`수준: ${content}`);
            break;
          case "style":
            components.context.push(`스타일: ${content}`);
            break;
          case "constraints":
            components.context.push(`제약사항: ${content}`);
            break;
          case "background":
            components.context.push(`배경: ${content}`);
            break;
          case "example":
            components.context.push(`예시: ${content}`);
            break;
          case "audience":
            components.context.push(`대상: ${content}`);
            break;
          case "edgeCase":
            components.context.push(`특이사항: ${content}`);
            break;
          case "length":
            components.context.push(`길이: ${content}`);
            break;
          default:
            components.context.push(content);
        }
      }
    });
  }

  // 조건 노드들 처리
  if (nodesByType.condition) {
    nodesByType.condition.forEach((conditionNode: any) => {
      const { condition, operator, value } = conditionNode.data;
      const operatorText = getOperatorText(operator);
      components.conditions.push(`${condition} ${operatorText} ${value}`);
    });
  }

  // 출력 형식 노드 처리
  if (nodesByType.outputFormat && nodesByType.outputFormat.length > 0) {
    const outputNode = nodesByType.outputFormat[0];
    const format = outputNode.data.format;
    const structure = outputNode.data.structure;

    components.outputFormat = format;
    if (structure) {
      components.outputFormat += ` (${structure})`;
    }
  }

  // 프롬프트 템플릿 노드 처리
  if (nodesByType.promptTemplate && nodesByType.promptTemplate.length > 0) {
    const templateNode = nodesByType.promptTemplate[0];
    components.template = templateNode.data.content || templateNode.data.template;
  }

  // 최종 프롬프트 생성
  // 입력 필드 원문들을 수집해 기본 영역에 표시
  const inputContents = nodes
    .map((n: any) => (typeof n?.data?.content === "string" ? n.data.content.trim() : ""))
    .filter(Boolean)
    .join("\n");

  // registry 조각이 있으면 그것만 사용(중복 표시 방지). 없으면 기본 조합 로직 사용
  const finalPrompt = registryFragments.length > 0 ? registryFragments.join("\n") : buildFinalPrompt(components, inputContents);

  return {
    finalPrompt,
    components,
  };
};

// 연산자 텍스트 변환
const getOperatorText = (operator: string): string => {
  const operatorMap: Record<string, string> = {
    equals: "=",
    contains: "포함",
    startsWith: "로 시작",
    endsWith: "로 끝",
    regex: "정규식 매치",
  };
  return operatorMap[operator] || operator;
};

// 최종 프롬프트 구성
const buildFinalPrompt = (components: any, inputContents?: string): string => {
  let prompt = "";

  // 역할 정의
  if (components.role) {
    prompt += `당신은 ${components.role}입니다.\n\n`;
  }

  // 컨텍스트 정보
  if (components.context.length > 0) {
    prompt += "다음 정보를 참고하세요:\n";
    components.context.forEach((context: string) => {
      prompt += `- ${context}\n`;
    });
    prompt += "\n";
  }

  // 조건들
  if (components.conditions.length > 0) {
    prompt += "다음 조건들을 만족해야 합니다:\n";
    components.conditions.forEach((condition: string) => {
      prompt += `- ${condition}\n`;
    });
    prompt += "\n";
  }

  // 출력 형식
  if (components.outputFormat) {
    const formatInstructions = getFormatInstructions(components.outputFormat);
    prompt += `응답은 다음 형식으로 작성해주세요:\n${formatInstructions}\n\n`;
  }

  // 사용자 정의 템플릿이 있으면 사용
  if (components.template) {
    prompt += "다음 템플릿을 사용하여 응답해주세요:\n";
    prompt += components.template;
  } else {
    // 기본 응답 요청 자리에 입력 필드 내용 표시
    if (inputContents && inputContents.trim().length > 0) {
      prompt += inputContents.trim();
    } else {
      prompt += "위의 지침에 따라 적절한 응답을 제공해주세요.";
    }
  }

  return prompt.trim();
};

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

  // 역할 노드가 있는지 확인
  const hasRoleNode = nodes.some((node) => node.type === "role");
  if (!hasRoleNode) {
    errors.push("역할 정의 노드를 추가해주세요.");
  }

  // 연결되지 않은 노드가 있는지 확인
  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const isolatedNodes = nodes.filter((node) => !connectedNodeIds.has(node.id));
  if (isolatedNodes.length > 1) {
    errors.push("모든 노드를 연결해주세요.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
