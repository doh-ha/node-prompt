import React from "react";
import { PaletteContainer, PaletteTitle, GroupTitle, NodeItem, LibraryNodeIcon, NodeInfo, NodeName, NodeDescription } from "../styles/nodeStyles";
import { groupedTemplates } from "./nodes/registry";

interface LibraryPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onDragStart }) => {
  return (
    <PaletteContainer>
      <PaletteTitle>라이브러리</PaletteTitle>
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
                  ...template.defaultData,
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
    </PaletteContainer>
  );
};
