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
  private iterationCounter: number = 0;

  // 로그 수집 시작
  startLogging(): void {
    if (this.isLogging) return;

    this.isLogging = true;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.iterationCounter = 0;

    this.currentLog = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      nodeStructureLogs: [],
      iterationLogs: [],
      featureUsageLogs: [],
      outputLogs: [],
    };

    console.log("📊 로그 수집 시작:", this.sessionId);
  }

  // 로그 수집 중지
  stopLogging(): UserLog | null {
    if (!this.isLogging || !this.currentLog) return null;

    this.isLogging = false;
    this.currentLog.endTime = Date.now();

    const log = { ...this.currentLog };
    this.saveLog(log);
    this.currentLog = null;

    console.log("📊 로그 수집 중지:", this.sessionId);
    return log;
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
      // 로컬 스토리지에 저장
      const logs = this.getStoredLogs();
      logs.push(log);
      localStorage.setItem("user_logs", JSON.stringify(logs));

      // 서버로 전송 (선택사항)
      // this.sendLogToServer(log);
    } catch (error) {
      console.error("로그 저장 실패:", error);
    }
  }

  // 저장된 로그 가져오기
  getStoredLogs(): UserLog[] {
    try {
      const logs = localStorage.getItem("user_logs");
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("로그 불러오기 실패:", error);
      return [];
    }
  }

  // 로그 다운로드
  downloadLogs(): void {
    const logs = this.getStoredLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user_logs_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // 로그 초기화
  clearLogs(): void {
    localStorage.removeItem("user_logs");
    console.log("📊 로그 초기화 완료");
  }
}

// 싱글톤 인스턴스
export const logger = new LoggerService();

