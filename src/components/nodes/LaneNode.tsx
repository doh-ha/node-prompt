import React from "react";

interface LaneNodeProps {
  data: {
    label: string;
    color: string;
  };
  selected?: boolean;
}

export const LaneNode: React.FC<LaneNodeProps> = ({ data, selected }) => {
  const bg = data.color || "#eef2ff";
  const border = selected ? "2px solid #6366f1" : "1px solid rgba(0,0,0,0.08)";
  const style: React.CSSProperties = {
    width: 180,
    height: 180,
    borderRadius: 12,
    background: bg,
    border,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#374151",
    boxShadow: selected ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
    userSelect: "none",
  };
  return <div style={style}>{data.label}</div>;
};
