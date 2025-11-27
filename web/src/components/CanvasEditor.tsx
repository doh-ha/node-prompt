import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, Background, BackgroundVariant, ReactFlowProvider, ReactFlowInstance, SelectionMode, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { EditorContainer, FlowContainer } from "../styles/nodeStyles";
import { Button } from "./ui";
import { nodeComponents, nodesRegistry } from "./nodes/registry";
import { colors, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "../constants";
import { usePromptGenerator } from "../hooks/usePromptGenerator";
import { generatePromptFromWorkflow } from "../utils/promptGenerator";
import { logger } from "../services/logger";

interface CanvasEditorProps {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  canvasMode: "pan" | "select" | "lock";
  initialNodes?: Node[];
  initialEdges?: Edge[];
  canvasId?: string;
  canvasName?: string;
}

// 레지스트리 규칙과 동일한 배경색 계산 (개별 타입 예외 포함)
const getNodeBgByTypeLocal = (type: string): string => {
  const entry = Object.values(nodesRegistry).find((e: any) => e.type === type) as any;
  const original = entry?.meta?.group as string | undefined;
  const base =
    original === "flow"
      ? colors.nodeBg.grey
      : original === "input"
      ? colors.nodeBg.blue
      : original === "output"
      ? colors.nodeBg.lightGreen
      : original === "context" || original === "instruction"
      ? colors.nodeBg.red
      : colors.nodeBg.purple;

  if (type === "input") return colors.nodeBg.blue;
  if (type === "model") return colors.nodeBg.red;
  if (type === "output") return colors.nodeBg.lightGreen;
  if (type === "promptTemplate") return colors.nodeBg.red;
  return base;
};

// 레지스트리에서 메타를 가져와 기본 데이터 생성
const getMetaFromRegistry = (type: string) => {
  const entry = Object.values(nodesRegistry).find((e: any) => e.type === type) as any;
  const meta = entry?.meta || {};
  return {
    label: meta.name as string | undefined,
    icon: meta.icon as string | undefined,
    iconColor: meta.iconColor as string | undefined,
  };
};

const initialNodes: Node[] = [
  {
    id: "start_node",
    type: "start",
    position: { x: 250, y: 0 },
    data: {
      ...getMetaFromRegistry("start"),
      nodeBg: getNodeBgByTypeLocal("start"),
      flowName: "Flow 1",
    },
  },
  {
    id: "input_node",
    type: "input",
    position: { x: 250, y: 180 },
    data: {
      ...getMetaFromRegistry("input"),
      nodeBg: getNodeBgByTypeLocal("input"),
    },
  },
  {
    id: "model_node",
    type: "model",
    position: { x: 250, y: 300 },
    data: {
      ...getMetaFromRegistry("model"),
      nodeBg: getNodeBgByTypeLocal("model"),
      model: DEFAULT_MODEL,
      temperature: DEFAULT_TEMPERATURE,
      maxTokens: DEFAULT_MAX_TOKENS,
    },
  },
  {
    id: "output_node",
    type: "output",
    position: { x: 250, y: 450 },
    data: {
      ...getMetaFromRegistry("output"),
      nodeBg: getNodeBgByTypeLocal("output"),
    },
  },
  {
    id: "result_node",
    type: "result",
    position: { x: 250, y: 550 },
    data: {
      ...getMetaFromRegistry("result"),
      nodeBg: getNodeBgByTypeLocal("result"),
    },
  },
  {
    id: "task_node",
    type: "promptTemplate",
    position: { x: 600, y: 300 },
    data: {
      ...getMetaFromRegistry("promptTemplate"),
      nodeBg: getNodeBgByTypeLocal("promptTemplate"),
      content: "",
      name: "Directive",
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
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: colors.edge.default,
    },
  },
  {
    id: "input-to-model",
    source: "input_node",
    target: "model_node",
    sourceHandle: "bottom",
    targetHandle: "top",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: colors.edge.default,
    },
  },
  {
    id: "model-to-output",
    source: "model_node",
    target: "output_node",
    sourceHandle: "bottom",
    targetHandle: "top",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: colors.edge.default,
    },
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
    markerStart: {
      type: MarkerType.ArrowClosed,
      color: colors.edge.default,
    },
  },
];

// 기본 엣지 스타일 (실선)
const defaultEdgeOptions = {
  style: {
    strokeWidth: 2,
    stroke: colors.edge.default,
  },
};

