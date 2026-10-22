// 星空仪表 · 电量：Mac + 已连接蓝牙设备，细圆环 + 线条设备图标；点 Mac 开电池设置，点其他开蓝牙设置
import { css, run } from "uebersicht";
import { draggable } from "./lib/draggable.js";

export const command = `
B=$(pmset -g batt)
echo "MAC|MacBook|$(echo "$B" | grep -Eo '[0-9]+%' | head -1 | tr -d %)|$(echo "$B" | grep -Eo 'discharging|charging|charged|AC attached' | head -1)"
system_profiler SPBluetoothDataType 2>/dev/null | awk '
  /:$/ && !/Battery/ { n = $0 }
  /Battery Level:/   { gsub(/^ +|:$/, "", n); v = $NF; sub(/%/, "", v); print "BT|" n "|" v "|" $1 }'
`;
export const refreshFrequency = 60 * 1000;

export const className = `
  left: 64px;
  top: 334px;
  display: flex;
  gap: 26px;
  color: rgba(255, 255, 255, 0.92);
  font-family: -apple-system, "SF Pro Display", "PingFang SC";
  font-weight: 300;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.6);
  user-select: none;
`;

const cell = css`display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;`;
const pctCss = css`font-size: 14px; font-variant-numeric: tabular-nums;`;
const label = css`font-size: 11px; opacity: 0.5; letter-spacing: 1px; white-space: nowrap;`;

const GOLD = "#f3d9a4";
const S = { fill: "none", stroke: "white", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" };

// —— 线条设备图标（24×24） ——
const Glyph = ({ kind }) => (
  <g transform="translate(17 17)">
    {kind === "mac" && <g {...S}><rect x="4" y="6" width="16" height="10" rx="1.2" /><path d="M2 18.5h20" /></g>}
    {kind === "Left" && <g {...S}><circle cx="13" cy="8" r="3.4" /><path d="M11 10.6v8.4a1.3 1.3 0 0 0 2.6 0v-8" /></g>}
    {kind === "Right" && <g {...S}><circle cx="11" cy="8" r="3.4" /><path d="M13 10.6v8.4a1.3 1.3 0 0 1-2.6 0v-8" /></g>}
    {kind === "Case" && <g {...S}><rect x="5" y="7" width="14" height="11" rx="4" /><path d="M5 11h14" /></g>}
    {kind === "other" && <g {...S}><path d="M8 8l8 8-4 3V5l4 3-8 8" /></g>}
  </g>
);

const Ring = ({ pct, kind, name, charging, pane }) => {
  const R = 25, C = 2 * Math.PI * R;
  const col = charging ? "#9be7b0" : pct <= 20 ? "#ff7a6b" : pct <= 40 ? GOLD : "rgba(255,255,255,0.9)";
  return (
    <div className={cell} onClick={() => run(`open "x-apple.systempreferences:${pane}"`)}>
      <svg width="58" height="58" viewBox="0 0 58 58">
        <circle cx="29" cy="29" r={R} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.13)" strokeWidth="2" />
        <circle cx="29" cy="29" r={R} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round"
          strokeDasharray={`${(C * pct) / 100} ${C}`} transform="rotate(-90 29 29)"
          style={{ filter: `drop-shadow(0 0 3px ${col})` }} />
        <Glyph kind={kind} />
      </svg>
      <span className={pctCss}>{charging ? "⚡︎" : ""}{pct}%</span>
      <span className={label}>{name}</span>
    </div>
  );
};

const PART = { Left: "左耳", Right: "右耳", Case: "充电盒" };

export const render = ({ output }) => {
  const rows = (output || "").trim().split("\n").map((l) => l.split("|"));
  return (
    <div ref={draggable("sky-battery")} style={{ display: "contents" }}>
      {rows.map((r, i) => {
        const pct = parseInt(r[2], 10);
        if (isNaN(pct)) return null;
        if (r[0] === "MAC")
          return <Ring key={i} pct={pct} kind="mac" name="MacBook" charging={r[3] === "charging"}
            pane="com.apple.Battery-Settings.extension" />;
        const part = PART[r[3]];
        return <Ring key={i} pct={pct} kind={part ? r[3] : "other"} name={part || r[1].slice(0, 8)}
          pane="com.apple.BluetoothSettings" />;
      })}
    </div>
  );
};
