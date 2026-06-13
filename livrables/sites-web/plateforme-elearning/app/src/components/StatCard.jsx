import Icon from './Icon';

export default function StatCard({ icon, color = 'brand', label, value, delta, deltaUp = true }) {
  return (
    <div className="card card-pad col gap-12">
      <div className="between" style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div className={'edu-stat-ic edu-ic-' + color}><Icon name={icon} size={20} /></div>
        {delta && (
          <span className={'edu-delta ' + (deltaUp ? 'up' : 'down')}>
            <Icon name="trending" size={13} stroke={2.4} />{delta}
          </span>
        )}
      </div>
      <div className="col gap-2">
        <span className="tnum" style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</span>
        <span className="small muted">{label}</span>
      </div>
    </div>
  );
}
