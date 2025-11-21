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

  const hasConnectedOutput = connectedOutputResult !== null;

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
      {hasConnectedOutput && (
        <div style={{ marginTop: 8 }}>
          <NodeInput
            as="textarea"
            readOnly
            value={connectedOutputResult}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onSelect={(e) => e.stopPropagation()}
            style={{
              minHeight: "80px",
              maxHeight: "200px",
              resize: "none",
              overflow: "auto",
              width: "100%",
              fontSize: "13px",
              userSelect: "text",
              WebkitUserSelect: "text",
              MozUserSelect: "text",
              msUserSelect: "text",
            }}
          />
        </div>
      )}
    </NodeShell>
  );
};
