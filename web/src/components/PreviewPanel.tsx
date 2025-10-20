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

  // 플로우별로 노드들을 그룹화
  const flowGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    // Start 노드들을 찾아서 각각을 독립적인 플로우로 생성
    const startNodes = nodes.filter((node) => node.type === "start" && node.data?.flowName);

    if (startNodes.length === 0) {
      // Start 노드가 없으면 플로우가 없음 (빈 객체 반환)
      return groups;
    }

    // 각 Start 노드에 대해 독립적인 플로우 그룹 생성
    startNodes.forEach((startNode) => {
      const flowName = startNode.data.flowName;
      groups[flowName] = [startNode]; // Start 노드만 포함
    });

    // Start 노드가 아닌 다른 노드들을 각 플로우에 독립적으로 할당
    const nonStartNodes = nodes.filter((node) => node.type !== "start");

    // 노드의 위치를 기반으로 가장 가까운 Start 노드의 플로우에 할당
    nonStartNodes.forEach((node) => {
      const nodePosition = node.position;
      let closestFlowName = "";
      let minDistance = Infinity;

      // 각 Start 노드와의 거리 계산
      Object.keys(groups).forEach((flowName) => {
        const startNode = groups[flowName][0]; // Start 노드는 항상 첫 번째
        const startPosition = startNode.position;

        const distance = Math.sqrt(Math.pow(nodePosition.x - startPosition.x, 2) + Math.pow(nodePosition.y - startPosition.y, 2));

        if (distance < minDistance) {
          minDistance = distance;
          closestFlowName = flowName;
        }
      });

      // 가장 가까운 플로우에 노드 할당
      if (closestFlowName) {
        groups[closestFlowName].push(node);
      }
    });

    return groups;
  }, [nodes, forceUpdate]);

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
      // generatedPrompt.finalPrompt를 직접 사용
      const currentPrompt = generatedPrompt.finalPrompt;

      console.log("🔍 DEBUG: 사용할 프롬프트:", currentPrompt);

      const response = await fetch("/api/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          model: "gpt-4",
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
              <PromptText>
                {flowGroups[selectedFlow].length > 0
                  ? flowGroups[selectedFlow]
                      .map((node) => {
                        // registry.ts의 toPrompt 함수 사용
                        let key = node.type as string;
                        if (key === "context" && node?.data?.contextType) {
                          key = node.data.contextType;
                        }
                        const entry: any = (nodesRegistry as any)[key];
                        if (entry && typeof entry.toPrompt === "function") {
                          const piece = entry.toPrompt(node.data);
                          if (piece && typeof piece === "string" && piece.trim()) {
                            return piece.trim();
                          }
                        }
                        return null;
                      })
                      .filter(Boolean)
                      .join("\n\n") || "프롬프트 내용이 없습니다."
                  : "노드가 없습니다."}
              </PromptText>

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
