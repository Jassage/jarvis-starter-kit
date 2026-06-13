import Icon from './Icon';
import { CAT_ICON } from '@/lib/nav-config';

export default function CourseThumb({ course, h = 150, big = false }) {
  const c = course;
  return (
    <div className="edu-thumb" style={{ height: h, background: `linear-gradient(140deg, var(--${c.color}) 0%, var(--${c.color}-deep) 100%)` }}>
      <div className="edu-thumb-grid" />
      <Icon name={CAT_ICON[c.cat] || 'book'} size={big ? 56 : 40} style={{ color: '#fff', opacity: 0.92, position: 'relative' }} />
      <span className="edu-thumb-cat">{c.cat}</span>
      {c.price === 0 && <span className="edu-thumb-free">Gratuit</span>}
    </div>
  );
}
