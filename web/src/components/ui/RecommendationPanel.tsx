import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: #6b7280;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 12px;
  font-weight: 500;
`;

const LoadingSubtext = styled.div`
  font-size: 10px;
  color: #9ca3af;
`;

interface RecommendationItem {
  value: string;
  description: string;
}

interface RecommendationPanelProps {
  currentPrompt: string;
  nodeType: string;
  onSelectRecommendation: (recommendation: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ currentPrompt, nodeType, onSelectRecommendation, isVisible, onClose }) => {
  const [recommendations, setRecommendations] = React.useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUsingFallback, setIsUsingFallback] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  React.useEffect(() => {
    if (!isVisible || !currentPrompt.trim()) return;

    // 중복 요청 방지: AbortController 사용
    const abortController = new AbortController();
    let isMounted = true;

    setIsLoading(true);
    setIsUsingFallback(false); // API 호출 시작 시 fallback 상태 초기화
    setErrorMessage(""); // 에러 메시지 초기화

    const requestBody = {
      currentPrompt: currentPrompt,
      nodeType: nodeType,
    };

    // 실제 API 호출
    fetch("/api/recommend", {
      signal: abortController.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then(async (response) => {
        // 429 에러 등 실패 시 기본 데이터 사용
        if (!response.ok) {
          const errorText = await response.text();

          console.error("=".repeat(80));
          console.error("❌ RecommendationPanel: API 응답 실패");
          console.error("=".repeat(80));
          console.error("📡 HTTP 상태:", response.status, response.statusText);
          console.error("📋 에러 응답 원문:");
          console.error(errorText);
          console.error("=".repeat(80));

          // 에러 메시지 파싱
          let errorMessage = `API failed with status ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            console.error("📦 파싱된 에러 데이터:", JSON.stringify(errorData, null, 2));
            if (errorData.detail) {
              const detailStr = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);

              // OpenAI API 할당량 부족 에러 확인
              if (detailStr.includes("insufficient_quota") || detailStr.includes("quota") || detailStr.includes("billing")) {
                errorMessage = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요.";
              } else if (detailStr.includes("429")) {
                errorMessage = "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
              } else {
                errorMessage = detailStr;
              }
            }
          } catch (e) {
            // JSON 파싱 실패 시 원본 텍스트 사용
            if (errorText.includes("insufficient_quota") || errorText.includes("quota") || errorText.includes("billing")) {
              errorMessage = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요.";
            }
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.recommendations) {
          setRecommendations(data.recommendations);
        } else {
          // API 실패 시 기본 추천 사용
          const mockRecommendations = {
            task: [
              { value: "주제와 대상 명시", description: "주제와 대상을 명확하게 지정" },
              { value: "출력 형식 명시", description: "구체적인 출력 형식 제시" },
              { value: "주요 내용 포함", description: "핵심 내용 요구사항 명시" },
            ],
            role: [
              { value: "영어 교사", description: "영어 학습을 도와주는 전문가" },
              { value: "일본어 전문가", description: "일본어 문법과 표현을 가르치는 전문가" },
              { value: "중학생", description: "중학생 수준의 이해도로 설명" },
              { value: "작가", description: "창의적이고 문학적인 글쓰기 전문가" },
              { value: "번역가", description: "정확한 번역과 언어 전달 전문가" },
            ],
            style: [
              { value: "친근한 톤", description: "따뜻하고 친근한 말투" },
              { value: "전문적인 톤", description: "정확하고 전문적인 표현" },
              { value: "유머러스한 톤", description: "재미있고 유쾌한 분위기" },
              { value: "격식있는 톤", description: "정중하고 격식있는 표현" },
              { value: "캐주얼한 톤", description: "편안하고 자연스러운 말투" },
            ],
            audience: [
              { value: "초등학생", description: "6-12세 어린이 대상" },
              { value: "중학생", description: "13-15세 청소년 대상" },
              { value: "고등학생", description: "16-18세 고등학생 대상" },
              { value: "대학생", description: "19-22세 대학생 대상" },
              { value: "성인", description: "성인 학습자 대상" },
            ],
            length: [
              { value: "짧게 (1-2문장)", description: "간결하고 핵심적인 내용" },
              { value: "보통 (3-5문장)", description: "적당한 길이의 설명" },
              { value: "길게 (6-10문장)", description: "자세하고 풍부한 설명" },
              { value: "매우 길게 (10문장 이상)", description: "포괄적이고 상세한 내용" },
            ],
          };

          const mockData = mockRecommendations[nodeType as keyof typeof mockRecommendations] || [];
          if (isMounted) {
            setRecommendations(mockData);
          }
        }
        if (isMounted) {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        // AbortError는 무시 (컴포넌트 언마운트 또는 중복 요청)
        if (error.name === "AbortError") {
          return;
        }

        if (!isMounted) return;

        console.error("=".repeat(80));
        console.error("❌ RecommendationPanel: API 호출 실패");
        console.error("=".repeat(80));
        console.error("🔴 에러 타입:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("🔴 에러 메시지:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
          console.error("🔴 스택 트레이스:");
          console.error(error.stack);
        }
        if (error instanceof Error && (error as any).cause) {
          console.error("🔴 원인:", (error as any).cause);
        }
        console.error("=".repeat(80));

        // 에러 메시지 저장
        setErrorMessage(error.message);

        // API 실패 시 기본 추천 사용
        const mockRecommendions = {
          task: [
            { value: '주제와 대상 명시: "초등학생을 위한 영어 동화 작성"', description: "주제와 대상을 명확하게 지정" },
            { value: '출력 형식 명시: "500단어 분량의 간단한 이야기"', description: "구체적인 출력 형식 제시" },
            { value: '주요 내용 포함: "도덕적 교훈이 포함된 이야기"', description: "핵심 내용 요구사항 명시" },
          ],
          role: [
            { value: "영어 교사", description: "영어 학습을 도와주는 전문가" },
            { value: "일본어 전문가", description: "일본어 문법과 표현을 가르치는 전문가" },
            { value: "중학생", description: "중학생 수준의 이해도로 설명" },
            { value: "작가", description: "창의적이고 문학적인 글쓰기 전문가" },
            { value: "번역가", description: "정확한 번역과 언어 전달 전문가" },
          ],
          style: [
            { value: "친근한 톤", description: "따뜻하고 친근한 말투" },
            { value: "전문적인 톤", description: "정확하고 전문적인 표현" },
            { value: "유머러스한 톤", description: "재미있고 유쾌한 분위기" },
            { value: "격식있는 톤", description: "정중하고 격식있는 표현" },
            { value: "캐주얼한 톤", description: "편안하고 자연스러운 말투" },
          ],
          audience: [
            { value: "초등학생", description: "6-12세 어린이 대상" },
            { value: "중학생", description: "13-15세 청소년 대상" },
            { value: "고등학생", description: "16-18세 고등학생 대상" },
            { value: "대학생", description: "19-22세 대학생 대상" },
            { value: "성인", description: "성인 학습자 대상" },
          ],
          length: [
            { value: "짧게 (1-2문장)", description: "간결하고 핵심적인 내용" },
            { value: "보통 (3-5문장)", description: "적당한 길이의 설명" },
            { value: "길게 (6-10문장)", description: "자세하고 풍부한 설명" },
            { value: "매우 길게 (10문장 이상)", description: "포괄적이고 상세한 내용" },
          ],
        };

        const mockData = mockRecommendions[nodeType as keyof typeof mockRecommendions] || [];
        console.log("📝 RecommendationPanel: 기본 추천 데이터 사용 (API 실패)", mockData);
        if (isMounted) {
          setRecommendations(mockData);
          setIsUsingFallback(true);
          setIsLoading(false);
        }
      });

    // cleanup: 컴포넌트 언마운트 또는 dependency 변경 시 진행 중인 요청 취소
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [isVisible, currentPrompt, nodeType]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        right: "0",
        marginTop: "8px",
        width: "280px",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>AI 추천</h4>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            color: "#6b7280",
            padding: "4px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          ×
        </button>
      </div>

      {isLoading ? (
        <LoadingContainer>
          <LoadingContent>
            <Spinner />
            <LoadingText>AI가 추천을 생성하는 중...</LoadingText>
            <LoadingSubtext>잠시만 기다려주세요</LoadingSubtext>
          </LoadingContent>
        </LoadingContainer>
      ) : (
        <div>
          {isUsingFallback && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "#fef3c7",
                border: "1px solid #fbbf24",
                borderRadius: "6px",
                marginBottom: "12px",
                fontSize: "11px",
                color: "#92400e",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              ⚠️ API 연결 실패로 기본 추천을 표시합니다
              {errorMessage && (
                <>
                  <br />
                  <span style={{ fontSize: "10px", marginTop: "4px", display: "block" }}>{errorMessage}</span>
                </>
              )}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {recommendations.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectRecommendation(item.value);
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#475569",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minWidth: "120px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e2e8f0";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontWeight: "600", marginBottom: "2px" }}>{item.value}</div>
                {item.description && <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.3" }}>{item.description}</div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
