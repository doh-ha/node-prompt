import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// ResizeObserver 에러 필터링
const originalError = window.console.error;
const originalWarn = window.console.warn;

const isResizeObserverError = (message: any): boolean => {
  if (typeof message !== "string") return false;
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes("resizeobserver") || lowerMessage.includes("loop completed") || lowerMessage.includes("undelivered") || lowerMessage.includes("loop limit exceeded");
};

window.console.error = (...args) => {
  const message = args[0];
  if (isResizeObserverError(message)) {
    return;
  }
  originalError.apply(console, args);
};

window.console.warn = (...args) => {
  const message = args[0];
  if (isResizeObserverError(message)) {
    return;
  }
  originalWarn.apply(console, args);
};

// 전역 에러 핸들러
window.addEventListener("error", (event) => {
  if (isResizeObserverError(event.message)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (isResizeObserverError(event.reason)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// 추가적인 에러 캐치
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (isResizeObserverError(message)) {
    return true; // 에러를 처리했음을 알림
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
