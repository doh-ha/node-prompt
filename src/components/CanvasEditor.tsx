import React, { useCallback, useState } from "react";
import ReactFlow, { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, Controls, Background, ReactFlowProvider, ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import { LibraryPanel } from "./LibraryPanel";
import { nodeComponents } from "./nodes/NodeComponents";
import { BlockCanvas, BlockItem } from "./blocks/BlockCanvas";

const EditorContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const FlowContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const Toolbar = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1000;
  display: flex;
  gap: 12px;
`;

const ToolbarButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4f46e5;
    color: #4f46e5;
  }

  &.active {
    background: #4f46e5;
    color: white;
    border-color: #4f46e5;
  }
`;

interface CanvasEditorProps {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${id++}`;

const CanvasEditor: React.FC<CanvasEditorProps> = ({ onNodesChange, onEdgesChange }) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockItem[]>([]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onEdgesChange(newEdges);
    },
    [setEdges, edges, onEdgesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => {
        const newNodes = prev.filter((n) => n.id !== nodeId);
        onNodesChange(newNodes);
        return newNodes;
      });
      setEdges((prev) => {
        const newEdges = prev.filter((e) => e.source !== nodeId && e.target !== nodeId);
        onEdgesChange(newEdges);
        return newEdges;
      });
      setSelectedNodeId((prev) => (prev === nodeId ? null : prev));
    },
    [onNodesChange, onEdgesChange]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const data = JSON.parse(event.dataTransfer.getData("application/reactflow-data"));

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (position) {
        const newNode: Node = {
          id: getId(),
          type,
          position,
          data: { ...data, onDeleteNode: handleDeleteNode },
        };

        setNodes((prev) => {
          const newNodes = prev.concat(newNode);
          onNodesChange(newNodes);
          return newNodes;
        });
      }
    },
    [reactFlowInstance, setNodes, onNodesChange, handleDeleteNode]
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

  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      const newNodes = nodes.filter((node) => node.id !== selectedNodeId);
      const newEdges = edges.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId);
      setNodes(newNodes);
      setEdges(newEdges);
      onNodesChange(newNodes);
      onEdgesChange(newEdges);
      setSelectedNodeId(null);
    }
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    onNodesChange([]);
    onEdgesChange([]);
    setSelectedNodeId(null);
  };

  return (
    <EditorContainer>
      <LibraryPanel onDragStart={onDragStart} />

      <Toolbar>
        <ToolbarButton onClick={deleteSelectedNode} disabled={!selectedNodeId}>
          선택된 노드 삭제
        </ToolbarButton>
        <ToolbarButton onClick={clearAll}>전체 지우기</ToolbarButton>
      </Toolbar>

      <FlowContainer>
        {/* 퍼즐형 블록 캔버스 */}
        <BlockCanvas blocks={blocks} onChange={setBlocks} />
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
