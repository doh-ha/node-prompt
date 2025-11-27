// 사용자 로그 수집 서비스

export interface NodeStructureLog {
  timestamp: number;
  type: "node_created" | "node_updated" | "node_deleted";
  nodeId: string;
  nodeType: string;
  nodeData?: any;
  position?: { x: number; y: number };
}

export interface IterationLog {
  timestamp: number;
  type: "flow_executed" | "node_modified" | "node_deleted";
  flowId?: string;
  iterationNumber: number;
  changes?: {
    added?: any[];
    modified?: any[];
    deleted?: any[];
  };
  diff?: any;
}

export interface FeatureUsageLog {
  timestamp: number;
  feature: "template" | "flow_compare" | "node_recommendation" | "copy_paste" | "model_selection" | "other";
  details?: any;
}

export interface OutputLog {
  timestamp: number;
  iterationNumber: number;
  flowId?: string;
  output: any;
  isSelected?: boolean;
}

export interface UserLog {
  sessionId: string;
  canvasId?: string;
  startTime: number;
  endTime?: number;
  nodeStructureLogs: NodeStructureLog[];
  iterationLogs: IterationLog[];
  featureUsageLogs: FeatureUsageLog[];
  outputLogs: OutputLog[];
}

class LoggerService {
  private isLogging: boolean = false;
  private currentLog: UserLog | null = null;
  private sessionId: string = "";
  private canvasId: string | undefined = undefined;
  private iterationCounter: number = 0;
  private canvasLogs: Map<string, UserLog> = new Map(); // 캔버스별 로그 저장

  // 로그 수집 시작 (캔버스 ID 포함)
  startLogging(canvasId?: string): void {
    if (this.isLogging && this.canvasId === canvasId) return;

    this.isLogging = true;
    this.canvasId = canvasId;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.iterationCounter = 0;

    // 기존 캔버스 로그가 있으면 불러오기
    const existingLog = canvasId ? this.canvasLogs.get(canvasId) : null;
    if (existingLog) {
      this.currentLog = existingLog;
      this.iterationCounter = existingLog.iterationLogs.length > 0 
        ? Math.max(...existingLog.iterationLogs.map(log => log.iterationNumber)) 
        : 0;
    } else {
      this.currentLog = {
        sessionId: this.sessionId,
        canvasId: canvasId,
        startTime: Date.now(),
        nodeStructureLogs: [],
        iterationLogs: [],
        featureUsageLogs: [],
        outputLogs: [],
      };
    }

    console.log("📊 로그 수집 시작:", this.sessionId, canvasId ? `(캔버스: ${canvasId})` : "");
  }

  // 로그 수집 중지
  stopLogging(): UserLog | null {
    if (!this.isLogging || !this.currentLog) return null;

    this.isLogging = false;
    this.currentLog.endTime = Date.now();

    const log = { ...this.currentLog };
    
    // 캔버스별로 로그 저장
    if (this.canvasId) {
      this.canvasLogs.set(this.canvasId, log);
    }
    
    this.saveLog(log);
    this.currentLog = null;
    this.canvasId = undefined;

    console.log("📊 로그 수집 중지:", this.sessionId);
    return log;
  }

  // 캔버스별 로그 가져오기
  getCanvasLog(canvasId: string): UserLog | null {
    return this.canvasLogs.get(canvasId) || null;
  }

  // 현재 캔버스 ID 설정
  setCanvasId(canvasId: string | undefined): void {
    this.canvasId = canvasId;
    if (this.currentLog) {
      this.currentLog.canvasId = canvasId;
    }
  }

  // 로그 수집 상태 확인
  getIsLogging(): boolean {
    return this.isLogging;
  }

  // 노드 구조 로그 추가
  logNodeStructure(type: "node_created" | "node_updated" | "node_deleted", nodeId: string, nodeType: string, nodeData?: any, position?: { x: number; y: number }): void {
    if (!this.isLogging || !this.currentLog) return;

    this.currentLog.nodeStructureLogs.push({
      timestamp: Date.now(),
      type,
      nodeId,
      nodeType,
      nodeData,
      position,
    });
  }

  // Iteration 로그 추가
  logIteration(type: "flow_executed" | "node_modified" | "node_deleted", flowId?: string, changes?: any, diff?: any): void {
    if (!this.isLogging || !this.currentLog) return;

    if (type === "flow_executed") {
      this.iterationCounter++;
    }

    this.currentLog.iterationLogs.push({
      timestamp: Date.now(),
      type,
      flowId,
      iterationNumber: this.iterationCounter,
      changes,
      diff,
    });
  }

