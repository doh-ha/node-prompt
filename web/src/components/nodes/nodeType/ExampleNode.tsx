import React, { useState } from "react";
import { NodeInput } from "../../../styles/nodeStyles";
import { NodeShell } from "../NodeShell";
import { useAutosizeTextArea } from "../../../hooks/useAutosizeTextArea";

interface ExampleNodeProps {
  data: {
    content: string;
    label?: string;
    icon?: string;
    iconColor?: string;
    nodeBg?: string;
    onContentChange?: (content: string) => void;
    onDeleteNode?: (id: string) => void;
  };
  selected?: boolean;
  id?: string;
}

export const ExampleNode: React.FC<ExampleNodeProps> = ({ data, selected, id }) => {
  const [mode, setMode] = useState<"one" | "few">("one");
  const [count, setCount] = useState<number>(1);
  const [pairs, setPairs] = useState<Array<{ input: string; output: string }>>([{ input: "", output: "" }]);

  const syncCombined = (nextPairs: Array<{ input: string; output: string }>) => {
    if (data.onContentChange) {
      const combined = nextPairs.map((p, idx) => `Input ${nextPairs.length > 1 ? idx + 1 : ""}: ${p.input}\nOutput ${nextPairs.length > 1 ? idx + 1 : ""}: ${p.output}`.trim()).join("\n\n");
      data.onContentChange(combined);
    }
  };

  const updatePair = (i: number, field: "input" | "output", value: string) => {
    const next = pairs.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
    setPairs(next);
    syncCombined(next);
  };

  const onModeChange = (nextMode: "one" | "few") => {
    setMode(nextMode);
    if (nextMode === "one") {
      const next = [{ input: "", output: "" }];
      setPairs(next);
      setCount(1);
      syncCombined(next);
    } else {
      // few-shot은 2부터 시작
      const n = Math.min(10, Math.max(2, count));
      const next = Array.from({ length: n }, (_, i) => pairs[i] || { input: "", output: "" });
      setCount(n);
      setPairs(next);
      syncCombined(next);
    }
  };

  const onCountChange = (n: number) => {
    const nextCount = Math.max(1, Math.min(10, Math.floor(n || 0)));

    // few-shot 상태에서 1이 되면 one-shot으로 전환
    if (mode === "few" && nextCount <= 1) {
      setMode("one");
      setCount(1);
      const single = [{ input: "", output: "" }];
      setPairs(single);
      syncCombined(single);
      return;
    }

    // one-shot에서 숫자만 변경하는 경우, 그대로 1로 유지
    if (mode === "one") {
      setCount(1);
      const single = [{ input: pairs[0]?.input || "", output: pairs[0]?.output || "" }];
      setPairs(single);
      syncCombined(single);
      return;
    }

    // few-shot 유효 범위(2~10)
    const boundedFew = Math.min(10, Math.max(2, nextCount));
    setCount(boundedFew);
    const next = Array.from({ length: boundedFew }, (_, i) => pairs[i] || { input: "", output: "" });
    setPairs(next);
    syncCombined(next);
  };

  return (
    <NodeShell id={id} selected={selected} title={data.label} icon={data.icon} iconColor={data.iconColor} bg={data.nodeBg} onDelete={id ? () => data?.onDeleteNode?.(id) : undefined}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as any)}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
          >
            <option value="one">one shot</option>
            <option value="few">few shot</option>
          </select>

          {mode === "few" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCountChange(count - 1);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
              >
                -
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={count}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  const n = onlyDigits === "" ? 0 : parseInt(onlyDigits, 10);
                  onCountChange(n);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 25, textAlign: "center", padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCountChange(count + 1);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
              >
                +
              </button>
            </div>
          )}
        </div>

        {pairs.map((p, i) => {
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 }}>
              {pairs.length > 1 && <div style={{ fontSize: 12, color: "#6b7280" }}>Example {i + 1}</div>}
              <div style={{ fontSize: 12, color: "#374151" }}>Input</div>
              <NodeInput
                placeholder="입력 예시를 적어주세요..."
                value={p.input}
                onChange={(e) => updatePair(i, "input", e.target.value)}
                onPaste={(e) => e.stopPropagation()}
                onCopy={(e) => e.stopPropagation()}
                onCut={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
              <div style={{ fontSize: 12, color: "#374151", marginTop: 2 }}>Output</div>
              <NodeInput
                placeholder="출력 예시를 적어주세요..."
                value={p.output}
                onChange={(e) => updatePair(i, "output", e.target.value)}
                onPaste={(e) => e.stopPropagation()}
                onCopy={(e) => e.stopPropagation()}
                onCut={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          );
        })}
      </div>
    </NodeShell>
  );
};
