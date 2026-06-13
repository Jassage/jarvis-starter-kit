'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import CourseThumb from '@/components/CourseThumb';
import Stars from '@/components/Stars';
import { courses } from '@/lib/data';
import { useGo } from '@/lib/navigation';

export default function Landing() {
  const go = useGo();
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    const onScroll = () => setScrolled(el.scrollTop > 12);
    el.addEventListener('scroll', onScroll); return () => el.removeEventListener('scroll', onScroll);
  }, []);
  const C = courses;
  const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const features = [
    { ic: 'video', color: 'brand', t: 'Cours vidéo HD & ressources', d: 'Vidéos, supports PDF, code source et liens — tout regroupé, accessible hors-ligne et à ton rythme.' },
    { ic: 'quiz', color: 'violet', t: 'Quiz & évaluations intelligents', d: 'Valide tes acquis avec des quiz minutés, un feedback immédiat et des examens notés automatiquement.' },
    { ic: 'trending', color: 'teal', t: 'Suivi de progression', d: "Visualise ta progression module par module, ta série d'apprentissage et tes objectifs hebdomadaires." },
    { ic: 'award', color: 'amber', t: 'Certificats vérifiables', d: "Obtiens un certificat partageable sur LinkedIn dès qu'un cours est terminé à 100%." },
    { ic: 'users', color: 'green', t: 'Espace formateur complet', d: 'Crée des cours, ajoute modules et quiz, et suis la progression de tes apprenants en temps réel.' },
    { ic: 'target', color: 'rose', t: 'Parcours personnalisés', d: 'Des recommandations adaptées à ton niveau et à tes objectifs de carrière, mises à jour chaque semaine.' },
  ];

  const tests = [
    { n: 'Camille B.', r: 'Développeuse front-end', t: 'En 3 mois sur EduSpher, je suis passée de zéro à un poste de dev React. Les projets pratiques font toute la différence.', col: 'brand' },
    { n: 'Yanis M.', r: 'Étudiant en data', t: "Le suivi de progression me motive énormément. Voir ma série monter chaque jour, c'est addictif (dans le bon sens).", col: 'violet' },
    { n: 'Léa P.', r: 'Reconversion UX', t: "Les certificats m'ont aidée à décrocher mes premiers freelances. Interface claire, contenu premium.", col: 'teal' },
    { n: 'Omar H.', r: 'Chef de projet', t: 'Je forme toute mon équipe dessus. Le dashboard formateur est exactement ce qu\'il me fallait pour suivre tout le monde.', col: 'amber' },
    { n: 'Chloé G.', r: 'Marketeuse', t: "Des cours actualisés en permanence. C'est rare de trouver du contenu aussi à jour sur le growth et le SEO.", col: 'green' },
    { n: 'Nathan L.', r: 'Étudiant', t: "Gratuit pour démarrer, et la qualité est dingue. Les quiz minutés m'ont vraiment préparé à mes exams.", col: 'rose' },
  ];

  const pricing = [
    { name: 'Découverte', price: '0€', per: 'pour toujours', desc: 'Pour commencer à apprendre sans engagement.', cta: 'Commencer gratuitement', ctaClass: 'btn-outline', feats: ['Accès aux cours gratuits', 'Suivi de progression', 'Quiz illimités', "Communauté d'entraide"] },
    { name: 'Pro', price: '19€', per: '/ mois', desc: "L'accès complet pour progresser sérieusement.", cta: "Démarrer l'essai 14 j", ctaClass: 'btn-primary', featured: true, feats: ['Tout le catalogue (312 cours)', 'Certificats vérifiables', 'Projets corrigés', 'Téléchargement hors-ligne', 'Support prioritaire'] },
    { name: 'Équipe', price: '49€', per: '/ mois / siège', desc: 'Pour former et suivre toute une équipe.', cta: 'Contacter les ventes', ctaClass: 'btn-dark', feats: ['Tout le plan Pro', "Dashboard d'administration", 'Rapports de progression', 'Parcours assignés', 'Facturation centralisée'] },
  ];

  return (
    <div className="lp scroll-y" ref={scrollRef} style={{ height: '100vh', overflowY: 'auto' }}>
      {/* NAV */}
      <nav className={'lp-nav' + (scrolled ? ' scrolled' : '')}>
        <div className="lp-wrap row between" style={{ width: '100%' }}>
          <div className="row gap-32">
            <button onClick={() => go('landing')} style={{ display: 'flex' }}><Logo size={30} /></button>
            <div className="lp-nav-links">
              <a className="lp-nav-link" onClick={() => scrollToId('courses')}>Cours</a>
              <a className="lp-nav-link" onClick={() => go('comingSoon')}>Pour les entreprises</a>
              <a className="lp-nav-link" onClick={() => scrollToId('pricing')}>Tarifs</a>
              <a className="lp-nav-link" onClick={() => go('comingSoon')}>Ressources</a>
            </div>
          </div>
          <div className="row gap-10">
            <button className="btn btn-ghost edu-desktop-only" onClick={() => go('auth')}>Se connecter</button>
            <button className="btn btn-primary" onClick={() => go('auth')}>Commencer<Icon name="arrowR" size={17} /></button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-blob" style={{ width: 460, height: 460, background: 'var(--brand)', top: -120, right: -80 }} />
        <div className="lp-blob" style={{ width: 360, height: 360, background: 'var(--violet)', bottom: -160, left: -100 }} />
        <div className="lp-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div className="lp-hero-grid">
            <div className="anim-up">
              <span className="lp-pill"><b>NOUVEAU</b> Parcours IA & Data Science 2026</span>
              <h1 className="lp-h1">Apprends les compétences qui <em>comptent</em> vraiment.</h1>
              <p className="lead" style={{ marginTop: 22, maxWidth: 480 }}>
                Plus de 300 cours créés par des experts du terrain. Vidéos, quiz, projets et certificats — tout pour passer de la théorie à la pratique.
              </p>
              <div className="row gap-12 wrap" style={{ marginTop: 30 }}>
                <button className="btn btn-primary btn-lg" onClick={() => go('auth')}>Commencer gratuitement<Icon name="arrowR" size={18} /></button>
                <button className="btn btn-outline btn-lg" onClick={() => go('course')}><Icon name="play" size={16} fill />Voir une démo</button>
              </div>
              <div className="lp-social">
                <div className="lp-avatars">
                  {[['CB','brand'],['YM','violet'],['LP','teal'],['OH','amber']].map(([i, c], k) => (
                    <div key={k} className="avatar" style={{ background: `var(--${c}-soft)`, color: `var(--${c === 'teal' ? 'teal' : c})` }}>{i}</div>
                  ))}
                  <div className="avatar" style={{ background: 'var(--ink)', color: '#fff', fontSize: 12 }}>+9k</div>
                </div>
                <div className="col gap-2">
                  <div className="row gap-4" style={{ color: 'var(--amber)' }}>
                    {[0,1,2,3,4].map(i => <Icon key={i} name="star" size={15} fill />)}
                  </div>
                  <span className="small muted"><b style={{ color: 'var(--ink)' }}>4,9/5</b> · 9 200+ apprenants actifs</span>
                </div>
              </div>
            </div>

            {/* hero visual */}
            <div className="lp-hero-visual anim-up" style={{ animationDelay: '.08s' }}>
              <div className="lp-hero-card">
                <CourseThumb course={C[0]} h={188} big />
                <div style={{ padding: 20 }}>
                  <div className="row between">
                    <span className="badge badge-brand badge-dot">En cours</span>
                    <Stars rating={4.9} />
                  </div>
                  <h3 className="h3" style={{ marginTop: 12 }}>{C[0].title}</h3>
                  <div className="row gap-8" style={{ marginTop: 14 }}>
                    <div className="avatar avatar-sm" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>SL</div>
                    <span className="small muted">{C[0].author} · {C[0].authorRole}</span>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <div className="row between" style={{ marginBottom: 7 }}>
                      <span className="small" style={{ fontWeight: 650 }}>Progression</span>
                      <span className="small tnum" style={{ fontWeight: 700, color: 'var(--brand)' }}>68%</span>
                    </div>
                    <div className="track"><div className="track-fill" style={{ width: '68%' }} /></div>
                  </div>
                </div>
              </div>
              <div className="lp-float" style={{ top: -22, left: -26 }}>
                <div className="edu-stat-ic edu-ic-green"><Icon name="award" size={19} /></div>
                <div className="col" style={{ lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 750, fontSize: 14 }}>Certificat obtenu</span>
                  <span className="tiny muted">UI/UX · à l'instant</span>
                </div>
              </div>
              <div className="lp-float" style={{ bottom: 24, right: -30 }}>
                <div className="row gap-4" style={{ color: 'var(--amber)' }}><Icon name="fire" size={20} fill /></div>
                <div className="col" style={{ lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 750, fontSize: 14 }}>Série de 7 jours</span>
                  <span className="tiny muted">+120 XP aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>

          {/* logos */}
          <div style={{ marginTop: 72 }}>
            <p className="tiny muted" style={{ textAlign: 'center', marginBottom: 22, fontWeight: 600, letterSpacing: '0.04em' }}>
              ILS FORMENT LEURS ÉQUIPES SUR EDUSPHER
            </p>
            <div className="lp-logos">
              {['Qonto','Doctolib','OVHcloud','Alan','Back Market','Swile'].map((l, i) => (
                <span key={i} className="lp-logo-item"><Icon name={['zap','heart','shield','target','layers','sparkle'][i]} size={20} />{l}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <span className="eyebrow">Tout-en-un</span>
            <h2 className="lp-h2">Une plateforme pensée pour aller jusqu'au bout</h2>
            <p>De la première vidéo au certificat final, chaque détail est conçu pour te garder motivé et te faire progresser.</p>
          </div>
          <div className="lp-features">
            {features.map((f, i) => (
              <div key={i} className="lp-feature anim-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={'lp-feature-ic edu-ic-' + f.color}><Icon name={f.ic} size={24} /></div>
                <h3 className="h3">{f.t}</h3>
                <p className="muted" style={{ marginTop: 9, fontSize: 14.5, lineHeight: 1.55 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="lp-section" style={{ background: 'var(--bg-2)', paddingTop: 72, paddingBottom: 72 }}>
        <div className="lp-wrap">
          <div className="row between wrap gap-16" style={{ marginBottom: 40 }}>
            <div style={{ maxWidth: 520 }}>
              <span className="eyebrow">Catalogue</span>
              <h2 className="lp-h2" style={{ fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 800, letterSpacing: '-0.025em', marginTop: 10 }}>Les cours les plus populaires</h2>
            </div>
            <button className="btn btn-outline" onClick={() => go('auth')}>Explorer les 312 cours<Icon name="arrowR" size={16} /></button>
          </div>
          <div className="lp-courses">
            {C.map((c, i) => (
              <div key={c.id} className="edu-course-card anim-up" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => go('course')}>
                <div style={{ padding: 10 }}><CourseThumb course={c} h={156} /></div>
                <div style={{ padding: '6px 16px 18px' }}>
                  <div className="edu-course-meta">
                    <span className={'badge badge-' + c.color}>{c.level}</span>
                  </div>
                  <h3 className="h4" style={{ marginTop: 11, fontSize: 16.5, lineHeight: 1.3 }}>{c.title}</h3>
                  <div className="row gap-8" style={{ marginTop: 12 }}>
                    <div className="avatar avatar-sm" style={{ fontSize: 11 }}>{c.author.split(' ').map(w => w[0]).join('')}</div>
                    <span className="tiny muted">{c.author}</span>
                  </div>
                  <hr className="hairline" style={{ margin: '14px 0' }} />
                  <div className="row between">
                    <div className="edu-course-meta"><Icon name="clock" size={14} />{c.hours}h · {c.lessons} leçons</div>
                    <div className="row gap-12">
                      <Stars rating={c.rating} />
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{c.price === 0 ? 'Gratuit' : c.price + '€'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-section" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div className="lp-wrap">
          <div className="lp-stats">
            <div className="lp-stats-grid" />
            {[['48 000+','Apprenants'],['312','Cours experts'],['1,2 M','Heures suivies'],['94%','Taux de satisfaction']].map(([n, l], i) => (
              <div key={i} style={{ position: 'relative', zIndex: 2 }}>
                <div className="lp-stat-num tnum">{n}</div>
                <div className="lp-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section" style={{ paddingTop: 36 }}>
        <div className="lp-wrap">
          <div className="lp-section-head">
            <span className="eyebrow">Témoignages</span>
            <h2 className="lp-h2">Ils ont transformé leur carrière</h2>
          </div>
          <div className="lp-tests">
            {tests.map((t, i) => (
              <div key={i} className="lp-test">
                <div className="row gap-4" style={{ color: 'var(--amber)' }}>{[0,1,2,3,4].map(s => <Icon key={s} name="star" size={14} fill />)}</div>
                <p>"{t.t}"</p>
                <div className="row gap-10">
                  <div className="avatar avatar-sm" style={{ background: `var(--${t.col}-soft)`, color: `var(--${t.col})` }}>{t.n.split(' ').map(w => w[0]).join('')}</div>
                  <div className="col" style={{ lineHeight: 1.25 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{t.n}</span>
                    <span className="tiny muted">{t.r}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="lp-section" style={{ background: 'var(--bg-2)' }}>
        <div className="lp-wrap">
          <div className="lp-section-head">
            <span className="eyebrow">Tarifs</span>
            <h2 className="lp-h2">Un plan pour chaque ambition</h2>
            <p>Commence gratuitement, passe au niveau supérieur quand tu es prêt. Sans engagement.</p>
          </div>
          <div className="lp-pricing">
            {pricing.map((p, i) => (
              <div key={i} className={'lp-price-card' + (p.featured ? ' featured' : '')}>
                {p.featured && <span className="badge badge-brand" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', height: 26, fontWeight: 700 }}>★ Le plus choisi</span>}
                <h3 className="h3">{p.name}</h3>
                <p className="small muted" style={{ marginTop: 6, minHeight: 38 }}>{p.desc}</p>
                <div className="row gap-6" style={{ alignItems: 'baseline', margin: '14px 0 4px' }}>
                  <span className="lp-price-amt">{p.price}</span>
                  <span className="muted small">{p.per}</span>
                </div>
                <button className={'btn btn-block ' + p.ctaClass} style={{ margin: '18px 0 20px' }} onClick={() => go('auth')}>{p.cta}</button>
                <div className="col" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                  {p.feats.map((f, k) => (
                    <div key={k} className="lp-price-feat"><span className="ck"><Icon name="check" size={13} stroke={3} /></span>{f}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-section" style={{ paddingTop: 20 }}>
        <div className="lp-wrap">
          <div className="lp-cta">
            <div className="lp-stats-grid" />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2>Ta prochaine compétence<br />commence aujourd'hui.</h2>
              <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 18, marginTop: 18, maxWidth: 520, marginInline: 'auto' }}>
                Rejoins 48 000 apprenants. Premier cours offert, aucune carte requise.
              </p>
              <div className="row center gap-12 wrap" style={{ marginTop: 30 }}>
                <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--ink)' }} onClick={() => go('auth')}>Créer mon compte gratuit<Icon name="arrowR" size={18} /></button>
                <button className="btn btn-lg btn-ghost" style={{ color: '#fff', background: 'rgba(255,255,255,.1)' }} onClick={() => go('student')}>Découvrir le dashboard</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-grid">
            <div style={{ maxWidth: 280 }}>
              <Logo size={30} />
              <p className="small muted" style={{ marginTop: 16, lineHeight: 1.6 }}>La plateforme e-learning qui transforme la curiosité en compétences concrètes.</p>
              <div className="row gap-8" style={{ marginTop: 18 }}>
                {['globe','message','users','link'].map((ic, i) => (
                  <button key={i} className="btn btn-outline btn-icon btn-sm"><Icon name={ic} size={16} /></button>
                ))}
              </div>
            </div>
            {[
              ['Produit', [
                ['Catalogue', () => scrollToId('courses')],
                ['Pour les entreprises', () => go('comingSoon')],
                ['Tarifs', () => scrollToId('pricing')],
                ['Certificats', () => go('certificate')],
                ['Mobile', () => go('comingSoon')],
              ]],
              ['Catégories', ['Développement', 'Data & IA', 'Design', 'Marketing', 'Langues'].map(l => [l, () => scrollToId('courses')])],
              ['Entreprise', ['À propos', 'Carrières', 'Blog', 'Presse', 'Partenaires'].map(l => [l, () => go('comingSoon')])],
              ['Support', ["Centre d'aide", 'Contact', 'Confidentialité', 'CGU', 'Statut'].map(l => [l, () => go('comingSoon')])],
            ].map(([h, links], i) => (
              <div key={i}>
                <h5>{h}</h5>
                {links.map(([l, onClick], k) => <a key={k} className="lp-footer-link" onClick={onClick}>{l}</a>)}
              </div>
            ))}
          </div>
          <div className="lp-footer-bottom">
            <span className="tiny muted">© 2026 EduSpher. Tous droits réservés.</span>
            <span className="tiny muted">Conçu avec soin à Paris 🇫🇷</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
