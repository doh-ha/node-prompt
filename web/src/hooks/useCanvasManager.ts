import { useState, useCallback, useEffect } from "react";
import type { Node, Edge } from "../types/nodeTypes";
import { MarkerType } from "reactflow";
import { colors } from "../constants";
import { nodesRegistry } from "../components/nodes/registry";

export interface Canvas {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "promptflow_canvases";

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
      : original === "instruction"
      ? colors.nodeBg.red
      : colors.nodeBg.purple;

  if (type === "input") return colors.nodeBg.blue;
  if (type === "model") return colors.nodeBg.red;
  if (type === "output") return colors.nodeBg.lightGreen;
  if (type === "promptTemplate") return colors.nodeBg.red;
  return base;
};

// 초기 flow 노드 생성 함수
function createInitialFlowNodes(canvasName: string): { nodes: Node[]; edges: Edge[] } {
  const baseX = 250;
  const baseY = 0; // 기본 캔버스와 동일하게 0으로 설정
  const prefix = canvasName.replace("Canvas ", ""); // "A" 추출
  const flowName = `Flow ${prefix}1`;

  const getId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const startId = getId();
  const inputId = getId();
  const modelId = getId();
  const outputId = getId();
  const taskId = getId();

  const nodes: Node[] = [
    {
      id: startId,
      type: "start",
      position: { x: baseX, y: baseY },
      data: {
        ...getMetaFromRegistry("start"),
        nodeBg: getNodeBgByTypeLocal("start"),
        flowName: flowName,
      },
    },
    {
      id: inputId,
      type: "input",
      position: { x: baseX, y: baseY + 180 },
      data: {
        ...getMetaFromRegistry("input"),
        nodeBg: getNodeBgByTypeLocal("input"),
      },
    },
    {
      id: modelId,
      type: "model",
      position: { x: baseX, y: baseY + 300 },
      data: {
        ...getMetaFromRegistry("model"),
        nodeBg: getNodeBgByTypeLocal("model"),
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 1000,
      },
    },
    {
      id: outputId,
      type: "output",
      position: { x: baseX, y: baseY + 450 },
      data: {
        ...getMetaFromRegistry("output"),
        nodeBg: getNodeBgByTypeLocal("output"),
        format: "text",
      },
    },
    {
      id: taskId,
      type: "promptTemplate",
      position: { x: baseX + 350, y: baseY + 300 },
      data: {
        ...getMetaFromRegistry("promptTemplate"),
        nodeBg: getNodeBgByTypeLocal("promptTemplate"),
        content: "",
        name: "Task",
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: `e-${startId}-${inputId}`,
      source: startId,
      target: inputId,
      sourceHandle: "bottom",
      targetHandle: "top",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: colors.edge.default,
      },
    },
    {
      id: `e-${inputId}-${modelId}`,
      source: inputId,
      target: modelId,
      sourceHandle: "bottom",
      targetHandle: "top",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: colors.edge.default,
      },
    },
    {
      id: `e-${modelId}-${outputId}`,
      source: modelId,
      target: outputId,
      sourceHandle: "bottom",
      targetHandle: "top",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: colors.edge.default,
      },
    },
    {
      id: `e-${modelId}-${taskId}`,
      source: modelId,
      target: taskId,
      sourceHandle: "right",
      targetHandle: "left",
    },
  ];

  return { nodes, edges };
}

// 1 -> A, 2 -> B, ... 26 -> Z, 27 -> AA ...
function numberToLetters(num: number): string {
  let n = Math.max(1, Math.floor(num));
  let letters = "";
  while (n > 0) {
    n--;
    letters = String.fromCharCode(65 + (n % 26)) + letters;
    n = Math.floor(n / 26);
  }
  return letters;
}

function getNextCanvasName(existing: Canvas[]): string {
  const nextIndex = existing.length + 1;
  return `Canvas ${numberToLetters(nextIndex)}`;
}

function createDefaultCanvas(name?: string): Canvas {
  const id = `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const canvasName = name || "Canvas A";
  const { nodes, edges } = createInitialFlowNodes(canvasName);
  return {
    id,
    name: canvasName,
    nodes,
    edges,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const useCanvasManager = () => {
  const [canvases, setCanvases] = useState<Canvas[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Canvas[] = JSON.parse(stored);
        if (parsed.length > 0) {
          // 빈 캔버스에 초기 flow 노드 추가
          const updatedCanvases = parsed.map((canvas) => {
            if (canvas.nodes.length === 0 && canvas.edges.length === 0) {
              const { nodes, edges } = createInitialFlowNodes(canvas.name);
              return { ...canvas, nodes, edges };
            }
            return canvas;
          });
          return updatedCanvases;
        }
        return [createDefaultCanvas()];
      }
    } catch (error) {
      console.error("Failed to load canvases from storage:", error);
    }
    return [createDefaultCanvas("Canvas A")];
  });

  const [currentCanvasId, setCurrentCanvasId] = useState<string>(() => canvases[0]?.id || "");

  const currentCanvas = canvases.find((c) => c.id === currentCanvasId) || canvases[0];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canvases));
    } catch (error) {
      console.error("Failed to save canvases to storage:", error);
    }
  }, [canvases]);

  const createCanvas = useCallback(
    (name?: string) => {
      // 현재 상태 기반으로 이름과 ID를 즉시 생성해 선택 해제 상태를 방지
      const autoName = name || getNextCanvasName(canvases);
      const newCanvas = createDefaultCanvas(autoName);
      setCanvases((prev) => [...prev, newCanvas]);
      setCurrentCanvasId(newCanvas.id);
      return newCanvas.id;
    },
    [canvases]
  );

  const deleteCanvas = useCallback(
    (canvasId: string) => {
      // 최소 1개는 유지
      if (canvases.length <= 1) {
        alert("최소 하나의 캔버스는 필요합니다.");
        return;
      }

      setCanvases((prev) => prev.filter((c) => c.id !== canvasId));
      if (currentCanvasId === canvasId) {
        const remaining = canvases.filter((c) => c.id !== canvasId);
        setCurrentCanvasId(remaining[0]?.id || "");
      }
    },
    [canvases, currentCanvasId]
  );

  const renameCanvas = useCallback((canvasId: string, newName: string) => {
    setCanvases((prev) => prev.map((c) => (c.id === canvasId ? { ...c, name: newName, updatedAt: Date.now() } : c)));
  }, []);

  const switchCanvas = useCallback((canvasId: string) => {
    setCurrentCanvasId(canvasId);
  }, []);

  const updateCurrentCanvas = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      setCanvases((prev) => prev.map((c) => (c.id === currentCanvasId ? { ...c, nodes, edges, updatedAt: Date.now() } : c)));
    },
    [currentCanvasId]
  );

  const updateCanvas = useCallback((canvasId: string, nodes: Node[], edges: Edge[]) => {
    setCanvases((prev) => prev.map((c) => (c.id === canvasId ? { ...c, nodes, edges, updatedAt: Date.now() } : c)));
  }, []);

  return {
    canvases,
    currentCanvas,
    currentCanvasId,
    createCanvas,
    deleteCanvas,
    renameCanvas,
    switchCanvas,
    updateCurrentCanvas,
    updateCanvas,
  };
};
