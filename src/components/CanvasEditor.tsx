import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, Controls, Background, BackgroundVariant, ReactFlowProvider, ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import { EditorContainer, Toolbar, FlowContainer } from "../styles/nodeStyles";
import { Button } from "./ui";
import { LibraryPanel } from "./LibraryPanel";
import { nodeComponents } from "./nodes/registry";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionRafRef = useRef<number | null>(null);

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

        const newNode: Node = {
          id: getId(),
          type,
          position,
          data,
        };

        setNodes((prev) => prev.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes, onNodesChange]
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
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, content } } : node)));
  };

  const handleModelChange = (nodeId: string, model: string) => {
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, model } } : node)));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodeId(null);
  };

  // 상위(App) 상태와 동기화하여 프리뷰가 최신 입력을 반영하도록 함
  useEffect(() => {
    onNodesChange(nodes);
  }, [nodes, onNodesChange]);

  useEffect(() => {
    onEdgesChange(edges);
  }, [edges, onEdgesChange]);

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
      <LibraryPanel onDragStart={onDragStart} />

      <Toolbar>
        {selectedNodeId && (
          <Button onClick={deleteSelectedNode} variant="danger" size="small">
            선택된 노드 삭제
          </Button>
        )}
        {selectedIds.length > 0 && (
          <Button onClick={deleteSelectedNodes} variant="danger" size="small">
            영역 선택 삭제 ({selectedIds.length})
          </Button>
        )}
        <Button onClick={clearAll} variant="secondary" size="small">
          전체 지우기
        </Button>
      </Toolbar>

      <FlowContainer>
        <ReactFlow
          nodes={useMemo(
            () =>
              nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  onContentChange: (content: string) => handleNodeContentChange(node.id, content),
                  onDeleteNode: handleDeleteNode,
                  onModelChange: (model: string) => handleModelChange(node.id, model),
                },
                // 그룹별 배경색 적용
                style: node.data?.nodeBg ? { ...(node.style || {}), background: node.data.nodeBg } : node.style,
              })),
            [nodes]
          )}
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
          fitView
          proOptions={{ hideAttribution: true }}
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={28} size={0.75} color="#e5e7eb" />
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
