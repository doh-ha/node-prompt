import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, Background, BackgroundVariant, ReactFlowProvider, ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import { EditorContainer, FlowContainer } from "../styles/nodeStyles";
import { Button } from "./ui";
import { nodeComponents, nodesRegistry } from "./nodes/registry";
import { colors } from "../constants";
import { usePromptGenerator } from "../hooks/usePromptGenerator";

interface CanvasEditorProps {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

// 레지스트리 규칙과 동일한 배경색 계산 (개별 타입 예외 포함)
const getNodeBgByTypeLocal = (type: string): string => {
  const entry = Object.values(nodesRegistry).find((e: any) => e.type === type) as any;
  const original = entry?.meta?.group as string | undefined;
  const base = original === "flow" ? colors.nodeBg.grey : original === "input" ? colors.nodeBg.blue : original === "output" ? colors.nodeBg.lightGreen : colors.nodeBg.purple;

  if (type === "input") return colors.nodeBg.blue;
  if (type === "model") return colors.nodeBg.lightPurple;
  if (type === "output") return colors.nodeBg.lightGreen;
  return base;
};

const initialNodes: Node[] = [
  {
    id: "start_node",
    type: "start",
    position: { x: 250, y: 0 },
    data: {
      label: "Start",
      icon: "▶️",
      iconColor: colors.nodeIcon.green,
      nodeBg: getNodeBgByTypeLocal("start"),
      flowName: "Flow 1",
    },
  },
  {
    id: "input_node",
    type: "input",
    position: { x: 250, y: 180 },
    data: {
      label: "Input",
      icon: "📥",
      iconColor: colors.nodeIcon.blue,
      nodeBg: getNodeBgByTypeLocal("input"),
    },
  },
  {
    id: "model_node",
    type: "model",
    position: { x: 250, y: 300 },
    data: {
      label: "Model",
      icon: "🤖",
      iconColor: colors.nodeIcon.purple,
      nodeBg: getNodeBgByTypeLocal("model"),
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
  {
    id: "output_node",
    type: "output",
    position: { x: 250, y: 450 },
    data: {
      label: "Output",
      icon: "📤",
      iconColor: colors.nodeIcon.green,
      nodeBg: getNodeBgByTypeLocal("output"),
    },
  },
  {
    id: "result_node",
    type: "result",
    position: { x: 250, y: 550 },
    data: {
      label: "Result",
      icon: "🏁",
      iconColor: colors.nodeIcon.red,
      nodeBg: getNodeBgByTypeLocal("result"),
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "start-to-input",
    source: "start_node",
    target: "input_node",
    sourceHandle: "bottom",
    targetHandle: "top",
  },
  {
    id: "input-to-model",
    source: "input_node",
    target: "model_node",
    sourceHandle: "bottom",
    targetHandle: "top",
  },
  {
    id: "model-to-output",
    source: "model_node",
    target: "output_node",
    sourceHandle: "bottom",
    targetHandle: "top",
  },
  {
    id: "output-to-result",
    source: "output_node",
    target: "result_node",
    sourceHandle: "bottom",
    targetHandle: "top",
  },
];

// 기본 엣지 스타일 (실선)
const defaultEdgeOptions = {
  style: {
    strokeWidth: 2,
    stroke: colors.edge.default,
  },
};

const CanvasEditor: React.FC<CanvasEditorProps> = ({ onNodesChange, onEdgesChange }) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionRafRef = useRef<number | null>(null);
  const nodeIdCounter = useRef(0);

  const { generatedPrompt } = usePromptGenerator(nodes, edges);

  const getId = useCallback(() => {
    return `node_${Date.now()}_${nodeIdCounter.current++}`;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      // 연결점의 색상 타입 확인
      const sourceHandle = document.querySelector(`[data-id="${params.source}"] [data-handle-id="${params.sourceHandle}"]`);
      const targetHandle = document.querySelector(`[data-id="${params.target}"] [data-handle-id="${params.targetHandle}"]`);

      const sourceHandleType = sourceHandle?.getAttribute("data-handle-type");
      const targetHandleType = targetHandle?.getAttribute("data-handle-type");

      // 같은 색상 타입의 연결점끼리만 연결 허용
      if (sourceHandleType === targetHandleType) {
        const newEdges = addEdge(params, edges);
        setEdges(newEdges);
        onEdgesChange(newEdges);
      } else {
        // 다른 색상 타입의 연결점은 연결 차단
        console.log("다른 색상의 연결점끼리는 연결할 수 없습니다.");
        return;
      }
    },
    [setEdges, edges, onEdgesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const data = JSON.parse(event.dataTransfer.getData("application/reactflow-data"));

      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Start 노드인 경우 고유한 플로우 이름 생성 및 개수 제한
        let nodeData = { ...data };
        if (type === "start") {
          const existingStartNodes = nodes.filter((n) => n.type === "start");

          // 최대 3개 제한
          if (existingStartNodes.length >= 5) {
            alert("플로우는 최대 5개까지만 추가할 수 있습니다.");
            return;
          }

          const existingFlowNames = existingStartNodes.filter((n) => n.data?.flowName).map((n) => n.data.flowName);

          let flowNumber = 1;
          let newFlowName = `Flow ${flowNumber}`;

          while (existingFlowNames.includes(newFlowName)) {
            flowNumber++;
            newFlowName = `Flow ${flowNumber}`;
          }

          nodeData.flowName = newFlowName;
        }

        // Flow 노드인 경우 5개의 연결된 노드 생성
        if (type === "flow") {
          const existingStartNodes = nodes.filter((n) => n.type === "start");

          // 최대 3개 제한
          if (existingStartNodes.length >= 5) {
            alert("플로우는 최대 5개까지만 추가할 수 있습니다.");
            return;
          }

          const existingFlowNames = existingStartNodes.filter((n) => n.data?.flowName).map((n) => n.data.flowName);

          let flowNumber = 1;
          let newFlowName = `Flow ${flowNumber}`;

          while (existingFlowNames.includes(newFlowName)) {
            flowNumber++;
            newFlowName = `Flow ${flowNumber}`;
          }

          // 5개 노드 생성 (Start -> Input -> Model -> Output -> Result) - 세로 배치
          const flowNodes: Node[] = [
            {
              id: getId(),
              type: "start",
              position: { x: position.x, y: position.y },
              data: {
                label: "Start",
                icon: "▶️",
                iconColor: colors.nodeIcon.green,
                nodeBg: colors.nodeBg.grey,
                flowName: newFlowName,
                onFlowNameChange: handleFlowNameChange,
                onExecutePrompt: handleExecutePrompt,
                onDeleteNode: handleDeleteNode,
              },
            },
            {
              id: getId(),
              type: "input",
              position: { x: position.x, y: position.y + 150 },
              data: {
                label: "Input",
                icon: "📥",
                iconColor: colors.nodeIcon.blue,
                nodeBg: colors.nodeBg.blue,
                onDeleteNode: handleDeleteNode,
              },
            },
            {
              id: getId(),
              type: "model",
              position: { x: position.x, y: position.y + 300 },
              data: {
                label: "Model",
                icon: "🤖",
                iconColor: colors.nodeIcon.purple,
                nodeBg: colors.nodeBg.lightPurple,
                model: "gpt-4",
                onModelChange: handleModelChange,
                onDeleteNode: handleDeleteNode,
              },
            },
            {
              id: getId(),
              type: "output",
              position: { x: position.x, y: position.y + 450 },
              data: {
                label: "Output",
                icon: "📤",
                iconColor: colors.nodeIcon.green,
                nodeBg: colors.nodeBg.lightGreen,
                onDeleteNode: handleDeleteNode,
              },
            },
            {
              id: getId(),
              type: "result",
              position: { x: position.x, y: position.y + 600 },
              data: {
                label: "Result",
                icon: "🏁",
                iconColor: colors.nodeIcon.red,
                nodeBg: colors.nodeBg.grey,
                result: "결과가 여기에 표시됩니다",
                onDeleteNode: handleDeleteNode,
              },
            },
          ];

          // 연결 엣지 생성
          const flowEdges: Edge[] = [
            { id: `e-${flowNodes[0].id}-${flowNodes[1].id}`, source: flowNodes[0].id, target: flowNodes[1].id },
            { id: `e-${flowNodes[1].id}-${flowNodes[2].id}`, source: flowNodes[1].id, target: flowNodes[2].id },
            { id: `e-${flowNodes[2].id}-${flowNodes[3].id}`, source: flowNodes[2].id, target: flowNodes[3].id },
            { id: `e-${flowNodes[3].id}-${flowNodes[4].id}`, source: flowNodes[3].id, target: flowNodes[4].id },
          ];

          setNodes((prev) => {
            const updatedNodes = prev.concat(flowNodes);
            onNodesChange(updatedNodes);
            return updatedNodes;
          });

          setEdges((prev) => {
            const updatedEdges = prev.concat(flowEdges);
            onEdgesChange(updatedEdges);
            return updatedEdges;
          });

          return; // Flow 노드는 별도 처리하므로 여기서 종료
        }

        const newNode: Node = {
          id: getId(),
          type,
          position,
          data: nodeData,
        };

        setNodes((prev) => {
          const updatedNodes = prev.concat(newNode);
          // 노드 추가 즉시 상위 컴포넌트에 알림
          onNodesChange(updatedNodes);
          return updatedNodes;
        });
      }
    },
    [reactFlowInstance, setNodes, onNodesChange, nodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/reactflow-data", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const handleNodeContentChange = (nodeId: string, content: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, content } } : node));
      // 노드 내용 변경 즉시 상위 컴포넌트에 알림
      onNodesChange(updatedNodes);
      return updatedNodes;
    });
  };

  const handleModelChange = (nodeId: string, model: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, model } } : node));
      // 모델 변경 즉시 상위 컴포넌트에 알림
      onNodesChange(updatedNodes);
      return updatedNodes;
    });
  };

  const handleFlowNameChange = (nodeId: string, flowName: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, flowName } } : node));

      // 부모 컴포넌트에 변경사항 전달
      onNodesChange(updatedNodes);

      return updatedNodes;
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodeId(null);
  };

  const handleExecutePrompt = async (prompt: string) => {
    try {
      // 실제 프롬프트 사용 (generatedPrompt.finalPrompt)
      const actualPrompt = generatedPrompt.finalPrompt || prompt;

      const response = await fetch("/api/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: actualPrompt,
          model: "gpt-4",
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.content || "응답을 받을 수 없습니다.";

        // Result 노드에 결과 표시
        setNodes((nds) => {
          const updatedNodes = nds.map((node) => (node.type === "result" ? { ...node, data: { ...node.data, result } } : node));
          onNodesChange(updatedNodes);
          return updatedNodes;
        });
      } else {
        const errorData = await response.json();
        const errorMessage = `에러: ${errorData.detail || "알 수 없는 오류가 발생했습니다."}`;

        // Result 노드에 에러 표시
        setNodes((nds) => {
          const updatedNodes = nds.map((node) => (node.type === "result" ? { ...node, data: { ...node.data, result: errorMessage } } : node));
          onNodesChange(updatedNodes);
          return updatedNodes;
        });
      }
    } catch (error) {
      const errorMessage = `네트워크 에러: ${error instanceof Error ? error.message : "알 수 없는 오류"}`;

      // Result 노드에 에러 표시
      setNodes((nds) => {
        const updatedNodes = nds.map((node) => (node.type === "result" ? { ...node, data: { ...node.data, result: errorMessage } } : node));
        onNodesChange(updatedNodes);
        return updatedNodes;
      });
    }
  };

  // 상위(App) 상태와 동기화하여 프리뷰가 최신 입력을 반영하도록 함
  useEffect(() => {
    onNodesChange(nodes);
  }, [nodes.length, onNodesChange]); // nodes.length만 의존성으로 변경

  useEffect(() => {
    onEdgesChange(edges);
  }, [edges.length, onEdgesChange]); // edges.length만 의존성으로 변경

  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      handleDeleteNode(selectedNodeId);
    }
  };

  const deleteSelectedNodes = () => {
    if (selectedIds.length === 0) return;
    const idSet = new Set(selectedIds);
    const newNodes = nodes.filter((n) => !idSet.has(n.id));
    const newEdges = edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target));
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedIds([]);
    setSelectedNodeId(null);
  };

  // 키보드 삭제는 비활성화 (툴바 버튼으로만 삭제 지원)

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    onNodesChange([]);
    onEdgesChange([]);
    setSelectedNodeId(null);
  };

  return (
    <EditorContainer>
      <FlowContainer>
        <ReactFlow
          nodes={useMemo(() => {
            return nodes.map((node) => {
              // 레지스트리에서 suggestions 가져오기
              const registryKey = Object.keys(nodesRegistry).find((key) => (nodesRegistry as any)[key].type === node.type);
              const registryEntry = registryKey ? (nodesRegistry as any)[registryKey] : null;
              const suggestions = registryEntry?.meta?.defaultSuggestions;

              return {
                ...node,
                data: {
                  ...node.data,
                  suggestions,
                  onContentChange: (content: string) => handleNodeContentChange(node.id, content),
                  onDeleteNode: handleDeleteNode,
                  onModelChange: (model: string) => handleModelChange(node.id, model),
                  onFlowNameChange: (flowName: string) => handleFlowNameChange(node.id, flowName),
                  onExecutePrompt: handleExecutePrompt,
                },
                // 그룹별 배경색 적용
                style: node.data?.nodeBg ? { ...(node.style || {}), background: node.data.nodeBg } : node.style,
                type: node.type === "context" ? "context" : node.type,
              };
            });
          }, [nodes])}
          edges={edges}
          onNodesChange={onNodesChangeInternal}
          onEdgesChange={onEdgesChangeInternal}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          selectionOnDrag
          onSelectionChange={(sel) => {
            const ids = (sel?.nodes || []).map((n) => n.id);
            if (selectionRafRef.current) cancelAnimationFrame(selectionRafRef.current);
            selectionRafRef.current = requestAnimationFrame(() => setSelectedIds(ids));
          }}
          nodeTypes={nodeComponents}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          proOptions={{ hideAttribution: true }}
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} gap={40} size={1} color={colors.edge.background} />
        </ReactFlow>
      </FlowContainer>
    </EditorContainer>
  );
};

const CanvasEditorWithProvider: React.FC<CanvasEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasEditor {...props} />
    </ReactFlowProvider>
  );
};

export default CanvasEditorWithProvider;
