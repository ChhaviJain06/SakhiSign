/**
 * Lightweight SVG radar (spider) chart for the 4 component scores — the kind
 * of multi-axis plot used to evaluate models. No chart library needed.
 */
const AXES = [
  { key: "handshape", label: "Handshape" },
  { key: "position", label: "Position" },
  { key: "movement", label: "Movement" },
  { key: "timing", label: "Timing" },
];

export default function ComponentRadar({ scores = {}, size = 200 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34;
  const n = AXES.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2; // start at top
  const at = (i, k) => [cx + Math.cos(angle(i)) * r * k, cy + Math.sin(angle(i)) * r * k];
  const valPt = (i, v) => at(i, Math.max(0, Math.min(100, v)) / 100);

  const rings = [0.25, 0.5, 0.75, 1].map((k) =>
    AXES.map((_, i) => at(i, k).join(",")).join(" ")
  );
  const poly = AXES.map((a, i) => valPt(i, scores?.[a.key] ?? 0).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="shrink-0">
      {rings.map((g, i) => (
        <polygon key={i} points={g} fill="none" stroke="rgba(11,31,75,0.10)" />
      ))}
      {AXES.map((a, i) => {
        const [x, y] = at(i, 1);
        return <line key={a.key} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(11,31,75,0.10)" />;
      })}
      <polygon points={poly} fill="rgba(255,159,28,0.22)" stroke="#FF9F1C" strokeWidth="2" strokeLinejoin="round" />
      {AXES.map((a, i) => {
        const [x, y] = valPt(i, scores?.[a.key] ?? 0);
        return <circle key={a.key} cx={x} cy={y} r="3.5" fill="#FF9F1C" />;
      })}
      {AXES.map((a, i) => {
        const [x, y] = at(i, 1.2);
        return (
          <text key={a.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10.5" fontWeight="700" fill="#5A6B8C">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