const CanvasEditor: React.FC<CanvasEditorProps> = ({ onNodesChange, onEdgesChange, canvasMode, initialNodes: propInitialNodes, initialEdges: propInitialEdges, canvasId, canvasName }) => {
  const nodesInit = propInitialNodes !== undefined ? propInitialNodes : initialNodes;
  const edgesInit = propInitialEdges !== undefined ? propInitialEdges : initialEdges;
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(nodesInit);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(edgesInit);

  // 초기 마운트 감지를 위한 ref
  const isInitialMountRef = useRef<boolean>(true);
  const prevCanvasIdRef = useRef<string | undefined>(canvasId);

  // onNodesChange와 onEdgesChange를 ref로 저장하여 항상 최신 버전 참조
  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);

  useEffect(() => {
    onNodesChangeRef.current = onNodesChange;
    onEdgesChangeRef.current = onEdgesChange;
  }, [onNodesChange, onEdgesChange]);

  // 캔버스 전환 시 초기 마운트 플래그 재설정 및 로깅 시작
  useEffect(() => {
    if (canvasId !== prevCanvasIdRef.current) {
      // 이전 캔버스 로깅 중지
      if (prevCanvasIdRef.current && logger.getIsLogging()) {
        logger.stopLogging();
      }

      prevCanvasIdRef.current = canvasId;
      isInitialMountRef.current = true;

      // 새 캔버스 로깅 시작
      if (canvasId) {
        logger.startLogging(canvasId);
        // 저장된 캔버스 로그가 있으면 불러오기
        const storedLog = logger.getStoredCanvasLog(canvasId);
        if (storedLog) {
          logger.setCanvasId(canvasId);
        }
      }
    } else if (canvasId && !logger.getIsLogging()) {
      // 같은 캔버스지만 로깅이 시작되지 않은 경우
      logger.startLogging(canvasId);
    }
  }, [canvasId]);

  // 첫 렌더링 후 초기 마운트 플래그 해제
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
  }, []);

  // onNodesChange와 onEdgesChange를 래핑하여 초기 마운트 시 호출 방지
  // useCallback의 의존성을 제거하여 재생성 방지
  const wrappedOnNodesChange = useCallback((nodes: Node[]) => {
    if (!isInitialMountRef.current) {
      onNodesChangeRef.current(nodes);
    }
  }, []);

  const wrappedOnEdgesChange = useCallback((edges: Edge[]) => {
    if (!isInitialMountRef.current) {
      onEdgesChangeRef.current(edges);
    }
  }, []);

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionRafRef = useRef<number | null>(null);
  const nodeIdCounter = useRef(0);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [copyOffset, setCopyOffset] = useState({ x: 50, y: 50 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [pastePosition, setPastePosition] = useState<{ x: number; y: number } | null>(null);
  const executingPromptRef = useRef<boolean>(false);

  // 함수들을 ref로 저장하여 onDrop에서 접근
  const handleFlowNameChangeRef = useRef<((nodeId: string, flowName: string) => void) | null>(null);
  const handleExecutePromptRef = useRef<((prompt: string, startNodeId?: string) => Promise<void>) | null>(null);
  const handleDeleteNodeRef = useRef<((nodeId: string) => void) | null>(null);
  const handleModelChangeRef = useRef<((nodeId: string, model: string) => void) | null>(null);
  const handleFormatChangeRef = useRef<((nodeId: string, format: string) => void) | null>(null);
  const handleNodeSizeChangeRef = useRef<((nodeId: string, width: number, height: number) => void) | null>(null);
  const handleNodeContentChangeRef = useRef<((nodeId: string, content: string, fileName?: string, description?: string) => void) | null>(null);

  const { generatedPrompt } = usePromptGenerator(nodes, edges);

  // Canvas 이름에서 접두사 추출 (Canvas A -> A, Canvas AA -> AA)
  const getCanvasPrefix = useCallback(() => {
    if (!canvasName) return "";
    const match = canvasName.match(/Canvas\s+([A-Z]+)/i);
    return match ? match[1].toUpperCase() : "";
  }, [canvasName]);

  // 노드가 속한 Flow들을 찾는 함수 (노드가 여러 Flow에 속할 수 있음)
  const findFlowsForNode = useCallback(
    (nodeId: string): string[] => {
      const startNodes = nodes.filter((node) => node.type === "start" && node.data?.flowName);
      const flows: string[] = [];

      startNodes.forEach((startNode) => {
        const flowName = startNode.data.flowName;
        const reachableNodeIds = new Set<string>([startNode.id]);
        const visited = new Set<string>();

        // 하류(나가는 엣지) 방향으로 탐색
        const findFlowNodes = (currentNodeId: string) => {
          if (visited.has(currentNodeId)) {
            return;
          }
          visited.add(currentNodeId);
          reachableNodeIds.add(currentNodeId);

          const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
          outgoingEdges.forEach((edge) => {
            findFlowNodes(edge.target);
          });
        };

        // 상류(들어오는 엣지) 방향으로 역추적
        const collectUpstream = (targetId: string) => {
          const incoming = edges.filter((e) => e.target === targetId);
          incoming.forEach((e) => {
            if (!reachableNodeIds.has(e.source)) {
              reachableNodeIds.add(e.source);
              collectUpstream(e.source);
            }
          });
        };

        findFlowNodes(startNode.id);
        Array.from(reachableNodeIds).forEach((id) => collectUpstream(id));

        // 이 노드가 이 Flow에 속하는지 확인
        if (reachableNodeIds.has(nodeId)) {
          flows.push(flowName);
        }
      });

      return flows;
    },
    [nodes, edges]
  );

  // Flow별 프롬프트 생성 함수
  const generateFlowPrompt = (startNodeId: string) => {
    // 해당 Flow의 노드들 찾기
    const findFlowNodes = (currentNodeId: string, visited: Set<string> = new Set()): string[] => {
      if (visited.has(currentNodeId)) {
        return [];
      }
      visited.add(currentNodeId);

      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) {
        return [];
      }

      const result = [currentNodeId];

      // 현재 노드에서 연결된 다음 노드들을 찾기
      const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
      const nextNodes = outgoingEdges.map((edge) => edge.target);

      nextNodes.forEach((nextNodeId) => {
        const subResult = findFlowNodes(nextNodeId, visited);
        result.push(...subResult);
      });

      return result;
    };

    // 1) 하류(나가는 엣지) 방향으로 탐색해 기본 플로우 수집
    const flowNodeIds = findFlowNodes(startNodeId);

    // 2) 상류(들어오는 엣지) 방향으로 역추적하여 입력 노드 포함
    const allIds = new Set<string>(flowNodeIds);
    const collectUpstream = (targetId: string) => {
      const incoming = edges.filter((e) => e.target === targetId);
      incoming.forEach((e) => {
        if (!allIds.has(e.source)) {
          allIds.add(e.source);
          collectUpstream(e.source);
        }
      });
    };
    flowNodeIds.forEach((id) => collectUpstream(id));

    const flowNodes = nodes.filter((node) => allIds.has(node.id));
    const flowEdges = edges.filter((edge) => allIds.has(edge.source) && allIds.has(edge.target));

    // 해당 Flow의 프롬프트 생성
    const flowPrompt = generatePromptFromWorkflow(flowNodes, flowEdges);

    return flowPrompt;
  };

  // 노드가 속한 Flow의 프롬프트를 생성하는 함수
  // 노드가 여러 Flow에 속하면 모든 Flow의 프롬프트를 병합
  const getFlowPromptForNode = useCallback(
    (nodeId: string): string => {
      const flows = findFlowsForNode(nodeId);

      // 노드가 속한 Flow가 없으면 빈 문자열 반환
      if (flows.length === 0) {
        return "";
      }

      // Flow별 프롬프트 생성 헬퍼 함수
      const generateFlowPromptForStartNode = (startNodeId: string): string => {
        // 해당 Flow의 노드들 찾기
        const findFlowNodes = (currentNodeId: string, visited: Set<string> = new Set()): string[] => {
          if (visited.has(currentNodeId)) {
            return [];
          }
          visited.add(currentNodeId);

          const currentNode = nodes.find((n) => n.id === currentNodeId);
          if (!currentNode) {
            return [];
          }

          const result = [currentNodeId];

          // 현재 노드에서 연결된 다음 노드들을 찾기
          const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);
          const nextNodes = outgoingEdges.map((edge) => edge.target);

          nextNodes.forEach((nextNodeId) => {
            const subResult = findFlowNodes(nextNodeId, visited);
            result.push(...subResult);
          });

          return result;
        };

        // 1) 하류(나가는 엣지) 방향으로 탐색해 기본 플로우 수집
        const flowNodeIds = findFlowNodes(startNodeId);

        // 2) 상류(들어오는 엣지) 방향으로 역추적하여 입력 노드 포함
        const allIds = new Set<string>(flowNodeIds);
        const collectUpstream = (targetId: string) => {
          const incoming = edges.filter((e) => e.target === targetId);
          incoming.forEach((e) => {
            if (!allIds.has(e.source)) {
              allIds.add(e.source);
              collectUpstream(e.source);
            }
          });
        };
        flowNodeIds.forEach((id) => collectUpstream(id));

        const flowNodes = nodes.filter((node) => allIds.has(node.id));
        const flowEdges = edges.filter((edge) => allIds.has(edge.source) && allIds.has(edge.target));

        // 해당 Flow의 프롬프트 생성
        const flowPrompt = generatePromptFromWorkflow(flowNodes, flowEdges);
        return flowPrompt.finalPrompt || "";
      };

      // 노드가 속한 모든 Flow의 프롬프트 생성
      const flowPrompts: string[] = [];
      flows.forEach((flowName) => {
        const startNode = nodes.find((n) => n.type === "start" && n.data?.flowName === flowName);
        if (startNode) {
          const prompt = generateFlowPromptForStartNode(startNode.id);
          if (prompt) {
            flowPrompts.push(prompt);
          }
        }
      });

      // 여러 Flow의 프롬프트를 병합 (중복 제거를 위해 Set 사용)
      if (flowPrompts.length === 0) {
        return "";
      } else if (flowPrompts.length === 1) {
        return flowPrompts[0];
      } else {
        // 여러 Flow의 프롬프트를 병합 (각 Flow를 구분하여 표시)
        return flowPrompts.join("\n\n---\n\n");
      }
    },
    [nodes, edges, findFlowsForNode]
  );

  const getId = useCallback(() => {
    return `node_${Date.now()}_${nodeIdCounter.current++}`;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      if (canvasMode === "lock") return;

      // 노드 정보 먼저 가져오기
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      // 연결점의 색상 타입 확인 (노드 타입과 연결점 위치 기반으로 추정)
      const getHandleTypeFromPosition = (handle: string | null): string | null => {
        if (!handle) return null;
        if (handle === "top" || handle === "bottom") return "gray";
        if (handle === "left" || handle === "right") return "colored";
        return null;
      };

      const sourceHandleType = getHandleTypeFromPosition(params.sourceHandle);
      const targetHandleType = getHandleTypeFromPosition(params.targetHandle);

      // DOM에서도 확인 시도
      const sourceHandle = document.querySelector(`[data-id="${params.source}"] [data-handle-id="${params.sourceHandle}"]`);
      const targetHandle = document.querySelector(`[data-id="${params.target}"] [data-handle-id="${params.targetHandle}"]`);

      const sourceHandleTypeFromDOM = sourceHandle?.getAttribute("data-handle-type");
      const targetHandleTypeFromDOM = targetHandle?.getAttribute("data-handle-type");

      // DOM에서 찾은 값이 있으면 우선 사용
      const finalSourceHandleType = sourceHandleTypeFromDOM || sourceHandleType;
      const finalTargetHandleType = targetHandleTypeFromDOM || targetHandleType;

      // 같은 색상 타입의 연결점끼리만 연결 허용
      if (finalSourceHandleType === finalTargetHandleType) {
        // primary node 타입 정의
        const primaryNodeTypes = ["start", "input", "model", "output", "promptTemplate"];
        const isTargetPrimaryNode = targetNode && targetNode.type && primaryNodeTypes.includes(targetNode.type);
        const isSourcePrimaryNode = sourceNode && sourceNode.type && primaryNodeTypes.includes(sourceNode.type);

        // primary node로의 연결에는 화살표 추가
        // - target이 primary node인 경우: markerEnd 사용 (target을 향하는 화살표)
        // - source가 primary node이고 sourceHandle이 'right'인 경우: markerStart 사용 (source를 향하는 화살표)
        const shouldAddArrowToTarget = isTargetPrimaryNode;
        const shouldAddArrowToSource = isSourcePrimaryNode && params.sourceHandle === "right";

        const edgeWithMarker: any = { ...params };

        if (shouldAddArrowToTarget) {
          edgeWithMarker.markerEnd = {
            type: MarkerType.ArrowClosed,
            color: colors.edge.default,
          };
        }

        if (shouldAddArrowToSource) {
          edgeWithMarker.markerStart = {
            type: MarkerType.ArrowClosed,
            color: colors.edge.default,
          };
        }

        const newEdges = addEdge(edgeWithMarker, edges);
        setEdges(newEdges);
        wrappedOnEdgesChange(newEdges);
      } else {
        // 다른 색상 타입의 연결점은 연결 차단
        return;
      }
    },
    [setEdges, edges, wrappedOnEdgesChange, nodes, canvasMode]
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (canvasMode === "lock") return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [canvasMode]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (canvasMode === "lock") return;
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

          const existingFlowNames = existingStartNodes.filter((n) => n.data?.flowName).map((n) => n.data.flowName as string);
          const prefix = getCanvasPrefix();

          let flowNumber = 1;
          let newFlowName = `Flow ${prefix}${flowNumber}`;

          while (existingFlowNames.includes(newFlowName)) {
            flowNumber++;
            newFlowName = `Flow ${prefix}${flowNumber}`;
          }

          nodeData.flowName = newFlowName;
        }

        // Flow 노드인 경우 5개의 연결된 노드 생성
        if (type === "flow") {
          const existingStartNodes = nodes.filter((n) => n.type === "start");

          const existingFlowNames = existingStartNodes.filter((n) => n.data?.flowName).map((n) => n.data.flowName as string);
          const prefix = getCanvasPrefix();

          let flowNumber = 1;
          let newFlowName = `Flow ${prefix}${flowNumber}`;

          while (existingFlowNames.includes(newFlowName)) {
            flowNumber++;
            newFlowName = `Flow ${prefix}${flowNumber}`;
          }

          // 4개 노드 생성 (Start -> Input -> Model -> Output) - 세로 배치
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
                onFlowNameChange: handleFlowNameChangeRef.current || (() => {}),
                onExecutePrompt: handleExecutePromptRef.current || (async () => {}),
                onDeleteNode: handleDeleteNodeRef.current || (() => {}),
              },
            },
            {
              id: getId(),
              type: "input",
              position: { x: position.x, y: position.y + 200 },
              data: {
                label: "Input",
                icon: "📥",
                iconColor: colors.nodeIcon.blue,
                nodeBg: colors.nodeBg.blue,
                onDeleteNode: handleDeleteNodeRef.current || (() => {}),
              },
            },
            {
              id: getId(),
              type: "model",
              position: { x: position.x, y: position.y + 350 },
              data: {
                label: "Model",
                icon: "🤖",
                iconColor: colors.nodeIcon.purple,
                nodeBg: getNodeBgByTypeLocal("model"),
                model: DEFAULT_MODEL,
                onModelChange: handleModelChangeRef.current || (() => {}),
                onDeleteNode: handleDeleteNodeRef.current || (() => {}),
              },
            },
            {
              id: getId(),
              type: "output",
              position: { x: position.x, y: position.y + 520 },
              data: {
                label: "Output",
                icon: "📤",
                iconColor: colors.nodeIcon.green,
                nodeBg: colors.nodeBg.lightGreen,
                format: "text",
                onDeleteNode: handleDeleteNodeRef.current || (() => {}),
                onFormatChange: handleFormatChangeRef.current || (() => {}),
              },
            },
            // 프롬프트 생성 노드 추가
            {
              id: getId(),
              type: "promptTemplate",
              position: { x: position.x + 300, y: position.y + 380 },
              data: {
                label: "Directive",
                icon: "📝",
                iconColor: colors.nodeIcon.purple,
                nodeBg: getNodeBgByTypeLocal("promptTemplate"),
                content: "",
                name: "Directive",
                onContentChange: (content: string, fileName?: string, description?: string) => handleNodeContentChangeRef.current?.(getId(), content, fileName, description),
                onDeleteNode: handleDeleteNodeRef.current || (() => {}),
              },
            },
          ];

          // 연결 엣지 생성
          const flowEdges: Edge[] = [
            // 메인 플로우 연결 (회색 연결점 사용: top/bottom) - start > input > model > output만 화살표
            {
              id: `e-${flowNodes[0].id}-${flowNodes[1].id}`,
              source: flowNodes[0].id,
              target: flowNodes[1].id,
              sourceHandle: "bottom",
              targetHandle: "top",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: colors.edge.default,
              },
            },
            {
              id: `e-${flowNodes[1].id}-${flowNodes[2].id}`,
              source: flowNodes[1].id,
              target: flowNodes[2].id,
              sourceHandle: "bottom",
              targetHandle: "top",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: colors.edge.default,
              },
            },
            {
              id: `e-${flowNodes[2].id}-${flowNodes[3].id}`,
              source: flowNodes[2].id,
              target: flowNodes[3].id,
              sourceHandle: "bottom",
              targetHandle: "top",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: colors.edge.default,
              },
            },
            // 프롬프트 생성 노드를 Model에 연결 (색상 연결점 사용: left/right)
            {
              id: `e-${flowNodes[2].id}-${flowNodes[4].id}`,
              source: flowNodes[2].id,
              target: flowNodes[4].id,
              sourceHandle: "right",
              targetHandle: "left",
              markerStart: {
                type: MarkerType.ArrowClosed,
                color: colors.edge.default,
              },
            },
          ];

          setNodes((prev) => {
            // 로그 수집: Flow 노드 생성 (각 노드별로)
            flowNodes.forEach((node) => {
              if (node.type) {
                logger.logNodeStructure("node_created", node.id, node.type, node.data, node.position);
              }
            });
            const updatedNodes = prev.concat(flowNodes);
            wrappedOnNodesChange(updatedNodes);
            return updatedNodes;
          });

          setEdges((prev) => {
            const updatedEdges = prev.concat(flowEdges);
            wrappedOnEdgesChange(updatedEdges);
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
          // 로그 수집: 노드 생성
          if (newNode.type) {
            logger.logNodeStructure("node_created", newNode.id, newNode.type, newNode.data, newNode.position);
          }
          const updatedNodes = prev.concat(newNode);
          // 노드 추가 즉시 상위 컴포넌트에 알림
          wrappedOnNodesChange(updatedNodes);
          return updatedNodes;
        });
      }
    },
    [reactFlowInstance, setNodes, wrappedOnNodesChange, nodes, wrappedOnEdgesChange, edges, getId, getCanvasPrefix, canvasMode, canvasName]
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

  const handleNodeContentChange = (nodeId: string, content: string, fileName?: string, description?: string) => {
    setNodes((nds) => {
      const node = nds.find((n) => n.id === nodeId);
      const updatedNodes = nds.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data, content };
          if (fileName) {
            updatedData.fileName = fileName;
          }
          if (description !== undefined) {
            updatedData.description = description;
          }
          return { ...node, data: updatedData };
        }
        return node;
      });

      // 로그 수집: 노드 수정
      if (node && node.type) {
        logger.logNodeStructure("node_updated", nodeId, node.type, updatedNodes.find((n) => n.id === nodeId)?.data, node.position);
        logger.logIteration("node_modified", node.data?.flowName, {
          modified: [{ nodeId, nodeType: node.type, changes: { content, fileName, description } }],
        });
      }

      // 노드 내용 변경 즉시 상위 컴포넌트에 알림
      wrappedOnNodesChange(updatedNodes);
      return updatedNodes;
    });
  };
  handleNodeContentChangeRef.current = handleNodeContentChange;

  const handleModelChange = (nodeId: string, model: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, model } } : node));

      // 로그 수집: 모델 선택
      logger.logFeatureUsage("model_selection", { nodeId, model });

      // 모델 변경 즉시 상위 컴포넌트에 알림
      wrappedOnNodesChange(updatedNodes);
      return updatedNodes;
    });
  };
  handleModelChangeRef.current = handleModelChange;

  const handleFormatChange = (nodeId: string, format: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, format } } : node));
      wrappedOnNodesChange(updatedNodes);
      return updatedNodes;
    });
  };
  handleFormatChangeRef.current = handleFormatChange;

  const handleNodeSizeChange = (nodeId: string, width: number, height: number) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, width, height } } : node));
      wrappedOnNodesChange(updatedNodes);
      return updatedNodes;
    });
  };
  handleNodeSizeChangeRef.current = handleNodeSizeChange;

  const handleNameChange = (nodeId: string, name: string) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === nodeId) {
          const registryEntry = Object.values(nodesRegistry).find((e: any) => e.type === node.type) as any;
          const defaultName = registryEntry?.meta?.name || node.type;
          return {
            ...node,
            data: {
              ...node.data,
              customName: name,
              label: name || defaultName,
            },
          };
        }
        return node;
      });
      wrappedOnNodesChange(updatedNodes);
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
  handleFlowNameChangeRef.current = handleFlowNameChange;

  const handleDeleteNode = (nodeId: string) => {
    if (canvasMode === "lock") return;

    // 삭제 전 노드 정보 저장
    const nodeToDelete = nodes.find((n) => n.id === nodeId);

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodeId(null);

    // 로그 수집: 노드 삭제
    if (nodeToDelete && nodeToDelete.type) {
      logger.logNodeStructure("node_deleted", nodeId, nodeToDelete.type, nodeToDelete.data, nodeToDelete.position);
      logger.logIteration("node_deleted", nodeToDelete.data?.flowName, {
        deleted: [{ nodeId, nodeType: nodeToDelete.type }],
      });
    }
  };
  handleDeleteNodeRef.current = handleDeleteNode;

  const handleExecutePrompt = async (prompt: string, startNodeId?: string) => {
    // 중복 실행 방지
    if (executingPromptRef.current) {
      return;
    }

    executingPromptRef.current = true;

    try {
      // Flow별 프롬프트 생성
      const flowPrompt = startNodeId ? generateFlowPrompt(startNodeId) : generatedPrompt;
      const actualPrompt = flowPrompt.finalPrompt || prompt;

      console.log("=".repeat(80));
      console.log("📝 현재 프롬프트 내용:");
      console.log("=".repeat(80));
      console.log(actualPrompt);
      console.log("=".repeat(80));

      if (!actualPrompt || actualPrompt.trim() === "") {
        console.warn("⚠️ 프롬프트가 비어있습니다!");
        return;
      }

      // 로그 수집: 플로우 실행 시작
      const flowId = startNodeId ? nodes.find((n) => n.id === startNodeId)?.data?.flowName : undefined;
      logger.logIteration("flow_executed", flowId);

      const requestBody: any = {
        prompt: actualPrompt,
        temperature: 0.7,
      };

      const response = await fetch("/api/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("=".repeat(80));
        console.error("❌ API 에러 발생");
        console.error("=".repeat(80));
        console.error("📡 HTTP 상태:", response.status, response.statusText);
        console.error("📋 에러 응답 원문:");
        console.error(errorText);
        console.error("=".repeat(80));

        // Error 객체에서 detail 파싱
        let errorMessage = "서버 오류가 발생했습니다.";
        try {
          const errorData = JSON.parse(errorText);
          console.error("📦 파싱된 에러 데이터:", JSON.stringify(errorData, null, 2));

          // detail이 문자열인 경우
          if (errorData.detail) {
            errorMessage = errorData.detail;

            // OpenAI API 에러 메시지에서 quota 관련 키워드 확인
            const detailStr = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
            if (
              detailStr.includes("insufficient_quota") ||
              detailStr.includes("429") ||
              detailStr.includes("quota") ||
              detailStr.includes("billing") ||
              detailStr.includes("You exceeded your current quota")
            ) {
              errorMessage = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요.";
            }
          } else if (errorData.error) {
            // OpenAI API 직접 에러 형식
            const errorObj = errorData.error;
            if (errorObj?.message) {
              errorMessage = errorObj.message;
              if (errorObj.message.includes("quota") || errorObj.message.includes("billing") || errorObj.type === "insufficient_quota") {
                errorMessage = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요.";
              }
            } else if (errorObj?.type === "insufficient_quota") {
              errorMessage = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요.";
            }
          }
        } catch (e) {
          // 파싱 실패 시 원본 텍스트에서 키워드 확인
          if (errorText.includes("insufficient_quota") || errorText.includes("quota") || errorText.includes("billing")) {
            errorMessage = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요.";
          }
        }

        // Result 노드와 Output 노드에 에러 메시지 표시
        const resultMessage = errorMessage;
        setNodes((nds) => {
          const findNodeInFlow = (targetNodeId: string, startNodeId: string): boolean => {
            const findNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
              if (visited.has(currentNodeId)) return false;
              visited.add(currentNodeId);
              if (currentNodeId === targetNodeId) return true;
              const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);
              return nextNodes.some((nextNodeId) => findNode(nextNodeId, visited));
            };
            return findNode(startNodeId);
          };

          const updatedNodes = nds.map((node) => {
            if (startNodeId && findNodeInFlow(node.id, startNodeId)) {
              // Result 노드에 에러 표시
              if (node.type === "result") {
                return { ...node, data: { ...node.data, result: resultMessage } };
              }
              // Output 노드에 에러 표시 (모든 형식에 대해 저장)
              if (node.type === "output") {
                return { ...node, data: { ...node.data, result: resultMessage } };
              }
            }
            return node;
          });
          return updatedNodes;
        });

        return;
      }

      if (response.ok) {
        const data = await response.json();
        const result = data.content || "응답을 받을 수 없습니다.";

        // 실행된 Flow의 이름 가져오기
        const executedFlowName = startNodeId ? nodes.find((n) => n.id === startNodeId)?.data?.flowName : null;

        // 로그 수집: 출력물 저장
        logger.logOutput(result, executedFlowName || undefined, true);

        // 특정 Flow의 Result 노드와 Output 노드에 결과 표시
        setNodes((nds) => {
          const findNodeInFlow = (targetNodeId: string, startNodeId: string): boolean => {
            const findNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
              if (visited.has(currentNodeId)) return false;
              visited.add(currentNodeId);

              if (currentNodeId === targetNodeId) return true;

              const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);
              return nextNodes.some((nextNodeId) => findNode(nextNodeId, visited));
            };
            return findNode(startNodeId);
          };

          const updatedNodes = nds.map((node) => {
            if (startNodeId && findNodeInFlow(node.id, startNodeId)) {
              // Result 노드에 결과 표시
              if (node.type === "result") {
                return { ...node, data: { ...node.data, result } };
              }
              // Output 노드에 결과 표시 (Flow별로 분리하여 저장)
              if (node.type === "output") {
                // 기존 결과가 객체 형태인지 확인 (Flow별 결과 저장)
                const existingResult = node.data?.result;
                let flowResults: Record<string, string> = {};

                if (executedFlowName) {
                  // 기존 결과가 객체면 그대로 사용, 아니면 빈 객체로 시작
                  if (existingResult && typeof existingResult === "object" && !Array.isArray(existingResult)) {
                    flowResults = { ...existingResult };
                  } else if (existingResult && typeof existingResult === "string") {
                    // 기존 결과가 문자열이면, 이 노드가 속한 다른 Flow들을 찾아서 보존
                    const flows = findFlowsForNode(node.id);
                    flows.forEach((flowName) => {
                      if (flowName !== executedFlowName) {
                        // 다른 Flow의 결과는 기존 값을 유지 (없으면 빈 문자열)
                        flowResults[flowName] = "";
                      }
                    });
                  }

                  // 현재 실행된 Flow의 결과 저장
                  flowResults[executedFlowName] = result;

                  // 노드가 하나의 Flow에만 속하면 문자열로 저장 (하위 호환성)
                  const flows = findFlowsForNode(node.id);
                  if (flows.length === 1) {
                    return { ...node, data: { ...node.data, result } };
                  } else {
                    // 여러 Flow에 속하면 객체로 저장
                    return { ...node, data: { ...node.data, result: flowResults } };
                  }
                } else {
                  // Flow 이름이 없으면 기존 방식대로 저장
                  return { ...node, data: { ...node.data, result } };
                }
              }
            }
            return node;
          });
          wrappedOnNodesChange(updatedNodes);
          return updatedNodes;
        });
      } else {
        const errorData = await response.json();
        const errorMessage = `에러: ${errorData.detail || "알 수 없는 오류가 발생했습니다."}`;

        // 특정 Flow의 Result 노드와 Output 노드에 에러 표시
        setNodes((nds) => {
          const findNodeInFlow = (targetNodeId: string, startNodeId: string): boolean => {
            const findNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
              if (visited.has(currentNodeId)) return false;
              visited.add(currentNodeId);
              if (currentNodeId === targetNodeId) return true;
              const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);
              return nextNodes.some((nextNodeId) => findNode(nextNodeId, visited));
            };
            return findNode(startNodeId);
          };

          const updatedNodes = nds.map((node) => {
            if (startNodeId && findNodeInFlow(node.id, startNodeId)) {
              if (node.type === "result") {
                return { ...node, data: { ...node.data, result: errorMessage } };
              }
              if (node.type === "output") {
                return { ...node, data: { ...node.data, result: errorMessage } };
              }
            }
            return node;
          });
          wrappedOnNodesChange(updatedNodes);
          return updatedNodes;
        });
      }
    } catch (error) {
      console.error("=".repeat(80));
      console.error("❌ 프롬프트 실행 중 오류 발생");
      console.error("=".repeat(80));
      console.error("🔴 에러 타입:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("🔴 에러 메시지:", error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error("🔴 스택 트레이스:");
        console.error(error.stack);
      }
      if (error instanceof Error && (error as any).cause) {
        console.error("🔴 원인:", (error as any).cause);
      }
      console.error("=".repeat(80));

      const errorMessage = `네트워크 에러: ${error instanceof Error ? error.message : "알 수 없는 오류"}`;

      // 특정 Flow의 Result 노드와 Output 노드에 에러 표시
      setNodes((nds) => {
        const findNodeInFlow = (targetNodeId: string, startNodeId: string): boolean => {
          const findNode = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
            if (visited.has(currentNodeId)) return false;
            visited.add(currentNodeId);
            if (currentNodeId === targetNodeId) return true;
            const nextNodes = edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);
            return nextNodes.some((nextNodeId) => findNode(nextNodeId, visited));
          };
          return findNode(startNodeId);
        };

        const updatedNodes = nds.map((node) => {
          if (startNodeId && findNodeInFlow(node.id, startNodeId)) {
            if (node.type === "result") {
              return { ...node, data: { ...node.data, result: errorMessage } };
            }
            if (node.type === "output") {
              return { ...node, data: { ...node.data, result: errorMessage } };
            }
          }
          return node;
        });
        wrappedOnNodesChange(updatedNodes);
        return updatedNodes;
      });
    } finally {
      executingPromptRef.current = false;
    }
  };
  handleExecutePromptRef.current = handleExecutePrompt;

  // useEffect는 제거 - setNodes/setEdges 호출 시점에 이미 wrappedOnNodesChange/wrappedOnEdgesChange를 호출하고 있음

  const deleteSelectedNode = () => {
    if (canvasMode === "lock") return;
    if (selectedNodeId) {
      handleDeleteNode(selectedNodeId);
    }
  };

  const deleteSelectedNodes = () => {
    if (canvasMode === "lock") return;
    if (selectedIds.length === 0) return;
    const idSet = new Set(selectedIds);
    const newNodes = nodes.filter((n) => !idSet.has(n.id));
    const newEdges = edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target));
    setNodes(newNodes);
    setEdges(newEdges);
    wrappedOnNodesChange(newNodes);
    wrappedOnEdgesChange(newEdges);
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

    // 로그 수집: 복사
    logger.logFeatureUsage("copy_paste", { action: "copy", nodeCount: selectedNodes.length, nodeTypes: selectedNodes.map((n) => n.type) });

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
    setNodes((prev) => {
      // 로그 수집: 붙여넣기된 노드들 생성
      newNodes.forEach((node) => {
        if (node.type) {
          logger.logNodeStructure("node_created", node.id, node.type, node.data, node.position);
        }
      });
      return [...prev, ...newNodes];
    });
    setCopyOffset({ x: copyOffset.x + 10, y: copyOffset.y + 10 }); // 붙여넣기마다 오프셋 증가

    // 로그 수집: 붙여넣기
    logger.logFeatureUsage("copy_paste", { action: "paste", nodeCount: newNodes.length, nodeTypes: newNodes.map((n) => n.type).filter(Boolean) });

    console.log("📄 붙여넣기됨:", newNodes.length, "개 노드");
  };

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // textarea나 input이 포커스되어 있으면 노드 복사/붙여넣기 동작을 하지 않음
      const activeElement = document.activeElement;
      const isTextInputFocused =
        activeElement && (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT" || (activeElement instanceof HTMLElement && activeElement.isContentEditable));

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        // textarea/input이 포커스되어 있으면 기본 복사 동작 허용
        if (isTextInputFocused) {
          return;
        }
        e.preventDefault();
        copyNodes();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        // textarea/input이 포커스되어 있으면 기본 붙여넣기 동작 허용
        if (isTextInputFocused) {
          return;
        }
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
            // 동일한 타입의 노드 개수 계산
            const typeCounts = new Map<string, number>();
            nodes.forEach((node) => {
              if (node.type) {
                const count = typeCounts.get(node.type) || 0;
                typeCounts.set(node.type, count + 1);
              }
            });

            return nodes.map((node) => {
              // 레지스트리에서 suggestions 가져오기
              const registryKey = node.type ? Object.keys(nodesRegistry).find((key) => (nodesRegistry as any)[key].type === node.type) : null;
              const registryEntry = registryKey ? (nodesRegistry as any)[registryKey] : null;
              const suggestions = registryEntry?.meta?.defaultSuggestions;

              // 동일한 타입의 노드가 2개 이상이면 이름 입력 필드 표시
              const sameTypeCount = node.type ? typeCounts.get(node.type) || 0 : 0;
              const showNameInput = sameTypeCount >= 2;

              // 노드가 속한 Flow의 프롬프트만 가져오기
              const flowPrompt = getFlowPromptForNode(node.id);
              const nodePrompt = flowPrompt || generatedPrompt.finalPrompt; // Flow 프롬프트가 없으면 전체 프롬프트 사용

              return {
                ...node,
                data: {
                  ...node.data,
                  suggestions,
                  currentFullPrompt: nodePrompt, // 노드가 속한 Flow의 프롬프트만 전달
                  onContentChange: (content: string, fileName?: string, description?: string) => handleNodeContentChange(node.id, content, fileName, description),
                  onDeleteNode: handleDeleteNodeRef.current || (() => {}),
                  onModelChange: (model: string) => handleModelChangeRef.current?.(node.id, model),
                  onFormatChange: (format: string) => handleFormatChangeRef.current?.(node.id, format),
                  onFlowNameChange: (flowName: string) => handleFlowNameChangeRef.current?.(node.id, flowName),
                  onNameChange: (name: string) => handleNameChange(node.id, name),
                  onExecutePrompt: handleExecutePromptRef.current || (async () => {}),
                  onSizeChange: (width: number, height: number) => handleNodeSizeChangeRef.current?.(node.id, width, height),
                  showNameInput,
                  customName: node.data?.customName,
                  // Input 노드에 연결 정보 전달
                  ...(node.type === "input" ? { allNodes: nodes, allEdges: edges } : {}),
                },
                // 그룹별 배경색 적용
                style: node.data?.nodeBg ? { ...(node.style || {}), background: node.data.nodeBg } : node.style,
                type: node.type === "context" ? "context" : node.type,
                // Output 노드의 경우 width/height 설정
                ...(node.data?.width ? { width: node.data.width } : {}),
                ...(node.data?.height ? { height: node.data.height } : {}),
              };
            });
          }, [nodes, edges, getFlowPromptForNode])}
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
          nodesDraggable={canvasMode !== "lock"}
          nodesConnectable={canvasMode !== "lock"}
          elementsSelectable={canvasMode !== "lock"}
          zoomOnDoubleClick={false}
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