  // 기능 사용 로그 추가
  logFeatureUsage(feature: FeatureUsageLog["feature"], details?: any): void {
    if (!this.isLogging || !this.currentLog) return;

    this.currentLog.featureUsageLogs.push({
      timestamp: Date.now(),
      feature,
      details,
    });
  }

  // 출력물 로그 추가
  logOutput(output: any, flowId?: string, isSelected: boolean = false): void {
    if (!this.isLogging || !this.currentLog) return;

    this.currentLog.outputLogs.push({
      timestamp: Date.now(),
      iterationNumber: this.iterationCounter,
      flowId,
      output,
      isSelected,
    });
  }

  // 로그 저장 (로컬 스토리지 또는 서버 전송)
  private saveLog(log: UserLog): void {
    try {
      if (log.canvasId) {
        // 캔버스별로 저장
        const canvasLogs = this.getStoredCanvasLogs();
        canvasLogs[log.canvasId] = log;
        localStorage.setItem(`canvas_logs_${log.canvasId}`, JSON.stringify(log));
        localStorage.setItem("canvas_logs_index", JSON.stringify(Object.keys(canvasLogs)));
      } else {
        // 일반 로그 저장 (캔버스 ID가 없는 경우)
        const logs = this.getStoredLogs();
        logs.push(log);
        localStorage.setItem("user_logs", JSON.stringify(logs));
      }

      // 서버로 전송 (선택사항)
      // this.sendLogToServer(log);
    } catch (error) {
      console.error("로그 저장 실패:", error);
    }
  }

  // 저장된 로그 가져오기 (일반)
  getStoredLogs(): UserLog[] {
    try {
      const logs = localStorage.getItem("user_logs");
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("로그 불러오기 실패:", error);
      return [];
    }
  }

  // 저장된 캔버스별 로그 가져오기
  getStoredCanvasLogs(): Record<string, UserLog> {
    try {
      const index = localStorage.getItem("canvas_logs_index");
      if (!index) return {};

      const canvasIds = JSON.parse(index);
      const logs: Record<string, UserLog> = {};
      
      canvasIds.forEach((canvasId: string) => {
        const log = localStorage.getItem(`canvas_logs_${canvasId}`);
        if (log) {
          logs[canvasId] = JSON.parse(log);
        }
      });

      return logs;
    } catch (error) {
      console.error("캔버스 로그 불러오기 실패:", error);
      return {};
    }
  }

  // 특정 캔버스 로그 가져오기
  getStoredCanvasLog(canvasId: string): UserLog | null {
    try {
      const log = localStorage.getItem(`canvas_logs_${canvasId}`);
      return log ? JSON.parse(log) : null;
    } catch (error) {
      console.error("캔버스 로그 불러오기 실패:", error);
      return null;
    }
  }

  // 로그 다운로드 (모든 로그)
  downloadLogs(): void {
    const logs = this.getStoredLogs();
    const canvasLogs = this.getStoredCanvasLogs();
    const allLogs = {
      general: logs,
      canvas: canvasLogs,
    };
    const dataStr = JSON.stringify(allLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user_logs_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // 캔버스별 로그 다운로드
  downloadCanvasLog(canvasId: string): void {
    const log = this.getStoredCanvasLog(canvasId);
    if (!log) {
      console.warn("캔버스 로그가 없습니다:", canvasId);
      return;
    }
    const dataStr = JSON.stringify(log, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `canvas_log_${canvasId}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // 로그 초기화 (모든 로그)
  clearLogs(): void {
    localStorage.removeItem("user_logs");
    const index = localStorage.getItem("canvas_logs_index");
    if (index) {
      const canvasIds = JSON.parse(index);
      canvasIds.forEach((canvasId: string) => {
        localStorage.removeItem(`canvas_logs_${canvasId}`);
      });
      localStorage.removeItem("canvas_logs_index");
    }
    this.canvasLogs.clear();
    console.log("📊 로그 초기화 완료");
  }

  // 특정 캔버스 로그 초기화
  clearCanvasLog(canvasId: string): void {
    localStorage.removeItem(`canvas_logs_${canvasId}`);
    this.canvasLogs.delete(canvasId);
    const index = localStorage.getItem("canvas_logs_index");
    if (index) {
      const canvasIds = JSON.parse(index).filter((id: string) => id !== canvasId);
      if (canvasIds.length > 0) {
        localStorage.setItem("canvas_logs_index", JSON.stringify(canvasIds));
      } else {
        localStorage.removeItem("canvas_logs_index");
      }
    }
    console.log("📊 캔버스 로그 초기화 완료:", canvasId);
  }
}

// 싱글톤 인스턴스
export const logger = new LoggerService();

