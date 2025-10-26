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

  React.useEffect(() => {
    if (isVisible && currentPrompt.trim()) {
      setIsLoading(true);
      setIsUsingFallback(false); // API 호출 시작 시 fallback 상태 초기화
      console.log("🔍 RecommendationPanel: API 호출 시작", { currentPrompt, nodeType });

      const requestBody = {
        currentPrompt: currentPrompt,
        nodeType: nodeType,
      };

      console.log("📤 RecommendationPanel: 요청 body:", JSON.stringify(requestBody));
      console.log("📤 RecommendationPanel: 요청 URL:", "/api/recommend");

      // 실제 API 호출
      fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then(async (response) => {
          console.log("🔍 RecommendationPanel: API 응답 상태", response.status);

          // 429 에러 등 실패 시 기본 데이터 사용
          if (!response.ok) {
            const errorText = await response.text();
            console.log("⚠️ RecommendationPanel: API 실패, 기본 데이터 사용");
            console.log("📋 RecommendationPanel: 에러 응답 내용:", errorText);
            throw new Error(`API failed with status ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          console.log("📥 RecommendationPanel: 응답 데이터 전체:", JSON.stringify(data));

          if (data.recommendations) {
            console.log("✅ RecommendationPanel: API 추천 데이터 사용", data.recommendations);
            setRecommendations(data.recommendations);
          } else {
            console.log("⚠️ RecommendationPanel: API 응답에 recommendations 없음, 기본 데이터 사용");
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
            console.log("📝 RecommendationPanel: 기본 추천 데이터 사용", mockData);
            setRecommendations(mockData);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("❌ RecommendationPanel: API 호출 실패", error);

          // API 실패 시 기본 추천 사용
          const mockRecommendations = {
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

          const mockData = mockRecommendations[nodeType as keyof typeof mockRecommendations] || [];
          console.log("📝 RecommendationPanel: 기본 추천 데이터 사용 (API 실패)", mockData);
          setRecommendations(mockData);
          setIsUsingFallback(true);
          setIsLoading(false);
        });
    }
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
              }}
            >
              ⚠️ API 연결 실패로 기본 추천을 표시합니다
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {recommendations.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log("🏷️ RecommendationPanel: 태그 선택됨", { value: item.value, description: item.description });
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
