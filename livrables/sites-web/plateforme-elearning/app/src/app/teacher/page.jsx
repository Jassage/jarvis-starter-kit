'use client';

import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import Stars from '@/components/Stars';
import StatCard from '@/components/StatCard';
import { EDU } from '@/lib/data';
import { useGo } from '@/lib/navigation';

export default function TeacherDashboard() {
  const go = useGo();
  const E = EDU;
  const tc = E.teacherCourses;
  const bars = [62, 70, 58, 84, 76, 92, 88, 100, 81, 95, 90, 108];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const maxBar = Math.max(...bars);

  return (
    <AppShell role="teacher" active="teacher" go={go} search={false}
      title="Tableau de bord" subtitle="Bonjour Sofia — voici l'activité de tes cours cette semaine.">
      <div className="edu-content-narrow">
        {/* header action */}
        <div className="row between wrap gap-12" style={{ marginBottom: 22 }}>
          <div className="edu-tabbar">
            <button className="is-active">Vue d'ensemble</button>
            <button>Cette semaine</button>
            <button>Ce mois</button>
          </div>
          <button className="btn btn-primary" onClick={() => go('teacher')}><Icon name="plus" size={18} />Créer un cours</button>
        </div>

        {/* stats */}
        <div className="edu-grid edu-grid-4" style={{ marginBottom: 22 }}>
          <StatCard icon="users" color="brand" label="Étudiants inscrits" value="15 960" delta="+12%" />
          <StatCard icon="trending" color="green" label="Revenu ce mois" value="6 240 €" delta="+8%" />
          <StatCard icon="star" color="amber" label="Note moyenne" value="4,87" delta="+0,1" />
          <StatCard icon="target" color="violet" label="Taux de complétion" value="61%" delta="+4%" />
        </div>

        <div className="edu-cols">
          {/* LEFT */}
          <div className="col gap-22">
            {/* chart */}
            <div className="card card-pad">
              <div className="row between" style={{ marginBottom: 18 }}>
                <div className="col gap-2">
                  <h3 className="h3">Inscriptions</h3>
                  <span className="small muted">1 014 nouvelles inscriptions cette année</span>
                </div>
                <div className="row gap-8">
                  <span className="badge badge-brand badge-dot">2026</span>
                </div>
              </div>
              <div className="edu-bar-chart">
                {bars.map((b, i) => (
                  <div key={i} className="col grow gap-8" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div className={'edu-bar' + (b === maxBar ? ' hl' : '')} style={{ height: `${(b / maxBar) * 100}%`, width: '100%' }} title={b + ' inscrits'} />
                    <span className="tiny muted">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* my courses */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="row between card-pad" style={{ paddingBottom: 14 }}>
                <h3 className="h3">Mes cours</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => go('teacher')}>Gérer<Icon name="chevR" size={15} /></button>
              </div>
              <div className="edu-table-scroll">
                <table className="edu-table">
                  <thead><tr><th>Cours</th><th>Étudiants</th><th>Note</th><th>Complétion</th><th>Revenu</th><th>Statut</th></tr></thead>
                  <tbody>
                    {tc.map((c, i) => (
                      <tr key={i} style={{ cursor: 'pointer' }} onClick={() => go('course')}>
                        <td style={{ maxWidth: 240 }}>
                          <div className="row gap-10">
                            <div className="edu-thumb" style={{ width: 44, height: 32, borderRadius: 7, background: `linear-gradient(140deg, var(--${['brand','violet','teal'][i]}), var(--${['brand','violet','teal'][i]}-deep))` }} />
                            <span style={{ fontWeight: 650, fontSize: 13.5, lineHeight: 1.3 }}>{c.title}</span>
                          </div>
                        </td>
                        <td className="tnum">{c.students.toLocaleString('fr')}</td>
                        <td>{c.rating ? <Stars rating={c.rating} size={13} /> : <span className="muted">—</span>}</td>
                        <td style={{ minWidth: 110 }}>
                          {c.status === 'draft' ? <span className="muted">—</span> : (
                            <div className="row gap-8"><div className="track" style={{ width: 60 }}><div className="track-fill" style={{ width: c.completion + '%' }} /></div><span className="tiny tnum muted">{c.completion}%</span></div>
                          )}
                        </td>
                        <td className="tnum" style={{ fontWeight: 650 }}>{c.revenue ? c.revenue.toLocaleString('fr') + ' €' : '—'}</td>
                        <td><span className={'badge ' + (c.status === 'published' ? 'badge-green' : 'badge-amber') + ' badge-dot'}>{c.status === 'published' ? 'Publié' : 'Brouillon'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col gap-18">
            {/* course builder teaser */}
            <div className="card card-pad">
              <div className="row gap-8" style={{ marginBottom: 4 }}><Icon name="layers" size={18} style={{ color: 'var(--brand)' }} /><h3 className="h4">Créateur de cours</h3></div>
              <p className="tiny muted" style={{ marginBottom: 14 }}>« Architecture front-end » — brouillon en cours</p>
              <div className="col gap-8">
                {[['video', "Vidéo d'intro", 'brand', true], ['doc', 'Leçon : Modularité', 'violet', true], ['quiz', 'Quiz — Module 1', 'amber', false]].map(([ic, t, col, done], i) => (
                  <div key={i} className="row gap-10" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-2)' }}>
                    <div className={'edu-notif-ic edu-ic-' + col} style={{ width: 30, height: 30 }}><Icon name={ic} size={15} /></div>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t}</span>
                    {done ? <Icon name="checkCircle" size={17} style={{ marginLeft: 'auto', color: 'var(--green)' }} /> : <span className="tiny muted" style={{ marginLeft: 'auto' }}>à faire</span>}
                  </div>
                ))}
                <button className="btn btn-outline btn-sm btn-block" style={{ marginTop: 4, borderStyle: 'dashed' }}><Icon name="plus" size={16} />Ajouter un module</button>
              </div>
              <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => go('teacher')}>Continuer l'édition</button>
            </div>

            {/* recent students */}
            <div className="card card-pad">
              <div className="row between" style={{ marginBottom: 10 }}>
                <h3 className="h4">Étudiants récents</h3>
                <button className="btn btn-ghost btn-sm" style={{ height: 28 }} onClick={() => go('teacher')}>Voir tout</button>
              </div>
              {E.students.slice(0, 5).map((s, i) => (
                <div key={i} className="edu-list-row">
                  <div className="avatar avatar-sm" style={{ background: `var(--${['brand','violet','teal','amber','green'][i]}-soft)`, color: `var(--${['brand','violet','teal','amber','green'][i]})` }}>{s.name.split(' ').map(w => w[0]).join('')}</div>
                  <div className="col grow" style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 650, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                    <span className="tiny muted">{s.courses} cours · {s.active}</span>
                  </div>
                  <span className={'badge ' + (s.status === 'certified' ? 'badge-green' : s.status === 'risk' ? 'badge-rose' : 'badge-brand')}>{s.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
