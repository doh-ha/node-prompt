import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { logger } from "../../services/logger";
import { UserLog } from "../../services/logger";

const ToolbarContainer = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  height: 48px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  gap: 8px;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ToolbarCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolbarRight = styled.div`
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolbarButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background-color: ${(props) => (props.$active ? "#4f46e5" : "#f3f4f6")};
  color: ${(props) => (props.$active ? "white" : "#6b7280")};
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#4338ca" : "#e5e7eb")};
  }
`;

const LogButton = styled.button<{ $isLogging: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background-color: ${(props) => (props.$isLogging ? "#ef4444" : "#10b981")};
  color: white;
  transition: all 0.2s;
  margin-left: 16px;

  &:hover {
    background-color: ${(props) => (props.$isLogging ? "#dc2626" : "#059669")};
  }
`;

const LogViewButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 400;
  background-color: white;
  color: #6b7280;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const LogModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const LogModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90vw;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flexdirection: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
`;

const LogContent = styled.div`
  flex: 1;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
`;

interface ModeToggleProps {
  mode: "pan" | "select" | "lock";
  onModeChange: (mode: "pan" | "select" | "lock") => void;
}

export const Toolbar: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  const [isLogging, setIsLogging] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logs, setLogs] = useState<UserLog[]>([]);

  useEffect(() => {
    setIsLogging(logger.getIsLogging());
  }, []);

  const handleLogToggle = () => {
    if (isLogging) {
      logger.stopLogging();
      setIsLogging(false);
    } else {
      logger.startLogging();
      setIsLogging(true);
    }
  };

  const handleViewLogs = () => {
    const storedLogs = logger.getStoredLogs();
    setLogs(storedLogs);
    setShowLogModal(true);
  };

  const handleDownloadLogs = () => {
    logger.downloadLogs();
  };

  const handleClearLogs = () => {
    if (window.confirm("모든 로그를 삭제하시겠습니까?")) {
      logger.clearLogs();
      setLogs([]);
      alert("로그가 삭제되었습니다.");
    }
  };

  return (
    <>
      <ToolbarContainer>
        <ToolbarCenter>
          <ToolbarButton $active={mode === "pan"} onClick={() => onModeChange("pan")}>
            ✋ 캔버스 이동
          </ToolbarButton>
          <ToolbarButton 
            $active={mode === "select" || mode === "lock"} 
            onClick={() => {
              // select와 lock 모드 사이를 순환
              if (mode === "select") {
                onModeChange("lock");
              } else if (mode === "lock") {
                onModeChange("select");
              } else {
                // pan 모드일 때는 select로 시작
                onModeChange("select");
              }
            }}
          >
            {mode === "lock" ? "🔒 잠금" : "⬜ 영역 선택"}
          </ToolbarButton>
          {/* 로그 관련 버튼 숨김 */}
          {/* <LogButton $isLogging={isLogging} onClick={handleLogToggle}>
            {isLogging ? "⏹ 로그 수집 중지" : "▶ 로그 수집 시작"}
          </LogButton> */}
        </ToolbarCenter>
        <ToolbarRight>
          {/* 로그 관련 버튼 숨김 */}
          {/* <LogViewButton onClick={handleViewLogs}>로그 확인</LogViewButton>
          <LogViewButton onClick={handleDownloadLogs}>다운로드</LogViewButton> */}
        </ToolbarRight>
      </ToolbarContainer>

      {showLogModal && (
        <LogModal onClick={() => setShowLogModal(false)}>
          <LogModalContent onClick={(e) => e.stopPropagation()}>
            <LogHeader>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>수집된 로그</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleDownloadLogs}
                  style={{
                    padding: "6px 12px",
                    background: "#6366f1",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  다운로드
                </button>
                <button
                  onClick={handleClearLogs}
                  style={{
                    padding: "6px 12px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowLogModal(false)}
                  style={{
                    padding: "6px 12px",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  닫기
                </button>
              </div>
            </LogHeader>
            <LogContent>{logs.length === 0 ? <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>수집된 로그가 없습니다.</div> : JSON.stringify(logs, null, 2)}</LogContent>
          </LogModalContent>
        </LogModal>
      )}
    </>
  );
};
