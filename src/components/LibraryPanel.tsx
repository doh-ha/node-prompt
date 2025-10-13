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
          <div
            onClick={onClose}
            style={{
              width: "0",
              height: "0",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: "12px solid #4f46e5",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderRightColor = "#4338ca";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderRightColor = "#4f46e5";
            }}
          />
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
