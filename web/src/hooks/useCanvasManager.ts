import { useState, useCallback, useEffect } from "react";
import type { Node, Edge } from "../types/nodeTypes";

export interface Canvas {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "promptflow_canvases";

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
  return {
    id,
    name: name || "Canvas A",
    nodes: [],
    edges: [],
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
        return parsed.length > 0 ? parsed : [createDefaultCanvas()];
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
