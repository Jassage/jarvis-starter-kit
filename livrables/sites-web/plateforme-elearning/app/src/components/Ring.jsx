export default function Ring({ value, size = 116, stroke = 11, color = 'var(--brand)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="edu-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="edu-ring-track" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} stroke={color}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} className="edu-ring-fill" style={{ stroke: color }} />
    </svg>
  );
}
