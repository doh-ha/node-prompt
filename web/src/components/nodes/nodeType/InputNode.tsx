import React, { useMemo } from "react";
import { NodeShell } from "../NodeShell";
import { NodeInput } from "../../../styles/nodeStyles";
import { Node, Edge } from "../../../types/nodeTypes";

interface InputNodeProps {
  data: {
    label?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    content?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
    // 연결된 노드 정보를 위한 props
    allNodes?: Node[];
    allEdges?: Edge[];
  };
  selected?: boolean;
  id?: string;
}

export const InputNode: React.FC<InputNodeProps> = ({ data, selected, id }) => {
  // 연결된 Output 노드의 결과 가져오기
  const connectedOutputResult = useMemo(() => {
    if (!id || !data.allNodes || !data.allEdges) return null;

    // 현재 Input 노드로 들어오는 엣지 찾기 (Output 노드에서 오는 것)
    const incomingEdges = data.allEdges.filter((edge) => edge.target === id);

    // Output 노드에서 온 엣지 찾기
    for (const edge of incomingEdges) {
      const sourceNode = data.allNodes.find((n) => n.id === edge.source);
      if (sourceNode && sourceNode.type === "output") {
        // Output 노드의 결과 가져오기
        const outputResult = sourceNode.data?.result;
        if (outputResult) {
          // 결과가 객체 형태면 (Flow별 결과 저장) 가장 최근 결과 사용
          let resultText = "";
          if (typeof outputResult === "object" && !Array.isArray(outputResult)) {
            const flowNames = Object.keys(outputResult);
            if (flowNames.length > 0) {
              resultText = outputResult[flowNames[flowNames.length - 1]] || "";
            }
          } else if (typeof outputResult === "string") {
            resultText = outputResult;
          }

          if (resultText) {
            return resultText;
          }
        }
      }
    }

    return null;
  }, [id, data.allNodes, data.allEdges]);

  // 연결된 Text 노드의 내용 가져오기
  const connectedTextContent = useMemo(() => {
    if (!id || !data.allNodes || !data.allEdges) return null;

    // 현재 Input 노드로 들어오는 엣지 찾기
    const incomingEdges = data.allEdges.filter((edge) => edge.target === id);

    // Text 노드에서 온 엣지 찾기
    for (const edge of incomingEdges) {
      const sourceNode = data.allNodes.find((n) => n.id === edge.source);
      if (sourceNode && sourceNode.type === "text") {
        // Text 노드의 content 가져오기
        const textContent = sourceNode.data?.content;
        if (textContent && textContent.trim().length > 0) {
          return textContent;
        }
      }
    }

    return null;
  }, [id, data.allNodes, data.allEdges]);

  const hasConnectedOutput = connectedOutputResult !== null;
  const hasConnectedText = connectedTextContent !== null;

  return (
    <NodeShell
      id={id}
      selected={selected}
      title={data.label}
      icon={data.icon}
      iconColor={data.iconColor}
      bg={(data as any).nodeBg}
      onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}
      nodeType="input"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {/* 이전 Flow의 Output */}
        {hasConnectedOutput && (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>[이전 Flow Output]</div>
            <NodeInput
              as="textarea"
              readOnly
              value={connectedOutputResult}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onSelect={(e) => e.stopPropagation()}
              style={{
                minHeight: "60px",
                maxHeight: "150px",
                resize: "none",
                overflow: "auto",
                width: "100%",
                fontSize: "16px",
                userSelect: "text",
                WebkitUserSelect: "text",
                MozUserSelect: "text",
                msUserSelect: "text",
              }}
            />
          </div>
        )}

        {/* Text 노드에서 연결된 입력 */}
        {hasConnectedText && (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>[Text 노드 입력]</div>
            <NodeInput
              as="textarea"
              readOnly
              value={connectedTextContent}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onSelect={(e) => e.stopPropagation()}
              style={{
                minHeight: "60px",
                maxHeight: "150px",
                resize: "none",
                overflow: "auto",
                width: "100%",
                fontSize: "16px",
                userSelect: "text",
                WebkitUserSelect: "text",
                MozUserSelect: "text",
                msUserSelect: "text",
              }}
            />
          </div>
        )}
      </div>
    </NodeShell>
  );
};
