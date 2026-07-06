'use client';

export default function Switch({ checked, onChange, label, desc, disabled = false }) {
  return (
    <label className="edu-switch-row" style={disabled ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}>
      <div className="col gap-2">
        <span style={{ fontWeight: 650, fontSize: 13.5 }}>
          {label}
          {disabled && <span className="badge" style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, height: 19 }}>Bientôt disponible</span>}
        </span>
        {desc && <span className="tiny muted">{desc}</span>}
      </div>
      <span className={'edu-switch' + (checked ? ' is-on' : '')} onClick={() => !disabled && onChange(!checked)}>
        <span className="edu-switch-knob" />
      </span>
    </label>
  );
}
