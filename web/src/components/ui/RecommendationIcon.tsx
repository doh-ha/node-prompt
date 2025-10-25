import React from "react";
import { RiAiGenerate2 } from "react-icons/ri";

interface RecommendationIconProps {
  onClick: () => void;
  isVisible?: boolean;
}

export const RecommendationIcon: React.FC<RecommendationIconProps> = ({ onClick, isVisible = false }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: "8px",
        right: "8px",
        width: "25px",
        height: "25px",
        backgroundColor: isVisible ? "#3b82f6" : "#f3f4f6",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: isVisible ? "white" : "#6b7280",
        transition: "all 0.2s ease",
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isVisible ? "#2563eb" : "#e5e7eb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isVisible ? "#3b82f6" : "#f3f4f6";
      }}
      title="AI 추천 보기"
    >
      {React.createElement(RiAiGenerate2 as any, { size: 25 })}
    </button>
  );
};
