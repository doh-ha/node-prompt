import React from "react";
import styled from "styled-components";
import { Handle, Position } from "reactflow";

// 공통 노드 스타일
const NodeContainer = styled.div`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  }

  &.selected {
    border-color: #4f46e5;
    background: #f8fafc;
  }
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  position: relative;
`;

const NodeIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const NodeContent = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const DeleteButton = styled.button`
  position: absolute;
  right: 0;
  top: -4px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #ef4444;
  background: #fff1f2;
  color: #ef4444;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  ${NodeContainer}.selected & {
    display: inline-flex;
  }
`;

// 역할 노드 컴포넌트
export const RoleNode: React.FC<{ data: any; selected?: boolean; id?: string }> = ({ data, selected, id }) => {
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#fef3c7", color: "#d97706" }}>🎭</NodeIcon>
        역할 정의
        {selected && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            🗑️
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{data.role}</strong>
        </div>
        <div>{data.description}</div>
      </NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};

// 출력 형식 노드 컴포넌트
export const OutputFormatNode: React.FC<{ data: any; selected?: boolean; id?: string }> = ({ data, selected, id }) => {
  const formatLabels: Record<string, string> = {
    text: "텍스트",
    json: "JSON",
    markdown: "마크다운",
    code: "코드",
    list: "목록",
  };

  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#dbeafe", color: "#2563eb" }}>📄</NodeIcon>
        출력 형식
        {selected && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            🗑️
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{formatLabels[data.format] || data.format}</strong>
        </div>
        {data.structure && <div>구조: {data.structure}</div>}
      </NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};

// 조건 노드 컴포넌트
export const ConditionNode: React.FC<{ data: any; selected?: boolean; id?: string }> = ({ data, selected, id }) => {
  const operatorLabels: Record<string, string> = {
    equals: "=",
    contains: "포함",
    startsWith: "시작",
    endsWith: "끝",
    regex: "정규식",
  };

  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#fecaca", color: "#dc2626" }}>⚡</NodeIcon>
        조건
        {selected && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            🗑️
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{data.condition}</strong>
        </div>
        <div>
          {operatorLabels[data.operator]} {data.value}
        </div>
      </NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};

// 컨텍스트 노드 컴포넌트
export const ContextNode: React.FC<{ data: any; selected?: boolean; id?: string }> = ({ data, selected, id }) => {
  const contextLabels: Record<string, string> = {
    subject: "주제",
    level: "수준",
    style: "스타일",
    constraints: "제약사항",
  };

  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#d1fae5", color: "#059669" }}>📚</NodeIcon>
        컨텍스트
        {selected && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            🗑️
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{contextLabels[data.contextType] || data.contextType}</strong>
        </div>
        <div>{data.content}</div>
      </NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};

// 프롬프트 템플릿 노드 컴포넌트
export const PromptTemplateNode: React.FC<{ data: any; selected?: boolean; id?: string }> = ({ data, selected, id }) => {
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#e0e7ff", color: "#7c3aed" }}>📝</NodeIcon>
        프롬프트 템플릿
        {selected && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            🗑️
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div style={{ maxHeight: "60px", overflow: "hidden" }}>{data.template.substring(0, 100)}...</div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>변수: {data.variables.join(", ")}</div>
      </NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};

// 모델 노드 컴포넌트
export const ModelNode: React.FC<{ data: any; selected?: boolean; id?: string }> = ({ data, selected, id }) => {
  return (
    <NodeContainer className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <NodeIcon style={{ background: "#f3e8ff", color: "#9333ea" }}>🤖</NodeIcon>
        AI 모델
        {selected && (
          <DeleteButton onClick={() => data?.onDeleteNode?.(id)} title="삭제">
            🗑️
          </DeleteButton>
        )}
      </NodeHeader>
      <NodeContent>
        <div>
          <strong>{data.model}</strong>
        </div>
        <div>온도: {data.temperature}</div>
        <div>최대 토큰: {data.maxTokens}</div>
      </NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
};

// 노드 타입별 컴포넌트 매핑
export const nodeComponents = {
  role: RoleNode,
  outputFormat: OutputFormatNode,
  condition: ConditionNode,
  context: ContextNode,
  promptTemplate: PromptTemplateNode,
  model: ModelNode,
};
