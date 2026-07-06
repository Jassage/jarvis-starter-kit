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

  const [weeklyGoal, setWeeklyGoal] = useState(7);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalMsg, setGoalMsg] = useState(null);

  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [iban, setIban] = useState('');
  const [payoutCurrency, setPayoutCurrency] = useState('HTG');
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState(null);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => {
        if (data.name) setProfileName(data.name);
        if (data.email) setProfileEmail(data.email);
        if (data.weeklyGoal) setWeeklyGoal(data.weeklyGoal);
        setBio(data.bio || '');
        setPortfolioUrl(data.portfolioUrl || '');
        setIban(data.iban || '');
        setPayoutCurrency(data.payoutCurrency || 'HTG');
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
        body: JSON.stringify({ name: profileName, bio }),
      });
      if (r.ok) setProfileMsg({ ok: true, text: 'Profil enregistré.' });
      else setProfileMsg({ ok: false, text: 'Erreur lors de la sauvegarde.' });
    } catch {
      setProfileMsg({ ok: false, text: 'Erreur réseau.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveWeeklyGoal() {
    setSavingGoal(true);
    setGoalMsg(null);
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyGoal }),
      });
      setGoalMsg(r.ok ? { ok: true, text: 'Objectif enregistré.' } : { ok: false, text: 'Erreur lors de la sauvegarde.' });
    } catch {
      setGoalMsg({ ok: false, text: 'Erreur réseau.' });
    } finally {
      setSavingGoal(false);
    }
  }

  async function savePaymentInfo() {
    setSavingPayment(true);
    setPaymentMsg(null);
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, portfolioUrl, iban, payoutCurrency }),
      });
      setPaymentMsg(r.ok ? { ok: true, text: 'Informations enregistrées.' } : { ok: false, text: 'Erreur lors de la sauvegarde.' });
    } catch {
      setPaymentMsg({ ok: false, text: 'Erreur réseau.' });
    } finally {
      setSavingPayment(false);
    }
  }

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  async function changePassword() {
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: 'La confirmation ne correspond pas.' });
      return;
    }
    setSavingPassword(true);
    try {
      const r = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        setPasswordMsg({ ok: true, text: 'Mot de passe mis à jour.' });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setPasswordMsg({ ok: false, text: data.error || 'Erreur lors de la mise à jour.' });
      }
    } catch {
      setPasswordMsg({ ok: false, text: 'Erreur réseau.' });
    } finally {
      setSavingPassword(false);
    }
  }

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifDigest, setNotifDigest] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  const [autoplay, setAutoplay] = useState(true);
  const [subtitles, setSubtitles] = useState(false);

  const [maintenance, setMaintenance] = useState(false);
  const [openSignups, setOpenSignups] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [platformMsg, setPlatformMsg] = useState(null);

  useEffect(() => {
    if (role !== 'admin') return;
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (typeof data.maintenanceMode === 'boolean') setMaintenance(data.maintenanceMode);
        if (typeof data.openSignups === 'boolean') setOpenSignups(data.openSignups);
      })
      .catch(() => {});
  }, [role]);

  async function savePlatformSetting(patch) {
    setSavingPlatform(true);
    setPlatformMsg(null);
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      setPlatformMsg(r.ok ? { ok: true, text: 'Réglage appliqué.' } : { ok: false, text: 'Erreur lors de la sauvegarde.' });
    } catch {
      setPlatformMsg({ ok: false, text: 'Erreur réseau.' });
    } finally {
      setSavingPlatform(false);
    }
  }

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
                <textarea className="input" style={{ height: 90, paddingTop: 12, resize: 'none' }} placeholder="Parle un peu de toi…" value={bio} onChange={e => setBio(e.target.value)} />
              </div>
              <div className="col gap-6" style={{ maxWidth: 240 }}>
                <label className="small" style={{ fontWeight: 650 }}>
                  Langue de l'interface
                  <span className="badge" style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, height: 19 }}>Bientôt disponible</span>
                </label>
                <select className="input" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}>
                  <option>Français</option>
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
              <p className="tiny muted" style={{ marginBottom: 4 }}>EduSpher n'envoie pour l'instant que des notifications dans l'application (cloche du header). L'envoi par e-mail ou push arrivera plus tard.</p>
              <Switch label="Notifications par e-mail" desc="Rappels de cours, messages, annonces" checked={notifEmail} onChange={setNotifEmail} disabled />
              <Switch label="Notifications push" desc="Alertes en temps réel dans le navigateur" checked={notifPush} onChange={setNotifPush} disabled />
              <Switch label="Résumé hebdomadaire" desc="Bilan de ta progression chaque lundi" checked={notifDigest} onChange={setNotifDigest} disabled />
              <Switch label="Offres et actualités" desc="Nouveautés, promotions et conseils EduSpher" checked={notifMarketing} onChange={setNotifMarketing} disabled />
            </div>
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 14 }}>Apparence</h3>
              <div className="col gap-6" style={{ maxWidth: 240 }}>
                <label className="small" style={{ fontWeight: 650 }}>
                  Thème
                  <span className="badge" style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, height: 19 }}>Bientôt disponible</span>
                </label>
                <select className="input" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}>
                  <option>Clair</option>
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
                <div className="col gap-6"><label className="small" style={{ fontWeight: 650 }}>Mot de passe actuel</label><input className="input" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
                <div className="col gap-6"><label className="small" style={{ fontWeight: 650 }}>Nouveau mot de passe</label><input className="input" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                <div className="col gap-6"><label className="small" style={{ fontWeight: 650 }}>Confirmer le mot de passe</label><input className="input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
              </div>
              <div className="row gap-12" style={{ marginTop: 18, alignItems: 'center' }}>
                <button className="btn btn-primary" onClick={changePassword} disabled={savingPassword || !currentPassword || !newPassword}>
                  <Icon name="shield" size={16} />{savingPassword ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </button>
                {passwordMsg && (
                  <span className="small" style={{ color: passwordMsg.ok ? 'var(--green)' : 'var(--rose)' }}>{passwordMsg.text}</span>
                )}
              </div>
            </div>
            <div className="card card-pad">
              <Switch label="Authentification à deux facteurs" desc="Ajoute un code de vérification envoyé par e-mail à chaque connexion" checked={twoFA} onChange={setTwoFA} disabled />
            </div>
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 6 }}>Session</h3>
              <div className="edu-list-row">
                <div className="edu-notif-ic edu-ic-brand"><Icon name="globe" size={16} /></div>
                <div className="col grow"><span style={{ fontWeight: 650, fontSize: 13.5 }}>Ce navigateur</span><span className="tiny muted">Connecté en tant que {profileEmail || userMock.role}</span></div>
                <span className="badge badge-green badge-dot">Actuel</span>
              </div>
              <p className="tiny muted" style={{ marginTop: 10 }}>Le suivi des sessions sur plusieurs appareils et leur déconnexion à distance ne sont pas encore disponibles.</p>
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
                  <input className="input" type="number" value={weeklyGoal} min={1} max={50}
                    onChange={e => setWeeklyGoal(Number(e.target.value))} />
                  <span className="tiny muted">Utilisé par le widget « Objectif de la semaine » du tableau de bord.</span>
                </div>
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>
                    Niveau
                    <span className="badge" style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, height: 19 }}>Bientôt disponible</span>
                  </label>
                  <select className="input" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}>
                    <option>Tous niveaux</option>
                  </select>
                </div>
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>
                    Langue préférée des cours
                    <span className="badge" style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, height: 19 }}>Bientôt disponible</span>
                  </label>
                  <select className="input" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}>
                    <option>Français</option>
                  </select>
                </div>
              </div>
              <div className="row gap-12" style={{ marginTop: 16, alignItems: 'center' }}>
                <button className="btn btn-primary" onClick={saveWeeklyGoal} disabled={savingGoal}>
                  <Icon name="check" size={16} />{savingGoal ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                {goalMsg && <span className="small" style={{ color: goalMsg.ok ? 'var(--green)' : 'var(--rose)' }}>{goalMsg.text}</span>}
              </div>
            </div>
            <div className="card card-pad">
              <Switch label="Lecture automatique de la leçon suivante" desc="La vidéo suivante démarre dès la fin de la précédente" checked={autoplay} onChange={setAutoplay} disabled />
              <Switch label="Sous-titres activés par défaut" desc="Affiche les sous-titres dès le lancement d'une vidéo" checked={subtitles} onChange={setSubtitles} disabled />
            </div>
          </div>
        )}

        {tab === 'payment' && role === 'teacher' && (
          <div className="col gap-18 anim-in">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 4 }}>Informations de paiement</h3>
              <p className="tiny muted" style={{ marginBottom: 4 }}>Sert de référence pour les versements de revenus, effectués manuellement par l'équipe EduSpher (aucun virement automatique).</p>
              <div className="col gap-16">
                <div className="col gap-6">
                  <label className="small" style={{ fontWeight: 650 }}>IBAN</label>
                  <input className="input" placeholder="FR76 •••• •••• •••• •••• 4821" value={iban} onChange={e => setIban(e.target.value)} />
                </div>
                <div className="col gap-6" style={{ maxWidth: 240 }}>
                  <label className="small" style={{ fontWeight: 650 }}>Devise de versement</label>
                  <select className="input" value={payoutCurrency} onChange={e => setPayoutCurrency(e.target.value)}>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                    <option value="HTG">Gourde haïtienne (HTG)</option>
                  </select>
                </div>
                <div className="col gap-6">
                  <label className="small" style={{ fontWeight: 650 }}>Site web ou portfolio</label>
                  <input className="input" type="url" placeholder="https://…" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
                </div>
              </div>
              <div className="row gap-12" style={{ marginTop: 18, alignItems: 'center' }}>
                <button className="btn btn-primary" onClick={savePaymentInfo} disabled={savingPayment}>
                  <Icon name="check" size={16} />{savingPayment ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                {paymentMsg && <span className="small" style={{ color: paymentMsg.ok ? 'var(--green)' : 'var(--rose)' }}>{paymentMsg.text}</span>}
              </div>
            </div>
          </div>
        )}

        {tab === 'platform' && role === 'admin' && (
          <div className="col gap-18 anim-in">
            <div className="card card-pad">
              <h3 className="h4" style={{ marginBottom: 4 }}>Plateforme</h3>
              <p className="tiny muted" style={{ marginBottom: 4 }}>Ces réglages s'appliquent à tous les utilisateurs d'EduSpher.</p>
              <Switch label="Mode maintenance" desc="Bloque la connexion des étudiants et formateurs (les admins gardent l'accès)" checked={maintenance}
                onChange={(v) => { setMaintenance(v); savePlatformSetting({ maintenanceMode: v }); }} />
              <Switch label="Inscriptions ouvertes" desc="Autorise la création de nouveaux comptes" checked={openSignups}
                onChange={(v) => { setOpenSignups(v); savePlatformSetting({ openSignups: v }); }} />
              <div className="edu-list-row" style={{ marginTop: 4 }}>
                <div className="col grow"><span style={{ fontWeight: 650, fontSize: 13.5 }}>Validation des cours par un admin</span><span className="tiny muted">Toujours active : un cours ne peut être publié qu'après validation, quel que soit ce réglage.</span></div>
                <span className="badge badge-green badge-dot">Actif</span>
              </div>
              {platformMsg && <span className="small" style={{ color: platformMsg.ok ? 'var(--green)' : 'var(--rose)' }}>{platformMsg.text}</span>}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
