// 星空仪表 · 天气：当前概况 + 指标行 + 7 日纵向预报（含风力/降水），数据来自 Open-Meteo；点击打开「天气」
import { css, run } from "uebersicht";
import { draggable } from "./lib/draggable.js";

const LAT = 38.90, LON = 121.59, PLACE = "沙河口区";

export const command =
  `curl -s -m 15 "https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant` +
  `&timezone=Asia%2FShanghai&forecast_days=7"`;
export const refreshFrequency = 30 * 60 * 1000;

const GOLD = "#f3d9a4";

export const className = `
  left: 340px;
  top: 74px;
  width: 400px;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.92);
  font-family: -apple-system, "SF Pro Display", "PingFang SC";
  font-weight: 300;
  font-size: 13px;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  user-select: none;
`;

const dim = css`opacity: 0.45;`;
const top = css`font-size: 11px; letter-spacing: 4px; opacity: 0.55;`;
const now = css`display: flex; align-items: center; gap: 16px; margin: 10px 0 16px;`;
const temp = css`font-size: 46px; font-weight: 200; line-height: 1; letter-spacing: -1px;`;
const nowTxt = css`display: flex; flex-direction: column; gap: 4px;`;
const stats = css`display: flex; gap: 22px; margin-bottom: 14px;`;
const stat = css`display: flex; flex-direction: column; align-items: center; gap: 4px;`;
const statK = css`font-size: 11px; opacity: 0.45; letter-spacing: 1px;`;
const row = css`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 30px;
  padding: 0 12px;
  margin-left: -12px;
  border-radius: 15px;
  font-variant-numeric: tabular-nums;
`;
const today = css`background: rgba(255,255,255,0.06);`;
const track = css`position: relative; width: 70px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1);`;

// 与电量组件同款的细圆环：中间写值，下面写名字
const Gauge = ({ frac, value, name }) => {
  const R = 17, C = 2 * Math.PI * R;
  return (
    <div className={stat}>
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={R} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.13)" strokeWidth="1.6" />
        <circle cx="21" cy="21" r={R} fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round"
          strokeDasharray={`${C * Math.max(0, Math.min(1, frac))} ${C}`} transform="rotate(-90 21 21)" />
        <text x="21" y="25" textAnchor="middle" fill="white" fontSize="11" fontWeight="400">{value}</text>
      </svg>
      <span className={statK}>{name}</span>
    </div>
  );
};

// —— 线条天气图标（24×24，描边） ——
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" };
const CLOUD = "M7 18.5h10.2a3.8 3.8 0 0 0 .4-7.58A5.6 5.6 0 0 0 6.9 12 3.3 3.3 0 0 0 7 18.5z";
const Sun = ({ x = 12, y = 12, r = 4 }) => (
  <g {...S}>
    <circle cx={x} cy={y} r={r} />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return <line key={i} x1={x + Math.cos(a) * (r + 2.5)} y1={y + Math.sin(a) * (r + 2.5)}
        x2={x + Math.cos(a) * (r + 4.5)} y2={y + Math.sin(a) * (r + 4.5)} />;
    })}
  </g>
);
const MoonIc = () => <path {...S} d="M16.5 14.5A6.5 6.5 0 0 1 9.5 5a6.5 6.5 0 1 0 7 9.5z" />;

const kind = (c) =>
  c === 0 ? "clear" : c <= 2 ? "partly" : c === 3 ? "cloud" : c <= 48 ? "fog" :
  c <= 67 || (c >= 80 && c <= 82) ? "rain" : c <= 86 ? "snow" : "storm";

const Icon = ({ code, size = 24, night }) => {
  const k = kind(code);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color: k === "clear" ? GOLD : "white", display: "block" }}>
      {k === "clear" && (night ? <MoonIc /> : <Sun />)}
      {k === "partly" && (
        <g>
          {night ? <g transform="translate(-3 -4) scale(.8)"><MoonIc /></g> : <Sun x={8} y={8} r={3} />}
          <path {...S} d={CLOUD} fill="rgba(10,14,30,0.9)" transform="translate(2 1)" />
        </g>
      )}
      {k === "cloud" && <path {...S} d={CLOUD} />}
      {k === "fog" && <g {...S}><line x1="4" y1="9" x2="20" y2="9" /><line x1="6" y1="13" x2="18" y2="13" /><line x1="4" y1="17" x2="20" y2="17" /></g>}
      {k === "rain" && <g {...S}><path d={CLOUD} transform="translate(0 -4)" /><line x1="9" y1="17" x2="8" y2="20" /><line x1="13" y1="17" x2="12" y2="20" /><line x1="17" y1="17" x2="16" y2="20" /></g>}
      {k === "snow" && <g {...S}><path d={CLOUD} transform="translate(0 -4)" /><circle cx="9" cy="19" r=".6" /><circle cx="13" cy="20" r=".6" /><circle cx="17" cy="19" r=".6" /></g>}
      {k === "storm" && <g {...S}><path d={CLOUD} transform="translate(0 -4)" /><path d="M12.5 15l-2 3.5h3l-2 3.5" /></g>}
    </svg>
  );
};

