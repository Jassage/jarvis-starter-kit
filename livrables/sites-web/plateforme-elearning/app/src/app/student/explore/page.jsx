'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import CourseThumb from '@/components/CourseThumb';
import Stars from '@/components/Stars';
import { useGo } from '@/lib/navigation';

export default function ExplorePage() {
  const go = useGo();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/user/enrollments').then(r => r.json()),
    ]).then(([c, e]) => {
      setCourses(Array.isArray(c) ? c : []);
      setEnrolledIds(new Set(Array.isArray(e) ? e.map(x => x.courseId) : []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['Tous', ...new Set(courses.map(c => c.category))], [courses]);

  const filtered = courses.filter(c =>
    (category === 'Tous' || c.category === category) &&
    (search.trim() === '' || c.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell role="student" active="explore" go={go} search={false}
      title="Explorer" subtitle="Découvre tous les cours disponibles sur EduSpher.">
      <div className="edu-content-narrow">
        <div className="row gap-12 wrap" style={{ marginBottom: 20 }}>
          <div className="input-icon" style={{ flex: 1, minWidth: 220 }}>
            <Icon name="search" />
            <input className="input" placeholder="Rechercher un cours…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="row gap-8 wrap" style={{ marginBottom: 24 }}>
          {categories.map(cat => (
            <button key={cat} className="chip" style={{ height: 34, background: category === cat ? 'var(--brand)' : undefined, color: category === cat ? '#fff' : undefined }}
              onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-4)', paddingTop: 40 }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-4)', paddingTop: 40 }}>Aucun cours ne correspond à ta recherche.</div>
        ) : (
          <div className="lp-courses">
            {filtered.map((c, i) => (
              <div key={c.id} className="edu-course-card anim-up" style={{ animationDelay: `${i * 0.03}s`, cursor: 'pointer' }}
                onClick={() => router.push('/course?id=' + c.id)}>
                <div style={{ padding: 10 }}>
                  <CourseThumb course={{ color: c.color, cat: c.category, price: c.price }} h={156} />
                </div>
                <div style={{ padding: '6px 16px 18px' }}>
                  <div className="edu-course-meta">
                    <span className={'badge badge-' + (c.color || 'brand')}>{c.level}</span>
                    {enrolledIds.has(c.id) && <span className="badge badge-green">Inscrit</span>}
                  </div>
                  <h3 className="h4" style={{ marginTop: 11, fontSize: 16.5, lineHeight: 1.3 }}>{c.title}</h3>
                  <div className="row gap-8" style={{ marginTop: 12 }}>
                    <div className="avatar avatar-sm" style={{ fontSize: 11 }}>
                      {(c.author?.name || '?').split(' ').map(w => w[0]).join('')}
                    </div>
                    <span className="tiny muted">{c.author?.name || 'Formateur'}</span>
                  </div>
                  <hr className="hairline" style={{ margin: '14px 0' }} />
                  <div className="row between">
                    <div className="edu-course-meta"><Icon name="clock" size={14} />{c.hours}h · {c._count?.enrollments ?? 0} inscrits</div>
                    <div className="row gap-12">
                      {c.rating > 0 && <Stars rating={c.rating} />}
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{c.price === 0 ? 'Gratuit' : c.price + '€'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
