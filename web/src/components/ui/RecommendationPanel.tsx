import React from "react";

interface RecommendationPanelProps {
  currentPrompt: string;
  nodeType: string;
  onSelectRecommendation: (recommendation: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ currentPrompt, nodeType, onSelectRecommendation, isVisible, onClose }) => {
  const [recommendations, setRecommendations] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isVisible && currentPrompt.trim()) {
      setIsLoading(true);
      // 임시 추천 데이터
      const mockRecommendations = {
        role: ["영어 교사", "일본어 전문가", "중학생", "작가", "번역가"],
        style: ["친근한 톤", "전문적인 톤", "유머러스한 톤", "격식있는 톤", "캐주얼한 톤"],
        audience: ["초등학생", "중학생", "고등학생", "대학생", "성인"],
        length: ["짧게 (1-2문장)", "보통 (3-5문장)", "길게 (6-10문장)", "매우 길게 (10문장 이상)"],
      };

      setTimeout(() => {
        setRecommendations(mockRecommendations[nodeType as keyof typeof mockRecommendations] || []);
        setIsLoading(false);
      }, 1000);
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
        width: "200px",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        padding: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>AI 추천</h4>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            color: "#6b7280",
          }}
        >
          ×
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>추천을 생성하는 중...</div>
      ) : (
        <div>
          {recommendations.map((recommendation, index) => (
            <button
              key={index}
              onClick={() => onSelectRecommendation(recommendation)}
              style={{
                width: "100%",
                padding: "8px 12px",
                marginBottom: "4px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                textAlign: "left",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
            >
              {recommendation}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
