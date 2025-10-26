import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, Background, BackgroundVariant, ReactFlowProvider, ReactFlowInstance, SelectionMode } from "reactflow";
import "reactflow/dist/style.css";
import { EditorContainer, FlowContainer } from "../styles/nodeStyles";
import { Button } from "./ui";
import { nodeComponents, nodesRegistry } from "./nodes/registry";
import { colors } from "../constants";
import { usePromptGenerator } from "../hooks/usePromptGenerator";
import { generatePromptFromWorkflow } from "../utils/promptGenerator";

interface CanvasEditorProps {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  canvasMode: "pan" | "select";
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
  {
    id: "task_node",
    type: "promptTemplate",
    position: { x: 600, y: 300 },
    data: {
      label: "Task",
      icon: "📝",
      iconColor: colors.nodeIcon.purple,
      nodeBg: colors.nodeBg.lightPurple,
      content: "",
      name: "Task",
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
  {
    id: "model-to-task",
    source: "model_node",
    target: "task_node",
    sourceHandle: "right",
    targetHandle: "left",
  },
];

// 기본 엣지 스타일 (실선)
const defaultEdgeOptions = {
  style: {
    strokeWidth: 2,
    stroke: colors.edge.default,
  },
};

const CanvasEditor: React.FC<CanvasEditorProps> = ({ onNodesChange, onEdgesChange, canvasMode }) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionRafRef = useRef<number | null>(null);
  const nodeIdCounter = useRef(0);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [copyOffset, setCopyOffset] = useState({ x: 50, y: 50 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [pastePosition, setPastePosition] = useState<{ x: number; y: number } | null>(null);

  const { generatedPrompt } = usePromptGenerator(nodes, edges);

  // Flow별 프롬프트 생성 함수
  const generateFlowPrompt = (startNodeId: string) => {
    console.log("🔍 Flow별 프롬프트 생성 시작:", startNodeId);

    // 해당 Flow의 노드들 찾기
    const findFlowNodes = (currentNodeId: string, visited: Set<string> = new Set()): string[] => {
      if (visited.has(currentNodeId)) {
        console.log(`🔄 이미 방문한 노드: ${currentNodeId}`);
        return [];
      }
      visited.add(currentNodeId);

      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) {
        console.log(`❌ 노드를 찾을 수 없음: ${currentNodeId}`);
        return [];
      }

      console.log(`🔍 현재 노드 처리 중: ${currentNodeId} (${currentNode.type})`);
      const result = [currentNodeId];

      // 현재 노드에서 연결된 다음 노드들을 찾기
      const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
      const nextNodes = outgoingEdges.map((edge) => edge.target);

      console.log(
        `🔗 ${currentNodeId}에서 나가는 엣지들:`,
        outgoingEdges.map((e) => `${e.source}->${e.target}`)
      );
      console.log(`🔗 다음 노드들:`, nextNodes);

      nextNodes.forEach((nextNodeId) => {
        const subResult = findFlowNodes(nextNodeId, visited);
        result.push(...subResult);
      });

      console.log(`✅ ${currentNodeId} 처리 완료, 결과:`, result);
      return result;
    };

    const flowNodeIds = findFlowNodes(startNodeId);
    const flowNodes = nodes.filter((node) => flowNodeIds.includes(node.id));
    const flowEdges = edges.filter((edge) => flowNodeIds.includes(edge.source) && flowNodeIds.includes(edge.target));

    console.log("🔄 Flow 노드들:", flowNodeIds);
    console.log(
      "🔄 Flow 노드 상세:",
      flowNodes.map((n) => ({ id: n.id, type: n.type, data: n.data }))
    );
    console.log(
      "🔄 Flow 엣지들:",
      flowEdges.map((e) => `${e.source}->${e.target}`)
    );

    // 프롬프트 생성 가능한 노드들 확인
    const promptGeneratingNodes = flowNodes.filter((node) => {
      const registryKey = Object.keys(nodesRegistry).find((key) => (nodesRegistry as any)[key].type === node.type);
      const entry = registryKey ? (nodesRegistry as any)[registryKey] : null;
      return entry && typeof entry.toPrompt === "function";
    });

    console.log(
      "📝 프롬프트 생성 가능한 노드들:",
      promptGeneratingNodes.map((n) => ({
        id: n.id,
        type: n.type,
        hasToPrompt: true,
      }))
    );

    // 각 노드의 toPrompt 결과 확인
    flowNodes.forEach((node) => {
      const registryKey = Object.keys(nodesRegistry).find((key) => (nodesRegistry as any)[key].type === node.type);
      const entry = registryKey ? (nodesRegistry as any)[registryKey] : null;
      if (entry && typeof entry.toPrompt === "function") {
        const promptPiece = entry.toPrompt(node.data);
        console.log(`🔍 ${node.type} 노드 (${node.id}) 프롬프트 조각:`, promptPiece);
      } else {
        console.log(`❌ ${node.type} 노드 (${node.id}) - toPrompt 함수 없음`);
      }
    });

    // 해당 Flow의 프롬프트 생성
    const flowPrompt = generatePromptFromWorkflow(flowNodes, flowEdges);

    console.log("📝 Flow별 생성된 프롬프트:", {
      finalPrompt: flowPrompt.finalPrompt,
      components: flowPrompt.components,
    });

    return flowPrompt;
  };

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
            // 프롬프트 생성 노드 추가
            {
              id: getId(),
              type: "promptTemplate",
              position: { x: position.x + 250, y: position.y + 150 },
              data: {
                label: "Task",
                icon: "📝",
                iconColor: colors.nodeIcon.purple,
                nodeBg: colors.nodeBg.lightPurple,
                content: "",
                name: "Task",
                onContentChange: (content: string, fileName?: string) => handleNodeContentChange(getId(), content, fileName),
                onDeleteNode: handleDeleteNode,
              },
            },
          ];

          // 연결 엣지 생성
          const flowEdges: Edge[] = [
            // 메인 플로우 연결 (회색 연결점 사용: top/bottom)
            { id: `e-${flowNodes[0].id}-${flowNodes[1].id}`, source: flowNodes[0].id, target: flowNodes[1].id, sourceHandle: "bottom", targetHandle: "top" },
            { id: `e-${flowNodes[1].id}-${flowNodes[2].id}`, source: flowNodes[1].id, target: flowNodes[2].id, sourceHandle: "bottom", targetHandle: "top" },
            { id: `e-${flowNodes[2].id}-${flowNodes[3].id}`, source: flowNodes[2].id, target: flowNodes[3].id, sourceHandle: "bottom", targetHandle: "top" },
            { id: `e-${flowNodes[3].id}-${flowNodes[4].id}`, source: flowNodes[3].id, target: flowNodes[4].id, sourceHandle: "bottom", targetHandle: "top" },
            // 프롬프트 생성 노드를 Model에 연결 (색상 연결점 사용: left/right)
            { id: `e-${flowNodes[2].id}-${flowNodes[5].id}`, source: flowNodes[2].id, target: flowNodes[5].id, sourceHandle: "right", targetHandle: "left" },
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

  const onNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    setSelectedIds([node.id]);
  };

  const onPaneContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    // 선택된 노드가 있으면 복사 표시
    if (selectedIds.length > 0) {
      const position = reactFlowInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY }) || { x: 0, y: 0 };
      setPastePosition(position);
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: "" });
    } else {
      // 선택된 노드가 없으면 붙여넣기 위치만 저장
      const position = reactFlowInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY }) || { x: 0, y: 0 };
      setPastePosition(position);
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: "" });
      setSelectedIds([]);
    }
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
    setContextMenu(null);
  };

  const handleNodeContentChange = (nodeId: string, content: string, fileName?: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data, content };
          if (fileName) {
            updatedData.fileName = fileName;
          }
          return { ...node, data: updatedData };
        }
        return node;
      });
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

  const handleExecutePrompt = async (prompt: string, startNodeId?: string) => {
    console.log("🚀 handleExecutePrompt 호출됨:", { prompt, startNodeId });
    console.log("📊 전체 노드 수:", nodes.length);
    console.log("📊 전체 엣지 수:", edges.length);

    try {
      console.log("🔄 Flow별 프롬프트 생성 시작...");
      // Flow별 프롬프트 생성
      const flowPrompt = startNodeId ? generateFlowPrompt(startNodeId) : generatedPrompt;
      const actualPrompt = flowPrompt.finalPrompt || prompt;

      console.log("📝 최종 사용할 프롬프트:", actualPrompt);
      console.log("📝 프롬프트 길이:", actualPrompt.length);

      if (!actualPrompt || actualPrompt.trim() === "") {
        console.warn("⚠️ 프롬프트가 비어있습니다!");
        return;
      }

      console.log("🌐 API 호출 시작...");

      const requestBody = {
        prompt: actualPrompt,
        model: "gpt-4",
        temperature: 0.7,
      };

      console.log("📤 요청 body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch("/api/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📡 API 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API 에러 응답:", errorText);
        console.error("📋 에러 상세:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Error 객체에서 detail 파싱
        let errorMessage = "서버 오류가 발생했습니다.";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) {
            errorMessage = errorData.detail;

            // OpenAI quota 에러 감지
            if (errorData.detail.includes("insufficient_quota") || errorData.detail.includes("429")) {
              errorMessage = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요.";
            }
          }
        } catch (e) {
          console.log("에러 파싱 실패:", e);
        }

        // Result 노드에 에러 메시지 표시
        const resultMessage = errorMessage;
        setNodes((nds) => {
          const updatedNodes = nds.map((node) => {
            if (node.type === "result" && startNodeId) {
              const findResultNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
                if (visited.has(currentNodeId)) return false;
                visited.add(currentNodeId);
                if (currentNodeId === node.id) return true;
                const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);
                return nextNodes.some((nextNodeId) => findResultNode(nextNodeId, visited));
              };

              if (findResultNode(startNodeId)) {
                console.log("🎯 Result 노드에 에러 메시지 표시:", node.id, resultMessage);
                return { ...node, data: { ...node.data, result: resultMessage } };
              }
            }
            return node;
          });
          console.log("📊 업데이트된 노드 수:", updatedNodes.length);
          return updatedNodes;
        });

        return;
      }

      if (response.ok) {
        const data = await response.json();
        const result = data.content || "응답을 받을 수 없습니다.";
        console.log("✅ API 응답 성공:", result);
        console.log("📏 응답 길이:", result.length);

        console.log("🎯 Result 노드 찾기 시작...");
        // 특정 Flow의 Result 노드에만 결과 표시
        setNodes((nds) => {
          const updatedNodes = nds.map((node) => {
            if (node.type === "result" && startNodeId) {
              // 해당 Flow의 Result 노드인지 확인 (간단한 방법)
              // Start -> Input -> Model -> Output -> Result 순서로 연결되어 있으므로
              // Start 노드에서 시작해서 Result 노드까지의 경로를 찾기
              const findResultNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
                if (visited.has(currentNodeId)) return false;
                visited.add(currentNodeId);

                if (currentNodeId === node.id) return true;

                // 현재 노드에서 연결된 다음 노드들을 찾기
                const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);

                return nextNodes.some((nextNodeId) => findResultNode(nextNodeId, visited));
              };

              if (findResultNode(startNodeId)) {
                console.log("🎯 Result 노드 업데이트:", node.id, result);
                return { ...node, data: { ...node.data, result } };
              }
            }
            return node;
          });
          console.log("🔄 노드 업데이트 완료");
          onNodesChange(updatedNodes);
          return updatedNodes;
        });
      } else {
        const errorData = await response.json();
        const errorMessage = `에러: ${errorData.detail || "알 수 없는 오류가 발생했습니다."}`;

        // 특정 Flow의 Result 노드에만 에러 표시
        setNodes((nds) => {
          const updatedNodes = nds.map((node) => {
            if (node.type === "result" && startNodeId) {
              const findResultNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
                if (visited.has(currentNodeId)) return false;
                visited.add(currentNodeId);

                if (currentNodeId === node.id) return true;

                const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);

                return nextNodes.some((nextNodeId) => findResultNode(nextNodeId, visited));
              };

              if (findResultNode(startNodeId)) {
                return { ...node, data: { ...node.data, result: errorMessage } };
              }
            }
            return node;
          });
          onNodesChange(updatedNodes);
          return updatedNodes;
        });
      }
    } catch (error) {
      console.error("❌ handleExecutePrompt 에러:", error);
      const errorMessage = `네트워크 에러: ${error instanceof Error ? error.message : "알 수 없는 오류"}`;

      console.log("🚨 에러 메시지:", errorMessage);

      // 특정 Flow의 Result 노드에만 에러 표시
      setNodes((nds) => {
        const updatedNodes = nds.map((node) => {
          if (node.type === "result" && startNodeId) {
            const findResultNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
              if (visited.has(currentNodeId)) return false;
              visited.add(currentNodeId);

              if (currentNodeId === node.id) return true;

              const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);

              return nextNodes.some((nextNodeId) => findResultNode(nextNodeId, visited));
            };

            if (findResultNode(startNodeId)) {
              console.log("🚨 에러를 Result 노드에 표시:", node.id, errorMessage);
              return { ...node, data: { ...node.data, result: errorMessage } };
            }
          }
          return node;
        });
        onNodesChange(updatedNodes);
        return updatedNodes;
      });
    } finally {
      console.log("🏁 handleExecutePrompt 완료");
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

  // 복사/붙여넣기 기능
  const copyNodes = () => {
    if (selectedIds.length === 0) return;

    const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));
    const selectedEdges = edges.filter((e) => selectedIds.includes(e.source) && selectedIds.includes(e.target));

    // 연결된 노드들만 복사
    setCopiedNodes(selectedNodes);
    console.log("📋 복사됨:", selectedNodes.length, "개 노드");
  };

  const pasteNodes = () => {
    if (copiedNodes.length === 0) return;

    // 새로운 ID 생성
    const idMap = new Map<string, string>();
    let isContextMenuPaste = !!pastePosition;

    const timestamp = Date.now();
    const newNodes = copiedNodes.map((node, index) => {
      const newId = `node_${timestamp}_${nodeIdCounter.current++}`;
      idMap.set(node.id, newId);

      let newPosition;
      if (pastePosition) {
        // 컨텍스트 메뉴에서 붙여넣기한 경우 지정된 위치에서 오프셋 적용
        newPosition = {
          x: pastePosition.x + (index % 3) * 200, // 3개씩 행으로 배치
          y: pastePosition.y + Math.floor(index / 3) * 150,
        };
      } else {
        // Ctrl+V로 붙여넣기한 경우 오프셋 적용
        newPosition = {
          x: node.position.x + copyOffset.x,
          y: node.position.y + copyOffset.y,
        };
      }

      return {
        ...node,
        id: newId,
        position: newPosition,
        data: {
          ...node.data, // 모든 데이터 유지 (content, model 등)
        },
      };
    });

    if (isContextMenuPaste) {
      setPastePosition(null); // 위치 초기화
    }

    // 새 노드를 추가
    setNodes([...nodes, ...newNodes]);
    setCopyOffset({ x: copyOffset.x + 10, y: copyOffset.y + 10 }); // 붙여넣기마다 오프셋 증가
    console.log("📄 붙여넣기됨:", newNodes.length, "개 노드");
  };

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        copyNodes();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        pasteNodes();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      setContextMenu(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [selectedIds, copiedNodes, nodes, edges, copyOffset]);

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
                  currentFullPrompt: generatedPrompt.finalPrompt, // 전체 프롬프트 전달
                  onContentChange: (content: string, fileName?: string) => handleNodeContentChange(node.id, content, fileName),
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
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          selectionOnDrag={canvasMode === "select"}
          selectionMode={SelectionMode.Partial}
          panOnDrag={canvasMode === "pan"}
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

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 10000,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "120px",
            padding: "4px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              copyNodes();
              setContextMenu(null);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "white",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "13px",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
          >
            📋 복사 (Ctrl+C)
          </button>
          {copiedNodes.length > 0 && (
            <button
              onClick={() => {
                pasteNodes();
                setContextMenu(null);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "white",
                textAlign: "left",
                cursor: copiedNodes.length > 0 ? "pointer" : "not-allowed",
                fontSize: "13px",
                borderRadius: "4px",
                opacity: copiedNodes.length > 0 ? 1 : 0.5,
              }}
              onMouseEnter={(e) => copiedNodes.length > 0 && (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              📄 붙여넣기 (Ctrl+V)
            </button>
          )}
        </div>
      )}
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
