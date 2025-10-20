import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, Background, BackgroundVariant, ReactFlowProvider, ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import { EditorContainer, FlowContainer } from "../styles/nodeStyles";
import { Button } from "./ui";
import { nodeComponents, nodesRegistry } from "./nodes/registry";
import { colors } from "../constants";

interface CanvasEditorProps {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

const initialNodes: Node[] = [
  {
    id: "start_node",
    type: "start",
    position: { x: 250, y: 50 },
    data: {
      label: "Start",
      icon: "▶️",
      iconColor: colors.nodeIcon.green,
      nodeBg: colors.nodeBg.blue,
      flowName: "Flow 1",
    },
  },
  {
    id: "model_node",
    type: "model",
    position: { x: 250, y: 250 },
    data: {
      label: "Model",
      icon: "🤖",
      iconColor: colors.nodeIcon.purple,
      nodeBg: colors.nodeBg.purple,
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
  {
    id: "result_node",
    type: "result",
    position: { x: 250, y: 400 },
    data: {
      label: "Result",
      icon: "🏁",
      iconColor: colors.nodeIcon.red,
      nodeBg: colors.nodeBg.lightGreen,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "start-to-model",
    source: "start_node",
    target: "model_node",
    sourceHandle: "bottom",
    targetHandle: "top",
  },
  {
    id: "model-to-result",
    source: "model_node",
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

  const getId = useCallback(() => {
    return `node_${Date.now()}_${nodeIdCounter.current++}`;
  }, []);

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

        const newNode: Node = {
          id: getId(),
          type,
          position,
          data: nodeData,
        };

        setNodes((prev) => prev.concat(newNode));
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
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, content } } : node)));
  };

  const handleModelChange = (nodeId: string, model: string) => {
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, model } } : node)));
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
