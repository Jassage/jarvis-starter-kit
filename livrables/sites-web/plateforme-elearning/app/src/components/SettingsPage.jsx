'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Icon from './Icon';
import AppShell from './AppShell';
import Switch from './Switch';
import { ROLE_USER, getInitials } from '@/lib/nav-config';
import { useGo } from '@/lib/navigation';

const EXTRA_TAB = {
  student: { key: 'learning', label: 'Apprentissage', icon: 'target' },
  teacher: { key: 'payment', label: 'Paiement', icon: 'briefcase' },
  admin: { key: 'platform', label: 'Plateforme', icon: 'shield' },
};

export default function SettingsPage({ role }) {
  const go = useGo();
  const { data: session } = useSession();
  const userMock = ROLE_USER[role] || ROLE_USER.student;
  const extra = EXTRA_TAB[role];
  const [tab, setTab] = useState('profile');

  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => {
        if (data.name) setProfileName(data.name);
        if (data.email) setProfileEmail(data.email);
      })
      .catch(() => {});
  }, []);

  async function saveProfile() {
    if (!profileName.trim()) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName }),
      });
      if (r.ok) setProfileMsg({ ok: true, text: 'Profil enregistré.' });
      else setProfileMsg({ ok: false, text: 'Erreur lors de la sauvegarde.' });
    } catch {
      setProfileMsg({ ok: false, text: 'Erreur réseau.' });
    } finally {
      setSavingProfile(false);
    }
  }

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifDigest, setNotifDigest] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  const [autoplay, setAutoplay] = useState(true);
  const [subtitles, setSubtitles] = useState(false);

  const [publicProfile, setPublicProfile] = useState(true);

  const [maintenance, setMaintenance] = useState(false);
  const [openSignups, setOpenSignups] = useState(true);
  const [autoModeration, setAutoModeration] = useState(true);

  const tabs = [
    { key: 'profile', label: 'Profil', icon: 'user' },
    { key: 'preferences', label: 'Préférences', icon: 'settings' },
    { key: 'security', label: 'Sécurité', icon: 'shield' },
    extra,
  ];

  return (
    <AppShell role={role} active="settings" go={go} search={false}
      title="Paramètres" subtitle={`Gère ton compte ${userMock.role.toLowerCase()} et tes préférences EduSpher.`}>
      <div className="edu-content-narrow" style={{ maxWidth: 760 }}>
        <div className="edu-tabbar" style={{ marginBottom: 22 }}>
          {tabs.map(t => (
            <button key={t.key} className={tab === t.key ? 'is-active' : ''} style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setTab(t.key)}>
              <Icon name={t.icon} size={15} />{t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card card-pad anim-in">
            <div className="row gap-16" style={{ alignItems: 'center', marginBottom: 24 }}>
              <div className="avatar avatar-lg" style={{ background: userMock.avColor, color: userMock.avInk, width: 64, height: 64, fontSize: 20, borderRadius: 'var(--r-lg)' }}>
                {profileName ? getInitials(profileName) : userMock.initials}
              </div>
              <div className="col gap-4">
                <span style={{ fontWeight: 700, fontSize: 16 }}>{profileName || userMock.name}</span>
                <span className="small muted">{profileEmail || userMock.role}</span>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}><Icon name="upload" size={15} />Changer la photo</button>
            </div>
            <div className="col gap-16">
              <div className="col gap-6">
                <label className="small" style={{ fontWeight: 650 }}>Nom complet</label>
                <input className="input" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Ton nom…" />
              </div>
              <div className="col gap-6">
                <label className="small" style={{ fontWeight: 650 }}>Adresse e-mail</label>
                <input className="input" type="email" value={profileEmail} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              </div>
              <div className="col gap-6">
                <label className="small" style={{ fontWeight: 650 }}>Bio</label>
                <textarea className="input" style={{ height: 90, paddingTop: 12, resize: 'none' }} placeholder="Parle un peu de toi…" />
              </div>
              <div className="col gap-6" style={{ maxWidth: 240 }}>
                <label className="small" style={{ fontWeight: 650 }}>Langue de l'interface</label>
                <select className="input">
                  <option>Français</option>
                  <option>English</option>
                  <option>Kreyòl ayisyen</option>
                </select>
              </div>
            </div>
            <div className="row gap-12" style={{ marginTop: 20, alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>
                <Icon name="check" size={16} />{savingProfile ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
              {profileMsg && (
                <span className={'small ' + (profileMsg.ok ? '' : 'error')} style={{ color: profileMsg.ok ? 'var(--green)' : 'var(--rose)' }}>
                  {profileMsg.text}
                </span>
              )}
            </div>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="col gap-18 anim-in">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 4 }}>Notifications</h3>
              <p className="tiny muted" style={{ marginBottom: 4 }}>Choisis les notifications que tu souhaites recevoir.</p>
              <Switch label="Notifications par e-mail" desc="Rappels de cours, messages, annonces" checked={notifEmail} onChange={setNotifEmail} />
              <Switch label="Notifications push" desc="Alertes en temps réel dans le navigateur" checked={notifPush} onChange={setNotifPush} />
              <Switch label="Résumé hebdomadaire" desc="Bilan de ta progression chaque lundi" checked={notifDigest} onChange={setNotifDigest} />
              <Switch label="Offres et actualités" desc="Nouveautés, promotions et conseils EduSpher" checked={notifMarketing} onChange={setNotifMarketing} />
            </div>
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Apparence</h3>
              <div className="col gap-6" style={{ maxWidth: 240 }}>
                <label className="small" style={{ fontWeight: 650 }}>Thème</label>
                <select className="input">
                  <option>Clair</option>
                  <option>Sombre</option>
                  <option>Système</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="col gap-18 anim-in">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Changer le mot de passe</h3>
              <div className="col gap-14">
                <div className="col gap-6"><label className="small" style={{ fontWeight: 650 }}>Mot de passe actuel</label><input className="input" type="password" placeholder="••••••••" /></div>
                <div className="col gap-6"><label className="small" style={{ fontWeight: 650 }}>Nouveau mot de passe</label><input className="input" type="password" placeholder="••••••••" /></div>
                <div className="col gap-6"><label className="small" style={{ fontWeight: 650 }}>Confirmer le mot de passe</label><input className="input" type="password" placeholder="••••••••" /></div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 18 }}><Icon name="shield" size={16} />Mettre à jour le mot de passe</button>
            </div>
            <div className="card card-pad">
              <Switch label="Authentification à deux facteurs" desc="Ajoute un code de vérification envoyé par e-mail à chaque connexion" checked={twoFA} onChange={setTwoFA} />
            </div>
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 6 }}>Sessions actives</h3>
              <div className="edu-list-row">
                <div className="edu-notif-ic edu-ic-brand"><Icon name="globe" size={16} /></div>
                <div className="col grow"><span style={{ fontWeight: 650, fontSize: 13.5 }}>Ce navigateur · Windows</span><span className="tiny muted">Pignon, Haïti · Actif maintenant</span></div>
                <span className="badge badge-green badge-dot">Actuel</span>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>Déconnecter les autres sessions</button>
            </div>
          </div>
        )}

        {tab === 'learning' && role === 'student' && (
          <div className="col gap-18 anim-in">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Objectifs d'apprentissage</h3>
              <div className="col gap-16">
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>Objectif hebdomadaire (leçons)</label>
                  <input className="input" type="number" defaultValue={7} min={1} max={50} />
                </div>
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>Niveau</label>
                  <select className="input">
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                  </select>
                </div>
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>Langue préférée des cours</label>
                  <select className="input">
                    <option>Français</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card card-pad">
              <Switch label="Lecture automatique de la leçon suivante" desc="La vidéo suivante démarre dès la fin de la précédente" checked={autoplay} onChange={setAutoplay} />
              <Switch label="Sous-titres activés par défaut" desc="Affiche les sous-titres dès le lancement d'une vidéo" checked={subtitles} onChange={setSubtitles} />
            </div>
          </div>
        )}

        {tab === 'payment' && role === 'teacher' && (
          <div className="col gap-18 anim-in">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Informations de paiement</h3>
              <div className="col gap-16">
                <div className="col gap-6">
                  <label className="small" style={{ fontWeight: 650 }}>IBAN</label>
                  <input className="input" defaultValue="FR76 •••• •••• •••• •••• 4821" />
                </div>
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>Devise de versement</label>
                  <select className="input">
                    <option>Euro (€)</option>
                    <option>Dollar US ($)</option>
                    <option>Gourde haïtienne (HTG)</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 18 }}><Icon name="check" size={16} />Enregistrer</button>
            </div>
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Profil public de formateur</h3>
              <div className="col gap-16">
                <div className="col gap-6">
                  <label className="small" style={{ fontWeight: 650 }}>Présentation publique</label>
                  <textarea className="input" style={{ height: 90, paddingTop: 12, resize: 'none' }} placeholder="Décris ton expertise pour les futurs étudiants…" />
                </div>
                <div className="col gap-6">
                  <label className="small" style={{ fontWeight: 650 }}>Site web ou portfolio</label>
                  <input className="input" type="url" placeholder="https://…" />
                </div>
              </div>
              <div style={{ marginTop: 6 }}>
                <Switch label="Profil public visible" desc="Les étudiants peuvent consulter ton profil formateur" checked={publicProfile} onChange={setPublicProfile} />
              </div>
            </div>
          </div>
        )}

        {tab === 'platform' && role === 'admin' && (
          <div className="col gap-18 anim-in">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 4 }}>Plateforme</h3>
              <p className="tiny muted" style={{ marginBottom: 4 }}>Ces réglages s'appliquent à tous les utilisateurs d'EduSpher.</p>
              <Switch label="Mode maintenance" desc="Rend la plateforme inaccessible aux étudiants et formateurs" checked={maintenance} onChange={setMaintenance} />
              <Switch label="Inscriptions ouvertes" desc="Autorise la création de nouveaux comptes" checked={openSignups} onChange={setOpenSignups} />
              <Switch label="Modération automatique des cours" desc="Les nouveaux cours passent par la file de validation avant publication" checked={autoModeration} onChange={setAutoModeration} />
            </div>
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Préférences générales</h3>
              <div className="col gap-16">
                <div className="col gap-6">
                  <label className="small" style={{ fontWeight: 650 }}>E-mail de support</label>
                  <input className="input" type="email" defaultValue="support@eduspher.com" />
                </div>
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>Devise par défaut</label>
                  <select className="input">
                    <option>Euro (€)</option>
                    <option>Dollar US ($)</option>
                    <option>Gourde haïtienne (HTG)</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 18 }}><Icon name="check" size={16} />Enregistrer</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