const TXT = (c) =>
  c === 0 ? "晴" : c <= 2 ? "少云" : c === 3 ? "阴" : c <= 48 ? "雾" : c <= 57 ? "毛毛雨" :
  c <= 61 ? "小雨" : c <= 63 ? "中雨" : c <= 67 ? "大雨" : c <= 77 ? "雪" : c <= 82 ? "阵雨" : c <= 86 ? "阵雪" : "雷雨";
const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const DIR = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
const dir = (deg) => DIR[Math.round(deg / 45) % 8] + "风";
// km/h → 蒲福风级
const level = (v) => [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118].filter((t) => v >= t).length;
const pad = (n) => String(n).padStart(2, "0");

export const render = ({ output, error }) => {
  let data;
  try { data = JSON.parse(output); } catch (e) {}
  if (error || !data || !data.daily) return <div className={top}>{PLACE} · 天气获取中…</div>;

  const { current: c, daily: dl } = data;
  const lo = Math.min(...dl.temperature_2m_min), hi = Math.max(...dl.temperature_2m_max);
  const pos = (t) => ((t - lo) / (hi - lo || 1)) * 100;
  const tMin = dl.temperature_2m_min[0], tMax = dl.temperature_2m_max[0];
  const R = 27, C = 2 * Math.PI * R;

  return (
    <div ref={draggable("sky-weather")} onClick={() => run("open -a Weather")}>
      <div className={top}>{PLACE}</div>

      {/* 当前：圆环里放图标，圆环进度 = 现在温度在今日最低~最高之间的位置 */}
      <div className={now}>
        <svg width="62" height="62" viewBox="0 0 62 62" style={{ overflow: "visible" }}>
          <circle cx="31" cy="31" r={R} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.13)" strokeWidth="1.6" />
          <circle cx="31" cy="31" r={R} fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round"
            strokeDasharray={`${C * Math.max(0.03, (c.temperature_2m - tMin) / (tMax - tMin || 1))} ${C}`}
            transform="rotate(-90 31 31)" style={{ filter: `drop-shadow(0 0 3px ${GOLD})` }} />
          <g transform="translate(16 16)"><Icon code={c.weather_code} size={30} night={!c.is_day} /></g>
        </svg>
        <span className={temp}>{Math.round(c.temperature_2m)}°</span>
        <div className={nowTxt}>
          <span style={{ fontSize: 15 }}>{TXT(c.weather_code)}</span>
          <span className={dim}>今日 {Math.round(tMin)}° ~ {Math.round(tMax)}°</span>
        </div>
      </div>

      <div className={stats}>
        <Gauge name="体感" value={`${Math.round(c.apparent_temperature)}°`}
          frac={(c.apparent_temperature + 10) / 45} />
        <Gauge name="湿度" value={`${c.relative_humidity_2m}`} frac={c.relative_humidity_2m / 100} />
        <Gauge name={dir(c.wind_direction_10m)} value={`${level(c.wind_speed_10m)}级`}
          frac={level(c.wind_speed_10m) / 12} />
        <Gauge name="降水" value={`${dl.precipitation_probability_max[0] ?? 0}`}
          frac={(dl.precipitation_probability_max[0] ?? 0) / 100} />
      </div>

      {dl.time.map((t, i) => {
        const mn = dl.temperature_2m_min[i], mx = dl.temperature_2m_max[i];
        const rain = dl.precipitation_probability_max[i] ?? 0;
        return (
          <div className={`${row} ${i === 0 ? today : ""}`} key={t}>
            <span style={{ width: 30, opacity: i === 0 ? 1 : 0.5 }}>{i === 0 ? "今天" : WEEK[new Date(t).getDay()]}</span>
            <Icon code={dl.weather_code[i]} size={18} />
            <span style={{ width: 120 }}>
              {TXT(dl.weather_code[i])}
              <span className={dim}> · {dir(dl.wind_direction_10m_dominant[i])}{level(dl.wind_speed_10m_max[i])}级</span>
            </span>
            <span className={dim} style={{ width: 30, textAlign: "right" }}>{rain >= 20 ? `☂${rain}` : ""}</span>
            <span className={dim} style={{ width: 24, textAlign: "right" }}>{Math.round(mn)}°</span>
            <div className={track}>
              <div style={{
                position: "absolute", top: 0, bottom: 0, borderRadius: 2,
                left: `${pos(mn)}%`, width: `${Math.max(pos(mx) - pos(mn), 6)}%`,
                background: `linear-gradient(90deg, rgba(255,255,255,0.55), ${GOLD})`,
                boxShadow: `0 0 4px ${GOLD}`,
              }} />
            </div>
            <span style={{ width: 24 }}>{Math.round(mx)}°</span>
          </div>
        );
      })}
    </div>
  );
};
