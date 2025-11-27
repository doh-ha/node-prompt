import React from "react";
import styled, { keyframes } from "styled-components";
import { RiRefreshLine, RiLightbulbLine, RiArrowRightLine } from "react-icons/ri";

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
  title: string;
  description: string;
  type: "next-step" | "prompt-improvement" | "output-suggestion";
}

interface OutputRecommendationPanelProps {
  currentPrompt: string;
  outputResult: string;
  isVisible: boolean;
  onClose: () => void;
}

export const OutputRecommendationPanel: React.FC<OutputRecommendationPanelProps> = ({ currentPrompt, outputResult, isVisible, onClose }) => {
  const [recommendations, setRecommendations] = React.useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUsingFallback, setIsUsingFallback] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  // 추천 결과를 캐시하기 위한 ref
  const recommendationsCacheRef = React.useRef<Map<string, RecommendationItem[]>>(new Map());
  const cacheKeyRef = React.useRef<string>("");

  // 기본 추천 데이터 (fallback용)
  const getDefaultRecommendations = React.useCallback((): RecommendationItem[] => {
    return [
      {
        type: "next-step",
        title: "다른 스타일로 재생성",
        description: "톤이나 형식을 바꿔서 다른 버전의 결과를 생성해보세요.",
      },
      {
        type: "next-step",
        title: "더 구체적인 지시 추가",
        description: "Directive 노드에 더 상세한 요구사항을 추가하면 더 정확한 결과를 얻을 수 있습니다.",
      },
      {
        type: "prompt-improvement",
        title: "Role 노드 수정",
        description: "AI의 역할을 더 구체적으로 정의하면 결과의 품질이 향상됩니다.",
      },
      {
        type: "prompt-improvement",
        title: "Style 노드 추가",
        description: "원하는 톤이나 스타일을 명시하면 더 일관된 결과를 얻을 수 있습니다.",
      },
      {
        type: "output-suggestion",
        title: "출력 형식 변경",
        description: "Table, Markdown, JSON 등 다른 형식으로 결과를 확인해보세요.",
      },
    ];
  }, []);

  // API 호출 함수
  const fetchRecommendations = React.useCallback(
    (forceRegenerate: boolean = false) => {
      if (!currentPrompt.trim() && !outputResult.trim()) return;

      const cacheKey = `${currentPrompt}::${outputResult.substring(0, 100)}`;

      // 캐시에 있고 강제 재생성이 아니면 캐시된 데이터 사용
      if (!forceRegenerate && recommendationsCacheRef.current.has(cacheKey)) {
        const cachedRecommendations = recommendationsCacheRef.current.get(cacheKey)!;
        setRecommendations(cachedRecommendations);
        setIsLoading(false);
        return;
      }

      // 중복 요청 방지: AbortController 사용
      const abortController = new AbortController();
      let isMounted = true;

      setIsLoading(true);
      setIsUsingFallback(false);
      setErrorMessage("");

      const requestBody = {
        currentPrompt: currentPrompt.substring(0, 1000), // 프롬프트도 1000자로 제한
        outputResult: outputResult.substring(0, 300), // 결과의 처음 300자만 전송 (더 짧게)
        nodeType: "output",
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
          if (!isMounted) return;

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.recommendations && Array.isArray(data.recommendations)) {
            const formattedRecommendations: RecommendationItem[] = data.recommendations.map((rec: any) => ({
              type: rec.type || "next-step",
              title: rec.element || rec.value || rec.title || "",
              description: rec.description || "",
            }));

            // 캐시에 저장
            recommendationsCacheRef.current.set(cacheKey, formattedRecommendations);
            cacheKeyRef.current = cacheKey;

            setRecommendations(formattedRecommendations);
            setIsUsingFallback(false);
          } else {
            throw new Error("Invalid response format");
          }
        })
        .catch((error) => {
          if (!isMounted) return;

          if (error.name === "AbortError") {
            console.log("추천 요청이 취소되었습니다.");
            return;
          }

          console.error("추천 API 호출 실패:", error);
          setErrorMessage("추천을 불러오는 중 오류가 발생했습니다.");
          setIsUsingFallback(true);
          setRecommendations(getDefaultRecommendations());
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
        abortController.abort();
      };
    },
    [currentPrompt, outputResult, getDefaultRecommendations]
  );

  // 패널이 보일 때만 캐시된 데이터를 로드하거나 처음이면 API 호출
  React.useEffect(() => {
    if (!isVisible || (!currentPrompt.trim() && !outputResult.trim())) return;

    const cacheKey = `${currentPrompt.substring(0, 100)}::${outputResult.substring(0, 100)}`;
    cacheKeyRef.current = cacheKey;

    // 캐시에 있으면 캐시된 데이터 사용
    if (recommendationsCacheRef.current.has(cacheKey)) {
      const cachedRecommendations = recommendationsCacheRef.current.get(cacheKey)!;
      setRecommendations(cachedRecommendations);
      setIsLoading(false);
    } else {
      // 캐시에 없으면 API 호출
      fetchRecommendations(false);
    }
  }, [isVisible, currentPrompt, outputResult, fetchRecommendations]);

  if (!isVisible) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "next-step":
        return "다음 스텝";
      case "prompt-improvement":
        return "프롬프트 개선";
      case "output-suggestion":
        return "출력 제안";
      default:
        return "추천";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "next-step":
        return "#3b82f6";
      case "prompt-improvement":
        return "#10b981";
      case "output-suggestion":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>다음 단계 추천</h4>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <button
            onClick={() => fetchRecommendations(true)}
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: isLoading ? "#9ca3af" : "#3b82f6",
              padding: "4px",
              borderRadius: "4px",
              transition: "background-color 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#eff6ff";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="재생성"
          >
            {React.createElement(RiRefreshLine as any, { size: 16 })}
          </button>
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
            </div>
          )}
          {errorMessage && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "#fee2e2",
                border: "1px solid #f87171",
                borderRadius: "6px",
                marginBottom: "12px",
                fontSize: "11px",
                color: "#991b1b",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              {errorMessage}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recommendations.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  backgroundColor: "#f8fafc",
                  border: `1px solid ${getTypeColor(item.type)}20`,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.borderColor = getTypeColor(item.type);
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = `${getTypeColor(item.type)}20`;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      color: getTypeColor(item.type),
                      backgroundColor: `${getTypeColor(item.type)}15`,
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                </div>
                <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "13px", color: "#1f2937" }}>{item.title}</div>
                {item.description && <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>{item.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
