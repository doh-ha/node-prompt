import React, { useState } from "react";
import styled from "styled-components";
import { GeneratedPrompt } from "../types/nodeTypes";
import { generatePromptFromWorkflow, validateWorkflow } from "../utils/promptGenerator";

const PreviewContainer = styled.div`
  position: fixed;
  right: 20px;
  top: 20px;
  width: 400px;
  max-height: calc(100vh - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const PreviewHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${(props) => (props.active ? "#f8fafc" : "transparent")};
  color: ${(props) => (props.active ? "#4f46e5" : "#6b7280")};
  font-weight: ${(props) => (props.active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const TabContent = styled.div`
  margin-top: 16px;
`;

const PromptText = styled.pre`
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
`;

const ComponentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ComponentItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #4f46e5;
`;

const ComponentLabel = styled.div`
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
`;

const ComponentValue = styled.div`
  color: #6b7280;
  font-size: 14px;
`;

const TestInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const TestButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ResponseArea = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  min-height: 100px;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 14px;
`;

interface PreviewPanelProps {
  nodes: any[];
  edges: any[];
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ nodes, edges }) => {
  const [activeTab, setActiveTab] = useState<"prompt" | "components" | "test">("prompt");
  const [testInput, setTestInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 프롬프트 생성
  const generatedPrompt = generatePromptFromWorkflow(nodes, edges);
  const validation = validateWorkflow(nodes, edges);

  // AI 테스트 함수 (실제 API 호출은 구현하지 않고 시뮬레이션)
  const testWithAI = async () => {
    if (!testInput.trim()) return;

    setIsLoading(true);

    // 실제로는 OpenAI API 등을 호출하겠지만, 여기서는 시뮬레이션
    setTimeout(() => {
      setAiResponse(`AI 응답 시뮬레이션:\n\n사용자 입력: "${testInput}"\n\n생성된 프롬프트에 따라 다음과 같이 응답합니다:\n\n${generatedPrompt.finalPrompt}\n\n[실제 AI 응답이 여기에 표시됩니다]`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewTitle>프리뷰</PreviewTitle>
      </PreviewHeader>

      <TabContainer>
        <Tab active={activeTab === "prompt"} onClick={() => setActiveTab("prompt")}>
          프롬프트
        </Tab>
        <Tab active={activeTab === "components"} onClick={() => setActiveTab("components")}>
          구성요소
        </Tab>
        <Tab active={activeTab === "test"} onClick={() => setActiveTab("test")}>
          테스트
        </Tab>
      </TabContainer>

      <PreviewContent>
        {!validation.isValid && (
          <ErrorMessage>
            <strong>워크플로우 오류:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </ErrorMessage>
        )}

        {validation.isValid && <SuccessMessage>✅ 워크플로우가 유효합니다. 프롬프트를 생성할 수 있습니다.</SuccessMessage>}

        <TabContent>
          {activeTab === "prompt" && <PromptText>{generatedPrompt.finalPrompt}</PromptText>}

          {activeTab === "components" && (
            <ComponentList>
              {generatedPrompt.components.role && (
                <ComponentItem>
                  <ComponentLabel>역할</ComponentLabel>
                  <ComponentValue>{generatedPrompt.components.role}</ComponentValue>
                </ComponentItem>
              )}

              {generatedPrompt.components.context.length > 0 && (
                <ComponentItem>
                  <ComponentLabel>컨텍스트</ComponentLabel>
                  <ComponentValue>
                    {generatedPrompt.components.context.map((ctx, index) => (
                      <div key={index}>• {ctx}</div>
                    ))}
                  </ComponentValue>
                </ComponentItem>
              )}

              {generatedPrompt.components.conditions.length > 0 && (
                <ComponentItem>
                  <ComponentLabel>조건</ComponentLabel>
                  <ComponentValue>
                    {generatedPrompt.components.conditions.map((condition, index) => (
                      <div key={index}>• {condition}</div>
                    ))}
                  </ComponentValue>
                </ComponentItem>
              )}

              {generatedPrompt.components.outputFormat && (
                <ComponentItem>
                  <ComponentLabel>출력 형식</ComponentLabel>
                  <ComponentValue>{generatedPrompt.components.outputFormat}</ComponentValue>
                </ComponentItem>
              )}

              {generatedPrompt.components.template && (
                <ComponentItem>
                  <ComponentLabel>템플릿</ComponentLabel>
                  <ComponentValue>{generatedPrompt.components.template}</ComponentValue>
                </ComponentItem>
              )}
            </ComponentList>
          )}

          {activeTab === "test" && (
            <div>
              <TestInput placeholder="AI에게 테스트할 질문이나 요청을 입력하세요..." value={testInput} onChange={(e) => setTestInput(e.target.value)} />
              <TestButton onClick={testWithAI} disabled={!testInput.trim() || isLoading}>
                {isLoading ? "AI 응답 생성 중..." : "AI 테스트"}
              </TestButton>

              {aiResponse && (
                <ResponseArea>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{aiResponse}</pre>
                </ResponseArea>
              )}
            </div>
          )}
        </TabContent>
      </PreviewContent>
    </PreviewContainer>
  );
};
