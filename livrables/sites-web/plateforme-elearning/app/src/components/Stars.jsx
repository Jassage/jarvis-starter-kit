import Icon from './Icon';

export default function Stars({ rating, size = 14 }) {
  return (
    <span className="row gap-2" style={{ color: 'var(--amber)' }}>
      <Icon name="star" size={size} fill />
      <span style={{ fontWeight: 750, fontSize: size, color: 'var(--ink)' }} className="tnum">{rating.toFixed(1)}</span>
    </span>
  );
}
