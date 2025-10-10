import React, { useState } from "react";
import {
  PreviewContainer,
  PreviewHeader,
  PreviewTitle,
  TabContainer,
  Tab,
  PromptText,
  ComponentList,
  ComponentItem,
  ComponentTitle,
  ComponentContent,
  TestInput,
  TestButton,
  ResponseArea,
} from "../styles/nodeStyles";
import { usePromptGenerator } from "../hooks/usePromptGenerator";
import { Button } from "./ui";

interface PreviewPanelProps {
  nodes: any[];
  edges: any[];
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ nodes, edges }) => {
  const [activeTab, setActiveTab] = useState<"prompt" | "components" | "test">("prompt");
  const [testInput, setTestInput] = useState("");
  const [testResponse, setTestResponse] = useState("");

  const { generatedPrompt, validation } = usePromptGenerator(nodes, edges);

  const handleTestPrompt = async () => {
    if (!testInput.trim()) return;

    setTestResponse("테스트 중...");

    // 실제 AI API 호출 대신 시뮬레이션
    setTimeout(() => {
      setTestResponse(`입력: ${testInput}\n\n응답: 이는 테스트 응답입니다. 실제 구현에서는 AI API를 호출하여 응답을 받아옵니다.`);
    }, 1000);
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewTitle>AI 에이전트 미리보기</PreviewTitle>
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

      {activeTab === "prompt" && (
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

      {activeTab === "components" && (
        <ComponentList>
          {generatedPrompt.components.role && (
            <ComponentItem>
              <ComponentTitle>역할</ComponentTitle>
              <ComponentContent>{generatedPrompt.components.role}</ComponentContent>
            </ComponentItem>
          )}

          {generatedPrompt.components.context.length > 0 && (
            <ComponentItem>
              <ComponentTitle>컨텍스트</ComponentTitle>
              <ComponentContent>
                {generatedPrompt.components.context.map((ctx, index) => (
                  <div key={index}>• {ctx}</div>
                ))}
              </ComponentContent>
            </ComponentItem>
          )}

          {generatedPrompt.components.conditions.length > 0 && (
            <ComponentItem>
              <ComponentTitle>조건</ComponentTitle>
              <ComponentContent>
                {generatedPrompt.components.conditions.map((condition, index) => (
                  <div key={index}>• {condition}</div>
                ))}
              </ComponentContent>
            </ComponentItem>
          )}

          {generatedPrompt.components.outputFormat && (
            <ComponentItem>
              <ComponentTitle>출력 형식</ComponentTitle>
              <ComponentContent>{generatedPrompt.components.outputFormat}</ComponentContent>
            </ComponentItem>
          )}

          {generatedPrompt.components.template && (
            <ComponentItem>
              <ComponentTitle>템플릿</ComponentTitle>
              <ComponentContent>{generatedPrompt.components.template}</ComponentContent>
            </ComponentItem>
          )}
        </ComponentList>
      )}

      {activeTab === "test" && (
        <div>
          <TestInput placeholder="테스트할 입력을 입력하세요..." value={testInput} onChange={(e) => setTestInput(e.target.value)} />
          <Button onClick={handleTestPrompt} disabled={!testInput.trim()} variant="primary">
            프롬프트 테스트
          </Button>
          <ResponseArea>{testResponse}</ResponseArea>
        </div>
      )}
    </PreviewContainer>
  );
};
