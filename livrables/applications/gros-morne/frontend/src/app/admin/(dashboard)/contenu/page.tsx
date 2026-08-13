'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { contenuApi } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

interface Traduction {
  id: string;
  locale: 'FR' | 'HT';
  titre: string | null;
  contenu: string;
}

interface PageSection {
  id: string;
  page: string;
  cle: string;
  ordre: number;
  traductions: Traduction[];
}

function traduction(section: PageSection, locale: 'FR' | 'HT') {
  return section.traductions.find((t) => t.locale === locale);
}

const PAGE_PRESETS = ['accueil', 'a-propos', 'faq', 'mentions-legales', 'confidentialite', 'conditions-utilisation'];

export default function ContenuPage() {
  const [page, setPage] = useState('accueil');
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PageSection | null>(null);

  const [cle, setCle] = useState('');
  const [ordre, setOrdre] = useState(0);
  const [titreFr, setTitreFr] = useState('');
  const [contenuFr, setContenuFr] = useState('');
  const [titreHt, setTitreHt] = useState('');
  const [contenuHt, setContenuHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contenuApi.list(page);
      setSections(data.data.sections);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    charger();
  }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setCle('');
    setOrdre(sections.length);
    setTitreFr('');
    setContenuFr('');
    setTitreHt('');
    setContenuHt('');
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(section: PageSection) {
    setEditing(section);
    setCle(section.cle);
    setOrdre(section.ordre);
    setTitreFr(traduction(section, 'FR')?.titre ?? '');
    setContenuFr(traduction(section, 'FR')?.contenu ?? '');
    setTitreHt(traduction(section, 'HT')?.titre ?? '');
    setContenuHt(traduction(section, 'HT')?.contenu ?? '');
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!contenuFr.trim() || !contenuHt.trim()) {
      setErreur('Le contenu est requis en français et en kreyòl.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', titre: titreFr || undefined, contenu: contenuFr },
        { locale: 'HT', titre: titreHt || undefined, contenu: contenuHt },
      ];
      if (editing) {
        await contenuApi.update(editing.id, { ordre, traductions });
      } else {
        await contenuApi.create({ page, cle, ordre, traductions });
      }
      setModalOpen(false);
      await charger();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Une erreur est survenue.';
      setErreur(message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimer(section: PageSection) {
    if (!confirm(`Supprimer le bloc "${section.cle}" ?`)) return;
    await contenuApi.remove(section.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Contenu</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Blocs de texte administrables du site, en français et en kreyòl.
      </p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {PAGE_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className="btn"
            style={{
              background: p === page ? 'var(--color-primary-soft)' : 'var(--color-surface-2)',
              color: p === page ? 'var(--color-primary-2)' : 'var(--color-ink-2)',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouveau bloc" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : sections.length === 0 ? (
          <EmptyState icon={FileText} title="Aucun bloc de contenu" hint={`Créez le premier bloc pour la page "${page}"`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Clé</th>
                  <th>Ordre</th>
                  <th>Français</th>
                  <th>Kreyòl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td className="font-semibold">{section.cle}</td>
                    <td>{section.ordre}</td>
                    <td>
                      {traduction(section, 'FR') ? (
                        <Badge tone="success">Renseigné</Badge>
                      ) : (
                        <Badge tone="warning">Manquant</Badge>
                      )}
                    </td>
                    <td>
                      {traduction(section, 'HT') ? (
                        <Badge tone="success">Renseigné</Badge>
                      ) : (
                        <Badge tone="warning">Manquant</Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(section)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => supprimer(section)}
                          className="btn"
                          style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le bloc' : 'Nouveau bloc'} maxWidth={640}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Clé</label>
            <input className="input" value={cle} onChange={(e) => setCle(e.target.value)} disabled={!!editing} placeholder="ex: hero, slogan, chiffres-cles" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
            <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <input className="input mb-2" placeholder="Titre (optionnel)" value={titreFr} onChange={(e) => setTitreFr(e.target.value)} />
              <textarea className="input" rows={5} placeholder="Contenu" value={contenuFr} onChange={(e) => setContenuFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <input className="input mb-2" placeholder="Titre (optyonèl)" value={titreHt} onChange={(e) => setTitreHt(e.target.value)} />
              <textarea className="input" rows={5} placeholder="Kontni" value={contenuHt} onChange={(e) => setContenuHt(e.target.value)} />
            </div>
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement || !cle}>
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
