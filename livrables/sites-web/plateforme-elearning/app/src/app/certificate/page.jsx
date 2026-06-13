'use client';

import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import AppShell from '@/components/AppShell';
import { EDU } from '@/lib/data';
import { useGo } from '@/lib/navigation';

const CornerBracket = ({ style }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
    style={{ position: 'absolute', ...style }}>
    <polyline points="32,3 3,3 3,32" stroke="var(--brand)" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="32,8 8,8 8,32" stroke="var(--brand)" strokeWidth="0.75"
      strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
  </svg>
);

const Seal = () => (
  <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
    <svg width="76" height="76" viewBox="0 0 76 76" fill="none"
      style={{ position: 'absolute', inset: 0 }}>
      <circle cx="38" cy="38" r="35" stroke="var(--brand)" strokeWidth="1.5" />
      <circle cx="38" cy="38" r="29" stroke="var(--brand)" strokeWidth="0.75"
        strokeDasharray="3.5 2.5" />
    </svg>
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 2,
    }}>
      <Icon name="award" size={22} style={{ color: 'var(--brand)' }} />
      <span style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--brand)', textTransform: 'uppercase' }}>Certifié</span>
    </div>
  </div>
);

export default function CertificatePage() {
  const go = useGo();
  const allCerts = EDU.certificates || [];
  const cert = {
    student: 'Julien Mercier',
    course: 'Design UI/UX : systèmes et prototypage',
    instructor: 'Marc Dubois',
    instructorRole: 'Design Lead · Figma',
    score: '92',
    date: '12 juin 2026',
    certId: 'CERT-2026-88210',
    hours: '12',
  };

  return (
    <AppShell role="student" active="certs" go={go} search={false}
      title="Certificat de réussite" subtitle={cert.course}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Action bar — hidden on print */}
        <div className="row between wrap gap-12 cert-no-print" style={{ marginBottom: 28 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => go('student')}>
            <Icon name="chevL" size={16} />Retour au dashboard
          </button>
          <div className="row gap-10">
            <button className="btn btn-outline btn-sm">
              <Icon name="link" size={16} />Partager LinkedIn
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Icon name="download" size={16} />Télécharger PDF
            </button>
          </div>
        </div>

        {/* ── Certificate card ── */}
        <div id="cert-print" style={{
          background: '#fff',
          border: '1px solid #DDD8D0',
          borderRadius: 8,
          padding: '36px 48px 32px',
          position: 'relative',
          boxShadow: '0 6px 32px rgba(0,0,0,0.09)',
        }}>
          {/* Corner brackets */}
          <CornerBracket style={{ top: 14, left: 14 }} />
          <CornerBracket style={{ top: 14, right: 14, transform: 'scaleX(-1)' }} />
          <CornerBracket style={{ bottom: 14, left: 14, transform: 'scaleY(-1)' }} />
          <CornerBracket style={{ bottom: 14, right: 14, transform: 'scale(-1)' }} />

          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingBottom: 20, borderBottom: '1px solid var(--border)', marginBottom: 28,
          }}>
            <Logo size={30} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                Certification Officielle
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3 }}>eduspher.com/verify</div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ textAlign: 'center', padding: '0 36px 24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: 22 }}>
              Certificat de Réussite
            </div>

            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 10, fontStyle: 'italic' }}>
              Décerné à
            </div>

            <div style={{
              fontSize: 44, fontWeight: 800, letterSpacing: '-0.025em',
              background: 'linear-gradient(135deg, var(--ink) 40%, var(--brand))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', lineHeight: 1.1, marginBottom: 22,
            }}>
              {cert.student}
            </div>

            <div style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 10 }}>
              pour avoir complété avec succès le cours
            </div>

            <div style={{
              fontSize: 22, fontWeight: 750, color: 'var(--ink)',
              letterSpacing: '-0.01em', lineHeight: 1.3,
              maxWidth: 480, marginInline: 'auto', marginBottom: 22,
            }}>
              {cert.course}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
              {[
                ['target', 'Score final : ' + cert.score + '%'],
                ['clock', 'Durée : ' + cert.hours + 'h'],
                ['calendar', cert.date],
              ].map(([ic, txt], i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
                  <Icon name={ic} size={14} style={{ color: 'var(--brand)' }} />{txt}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 24px' }} />

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, fontStyle: 'italic' }}>{cert.instructor}</div>
              <div style={{ height: 1, background: 'var(--border)', maxWidth: 140, marginInline: 'auto', marginBottom: 8 }} />
              <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{cert.instructorRole}</div>
            </div>
            <div style={{ padding: '0 28px' }}>
              <Seal />
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, fontStyle: 'italic' }}>EduSpher</div>
              <div style={{ height: 1, background: 'var(--border)', maxWidth: 140, marginInline: 'auto', marginBottom: 8 }} />
              <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>Plateforme d'apprentissage</div>
            </div>
          </div>

          {/* Certificate ID */}
          <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10.5, color: 'var(--ink-4)', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
              ID : {cert.certId} · Vérifiable sur eduspher.com/verify
            </span>
          </div>
        </div>

        {/* Other certificates */}
        {allCerts.length > 0 && (
          <div className="cert-no-print" style={{ marginTop: 28 }}>
            <h3 className="h3" style={{ marginBottom: 14 }}>Tous mes certificats</h3>
            <div className="edu-grid edu-grid-2" style={{ gap: 12 }}>
              {allCerts.map((c, i) => (
                <div key={i} className="card anim-up" style={{ overflow: 'hidden', cursor: 'pointer', animationDelay: `${i * 0.05}s` }}>
                  <div style={{ height: 4, background: `var(--${c.color})` }} />
                  <div className="card-pad" style={{ paddingTop: 14 }}>
                    <div className="row gap-10" style={{ alignItems: 'flex-start' }}>
                      <div className={'edu-notif-ic edu-ic-' + c.color} style={{ flexShrink: 0 }}>
                        <Icon name="award" size={18} />
                      </div>
                      <div className="col grow" style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                        <div className="tiny muted" style={{ marginTop: 3 }}>{c.instructor} · {c.date}</div>
                        <div className="row between" style={{ marginTop: 10 }}>
                          <span className="badge badge-green badge-dot">Obtenu</span>
                          <span className="tnum" style={{ fontWeight: 800, fontSize: 14, color: `var(--${c.color})` }}>{c.score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
