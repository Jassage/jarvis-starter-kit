'use client';

export default function Switch({ checked, onChange, label, desc }) {
  return (
    <label className="edu-switch-row">
      <div className="col gap-2">
        <span style={{ fontWeight: 650, fontSize: 13.5 }}>{label}</span>
        {desc && <span className="tiny muted">{desc}</span>}
      </div>
      <span className={'edu-switch' + (checked ? ' is-on' : '')} onClick={() => onChange(!checked)}>
        <span className="edu-switch-knob" />
      </span>
    </label>
  );
}
