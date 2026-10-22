// 星空仪表 · 时钟：机械表盘 + 日期窗 + 月相小表盘；点表盘开「时钟」，点日期窗开「日历」
import { run } from "uebersicht";
import { draggable } from "./lib/draggable.js";

export const command = "true";
export const refreshFrequency = 1000;

export const className = `
  left: 64px;
  top: 64px;
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.55));
  user-select: none;
`;

const GOLD = "#f3d9a4";
const W = (a) => `rgba(255,255,255,${a})`;
const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 月相：以 2000-01-06 18:14 UTC 新月为基准，返回 0..1（0 新月，0.5 满月）
const moonPhase = (d) => {
  const days = (d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
  return (((days / 29.530588853) % 1) + 1) % 1;
};

const Moon = ({ cx, cy, r, p }) => {
  const rx = Math.abs(r * Math.cos(2 * Math.PI * p));
  const waxing = p < 0.5;
  const outer = waxing ? 1 : 0;
  const term = waxing ? (p < 0.25 ? 0 : 1) : (p > 0.75 ? 1 : 0);
  const d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${outer} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${term} ${cx} ${cy - r} Z`;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={W(0.08)} />
      <path d={d} fill={GOLD} opacity="0.92" />
    </g>
  );
};

const Hand = ({ deg, len, w, color, tail = 12, smooth }) => (
  <g style={{
    transform: `rotate(${deg}deg)`, transformOrigin: "100px 100px",
    transition: smooth ? "transform 0.35s cubic-bezier(.4,2.1,.55,1)" : "none",
  }}>
    <line x1="100" y1={100 + tail} x2="100" y2={100 - len}
      stroke={color} strokeWidth={w} strokeLinecap="round" />
  </g>
);

export const render = () => {
  const d = new Date();
  const s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
  // 秒针用当天累计角度，避免 59→0 秒时倒转一圈
  const secDeg = (d.getHours() * 3600 + d.getMinutes() * 60 + s) * 6;

  return (
    <svg ref={draggable("sky-clock")} width="236" height="236" viewBox="0 0 200 200"
      style={{ cursor: "pointer", overflow: "visible" }}
      onClick={() => run("open -a Clock")}>
      <defs>
        <radialGradient id="sky-face" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={W(0.07)} />
          <stop offset="100%" stopColor={W(0)} />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="98" fill="url(#sky-face)" stroke={W(0.28)} strokeWidth="0.8" />
      <circle cx="100" cy="100" r="85" fill="none" stroke={W(0.1)} strokeWidth="0.6" />

      {Array.from({ length: 60 }, (_, i) => {
        const hour = i % 5 === 0;
        return (
          <line key={i} x1="100" y1={hour ? 4 : 5} x2="100" y2={hour ? 15 : 9}
            stroke={i === 0 ? GOLD : W(hour ? 0.9 : 0.35)} strokeWidth={hour ? 1.8 : 0.7}
            strokeLinecap="round" transform={`rotate(${i * 6} 100 100)`} />
        );
      })}

      <text x="100" y="58" textAnchor="middle" fill={W(0.55)} fontSize="9"
        letterSpacing="3" fontFamily="-apple-system, 'PingFang SC'" fontWeight="300">
        {WEEK[d.getDay()]}
      </text>

      {/* 3 点位日期窗 */}
      <g onClick={(e) => { e.stopPropagation(); run("open -a Calendar"); }}>
        <rect x="134" y="92" width="22" height="16" rx="2.5" fill={W(0.06)} stroke={W(0.35)} strokeWidth="0.6" />
        <text x="145" y="104" textAnchor="middle" fill={W(0.92)} fontSize="10.5"
          fontFamily="-apple-system" fontWeight="500">{d.getDate()}</text>
      </g>

      {/* 6 点位月相小表盘 */}
      <circle cx="100" cy="142" r="15" fill="none" stroke={W(0.18)} strokeWidth="0.6" />
      <Moon cx={100} cy={142} r={10} p={moonPhase(d)} />

      <Hand deg={h * 30} len={46} w={4.2} color={W(0.95)} />
      <Hand deg={m * 6} len={72} w={2.4} color={W(0.92)} />
      <Hand deg={secDeg} len={86} w={0.9} color={GOLD} tail={20} smooth />

      <circle cx="100" cy="100" r="3.6" fill={GOLD} />
      <circle cx="100" cy="100" r="1.4" fill="#141414" />
    </svg>
  );
};
