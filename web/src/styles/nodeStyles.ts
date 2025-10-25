import styled from "styled-components";

// 노드 컨테이너 스타일
export const NodeContainer = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #4f46e5;
    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

// 노드 헤더 스타일
export const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #374151;
  position: relative;
`;

// 노드 아이콘 스타일 (노드 내부용)
export const NodeIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

// 노드 내용 스타일
export const NodeContent = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

// 노드 입력 필드 스타일
export const NodeInput = styled.textarea`
  width: 100%;
  min-height: 30px;
  max-height: 100px;
  margin-top: 8px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
  overflow-y: auto;
  resize: none;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;

// 삭제 버튼 스타일
export const DeleteButton = styled.button`
  position: absolute;
  right: 0;
  top: -4px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }

  ${NodeContainer}.selected & {
    display: inline-flex;
  }
`;

// 라이브러리 패널 스타일
export const PaletteContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  overflow-y: auto;
  padding: 20px 16px;
  box-sizing: border-box;
`;

export const PaletteTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
`;

export const GroupTitle = styled.h3`
  margin: 20px 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const NodeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    cursor: grabbing;
  }
`;

// 라이브러리 노드 아이콘 스타일
export const LibraryNodeIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`;

export const NodeInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NodeName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

export const NodeDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
`;

// 캔버스 에디터 스타일
export const EditorContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

export const Toolbar = styled.div`
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

export const ToolbarButton = styled.button`
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

export const FlowContainer = styled.div`
  margin-left: 260px;
  height: calc(100vh - 60px);
  position: relative;
`;

// 프리뷰 패널 스타일
export const PreviewContainer = styled.div`
  position: fixed;
  right: 0;
  top: 60px;
  width: 400px;
  height: calc(100vh - 60px);
  background: white;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;
  z-index: 1000;
`;

export const PreviewHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

export const PreviewTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
`;

export const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: ${(p) => (p.active ? "white" : "#f9fafb")};
  color: ${(p) => (p.active ? "#4f46e5" : "#6b7280")};
  font-weight: ${(p) => (p.active ? "600" : "400")};
  cursor: pointer;
  border-bottom: 2px solid ${(p) => (p.active ? "#4f46e5" : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.active ? "white" : "#f3f4f6")};
  }
`;

export const PromptText = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  margin: 20px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  border: 1px solid #e5e7eb;
`;

export const ComponentList = styled.div`
  padding: 20px;
`;

export const ComponentItem = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid #4f46e5;
`;

export const ComponentTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

export const ComponentContent = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

export const TestInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin: 20px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;

export const TestButton = styled.button`
  margin: 0 20px 20px 20px;
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

export const ResponseArea = styled.div`
  margin: 20px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  min-height: 100px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
`;

// Context 노드용 컨테이너 (recommendation 버튼을 위한 추가 공간)
export const ContextNodeContainer = styled.div`
  position: relative;

  /* NodeContainer를 확장하여 전체 높이 증가 */
  ${NodeContainer} {
    min-height: 100px; /* 기본 높이보다 높게 설정 */
  }
`;

// 로딩 스피너 애니메이션
export const LoadingSpinner = styled.div`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
