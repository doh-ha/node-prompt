import React, { useState, useMemo } from "react";
import { PreviewContainer, PreviewHeader, PreviewTitle, TabContainer, Tab, PromptText, TestInput, TestButton, ResponseArea } from "../styles/nodeStyles";
import { usePromptGenerator } from "../hooks/usePromptGenerator";
import { Button } from "./ui";
import { nodesRegistry } from "./nodes/registry";

interface PreviewPanelProps {
  nodes: any[];
  edges: any[];
  onClose?: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ nodes, edges, onClose }) => {
  const [selectedFlow, setSelectedFlow] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"prompt" | "test">("prompt");
  const [testInput, setTestInput] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);

  const { generatedPrompt, validation } = usePromptGenerator(nodes, edges);

  // Flow별 프롬프트 생성 함수
  const generatePromptFromFlowNodes = React.useCallback((flowNodes: any[], flowEdges: any[]) => {
    const registryFragments: string[] = [];
    flowNodes.forEach((node: any) => {
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

    return registryFragments.join("\n\n");
  }, []);

  // Flow별로 노드들을 그룹화 (엣지 연결 기반)
  // 노드가 여러 flow에 직접 연결되면 공유됨
  const flowGroups = useMemo(() => {
    const groups: { [key: string]: { nodes: any[]; edges: any[]; prompt: string } } = {};

    // Start 노드들을 찾아서 각각을 독립적인 플로우로 생성
    const startNodes = nodes.filter((node) => node.type === "start" && node.data?.flowName);

    if (startNodes.length === 0) {
      // Start 노드가 없으면 플로우가 없음 (빈 객체 반환)
      return groups;
    }

    // 각 Start 노드에서 도달 가능한 노드들을 먼저 계산
    const flowReachability: Map<string, Set<string>> = new Map();
    
    startNodes.forEach((startNode) => {
      const flowName = startNode.data.flowName;
      const reachableNodeIds = new Set<string>([startNode.id]);
      const visited = new Set<string>();

      // 하류(나가는 엣지) 방향으로 탐색
      const findFlowNodes = (currentNodeId: string) => {
        if (visited.has(currentNodeId)) {
          return;
        }
        visited.add(currentNodeId);
        reachableNodeIds.add(currentNodeId);

        // 현재 노드에서 나가는 엣지 찾기
        const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
        outgoingEdges.forEach((edge) => {
          findFlowNodes(edge.target);
        });
      };

      // 상류(들어오는 엣지) 방향으로 역추적
      const collectUpstream = (targetId: string) => {
        const incoming = edges.filter((e) => e.target === targetId);
        incoming.forEach((e) => {
          if (!reachableNodeIds.has(e.source)) {
            reachableNodeIds.add(e.source);
            collectUpstream(e.source);
          }
        });
      };

      // Start 노드부터 하류 방향 탐색
      findFlowNodes(startNode.id);

      // 찾은 노드들에 대해 상류 역추적
      Array.from(reachableNodeIds).forEach((id) => collectUpstream(id));

      flowReachability.set(flowName, reachableNodeIds);
    });

    // 각 flow에 대해 노드와 엣지 필터링
    startNodes.forEach((startNode) => {
      const flowName = startNode.data.flowName;
      const flowNodeIds = flowReachability.get(flowName)!;

      // Flow에 속한 노드와 엣지 필터링
      // 노드가 이 flow에 도달 가능하면 포함 (다른 flow에도 도달 가능하면 공유됨)
      const flowNodes = nodes.filter((node) => flowNodeIds.has(node.id));
      
      // 엣지는 양쪽 노드가 모두 이 flow에 속해야 함
      const flowEdges = edges.filter((edge) => 
        flowNodeIds.has(edge.source) && flowNodeIds.has(edge.target)
      );

      // Flow별 프롬프트 생성
      const flowPrompt = generatePromptFromFlowNodes(flowNodes, flowEdges);

      groups[flowName] = {
        nodes: flowNodes,
        edges: flowEdges,
        prompt: flowPrompt,
      };
    });

    return groups;
  }, [nodes.map((n) => `${n.id}:${n.type}:${JSON.stringify(n.data)}`).join(","), edges.map((e) => `${e.id}:${e.source}:${e.target}`).join(","), forceUpdate, generatePromptFromFlowNodes]);

  // 노드의 flowName이 변경될 때마다 강제로 재계산
  React.useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [nodes]);

  // 선택된 플로우가 없으면 첫 번째 플로우를 자동 선택
  React.useEffect(() => {
    const flowNames = Object.keys(flowGroups);
    if (flowNames.length > 0 && !selectedFlow) {
      setSelectedFlow(flowNames[0]);
    }

    // 현재 선택된 플로우가 더 이상 존재하지 않으면 첫 번째 플로우로 변경
    if (selectedFlow && !flowNames.includes(selectedFlow)) {
      setSelectedFlow(flowNames[0] || "");
    }
  }, [flowGroups, selectedFlow]);

  const handleTestPrompt = async () => {
    setTestResponse("테스트 중...");

    try {
      // 선택된 Flow의 프롬프트 사용
      const currentPrompt = selectedFlow && flowGroups[selectedFlow] ? flowGroups[selectedFlow].prompt : generatedPrompt.finalPrompt;

      console.log("🔍 DEBUG: 사용할 프롬프트:", currentPrompt);

      const response = await fetch("/api/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          model: "gpt-4o-mini",
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResponse(data.content || "응답을 받을 수 없습니다.");
      } else {
        const errorData = await response.json();
        setTestResponse(`에러: ${errorData.detail || "알 수 없는 오류가 발생했습니다."}`);
      }
    } catch (error) {
      setTestResponse(`네트워크 에러: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    }
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <PreviewTitle>AI 에이전트 미리보기</PreviewTitle>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                color: "#6b7280",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </PreviewHeader>

      {/* 플로우 선택 */}
      {Object.keys(flowGroups).length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.keys(flowGroups).map((flowName) => (
              <button
                key={flowName}
                onClick={() => setSelectedFlow(flowName)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: selectedFlow === flowName ? "#4f46e5" : "#ffffff",
                  color: selectedFlow === flowName ? "#ffffff" : "#374151",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  if (selectedFlow !== flowName) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedFlow !== flowName) {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }
                }}
              >
                📋 {flowName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 프롬프트/테스트 탭 */}
      <TabContainer>
        <Tab active={activeTab === "prompt"} onClick={() => setActiveTab("prompt")}>
          프롬프트
        </Tab>
        <Tab active={activeTab === "test"} onClick={() => setActiveTab("test")}>
          테스트
        </Tab>
      </TabContainer>

      {/* 선택된 플로우의 내용 표시 */}
      {selectedFlow && flowGroups[selectedFlow] && (
        <>
          {activeTab === "prompt" && (
            <div>
              <PromptText>{flowGroups[selectedFlow].prompt || "프롬프트 내용이 없습니다."}</PromptText>

              {!validation.isValid && (
                <div style={{ padding: "20px", color: "#dc2626", fontSize: "14px" }}>
                  <strong>경고:</strong>
                  <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "test" && (
            <div>
              <TestInput placeholder="테스트할 입력을 입력하세요..." value={testInput} onChange={(e) => setTestInput(e.target.value)} />
              <Button onClick={handleTestPrompt} disabled={false} variant="primary">
                프롬프트 테스트
              </Button>
              <ResponseArea>{testResponse}</ResponseArea>
            </div>
          )}
        </>
      )}

      {/* 플로우가 없는 경우 기본 프롬프트 표시 */}
      {Object.keys(flowGroups).length === 0 && (
        <div>
          <PromptText>{generatedPrompt.finalPrompt}</PromptText>
          {!validation.isValid && (
            <div style={{ padding: "20px", color: "#dc2626", fontSize: "14px" }}>
              <strong>경고:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </PreviewContainer>
  );
};
