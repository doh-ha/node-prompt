import React from "react";
import { PaletteContainer, PaletteTitle, GroupTitle, NodeItem, LibraryNodeIcon, NodeInfo, NodeName, NodeDescription } from "../styles/nodeStyles";
import { groupedTemplates } from "./nodes/registry";

interface LibraryPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
  onClose?: () => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onDragStart, onClose }) => {
  return (
    <PaletteContainer>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <PaletteTitle style={{ margin: 0 }}>라이브러리</PaletteTitle>
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
      {groupedTemplates.map((group, gi) => (
        <div key={gi}>
          <GroupTitle>{group.title}</GroupTitle>
          {group.items.map((template, ti) => (
            <NodeItem
              key={`${gi}-${ti}`}
              draggable
              style={{ background: template.nodeBg, borderRadius: 8 }}
              onDragStart={(e) => {
                onDragStart(e, template.type, {
                  label: template.name,
                  name: template.name,
                  icon: template.icon,
                  iconColor: template.iconColor,
                  iconBg: undefined,
                  nodeBg: template.nodeBg,
                });
                // Set custom drag image
                const img = e.currentTarget;
                e.dataTransfer.setDragImage(img, 0, 0);
              }}
            >
              <LibraryNodeIcon
                style={{
                  background: "transparent",
                  color: template.iconColor,
                }}
              >
                {template.icon}
              </LibraryNodeIcon>
              <NodeInfo>
                <NodeName style={{ background: template.nodeBg, padding: 2, borderRadius: 4 }}>{template.name}</NodeName>
                <NodeDescription>{template.description}</NodeDescription>
              </NodeInfo>
            </NodeItem>
          ))}
        </div>
      ))}
      <div style={{ height: "50px" }} />
    </PaletteContainer>
  );
};
