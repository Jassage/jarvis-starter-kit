export default function Logo({ size = 30, light = false, withText = true }) {
  return (
    <div className="row gap-10" style={{ alignItems: 'center' }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.3, flexShrink: 0,
        background: 'linear-gradient(145deg, var(--brand) 0%, var(--violet) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px -3px rgba(55,104,217,0.55)', position: 'relative',
      }}>
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
          <path d="M3 8.5 12 4l9 4.5-9 4.5z" fill="#fff" />
          <path d="M7 11v4c0 1.5 2.2 2.6 5 2.6s5-1.1 5-2.6v-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75" />
        </svg>
      </div>
      {withText && (
        <span style={{ fontWeight: 800, fontSize: size * 0.6, letterSpacing: '-0.02em', color: light ? '#fff' : 'var(--ink)' }}>
          Edu<span style={{ color: 'var(--brand)' }}>Spher</span>
        </span>
      )}
    </div>
  );
}
