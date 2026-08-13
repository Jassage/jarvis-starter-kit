'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, HelpCircle } from 'lucide-react';
import { faqApi } from '@/lib/api';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const CATEGORIES = ['TOURISME', 'SERVICES', 'INVESTISSEMENT', 'DEMARCHES', 'FONCTIONNEMENT_SITE'] as const;
const CATEGORIE_LABELS: Record<string, string> = {
  TOURISME: 'Tourisme',
  SERVICES: 'Services',
  INVESTISSEMENT: 'Investissements',
  DEMARCHES: 'Démarches administratives',
  FONCTIONNEMENT_SITE: 'Fonctionnement du site',
};

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;
const STATUT_LABELS: Record<string, string> = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' };
const STATUT_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { BROUILLON: 'neutral', PUBLIE: 'success', ARCHIVE: 'warning' };

interface Traduction {
  id: string;
  locale: 'FR' | 'HT';
  question: string;
  reponse: string;
}

interface Faq {
  id: string;
  categorie: string;
  statutPublication: string;
  ordre: number;
  traductions: Traduction[];
}

function traduction(faq: Faq, locale: 'FR' | 'HT') {
  return faq.traductions.find((t) => t.locale === locale);
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);

  const [categorie, setCategorie] = useState<string>(CATEGORIES[0]);
  const [statutPublication, setStatutPublication] = useState<string>('BROUILLON');
  const [ordre, setOrdre] = useState(0);
  const [questionFr, setQuestionFr] = useState('');
  const [reponseFr, setReponseFr] = useState('');
  const [questionHt, setQuestionHt] = useState('');
  const [reponseHt, setReponseHt] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await faqApi.listAdmin();
      setFaqs(data.data.faqs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  function ouvrirCreation() {
    setEditing(null);
    setCategorie(CATEGORIES[0]);
    setStatutPublication('BROUILLON');
    setOrdre(faqs.length);
    setQuestionFr('');
    setReponseFr('');
    setQuestionHt('');
    setReponseHt('');
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(faq: Faq) {
    setEditing(faq);
    setCategorie(faq.categorie);
    setStatutPublication(faq.statutPublication);
    setOrdre(faq.ordre);
    setQuestionFr(traduction(faq, 'FR')?.question ?? '');
    setReponseFr(traduction(faq, 'FR')?.reponse ?? '');
    setQuestionHt(traduction(faq, 'HT')?.question ?? '');
    setReponseHt(traduction(faq, 'HT')?.reponse ?? '');
    setErreur(null);
    setModalOpen(true);
  }

  async function enregistrer() {
    setErreur(null);
    if (!questionFr.trim() || !reponseFr.trim()) {
      setErreur('Question et réponse en français requises.');
      return;
    }
    setEnregistrement(true);
    try {
      const traductions = [
        { locale: 'FR', question: questionFr, reponse: reponseFr },
        ...(questionHt.trim() && reponseHt.trim() ? [{ locale: 'HT', question: questionHt, reponse: reponseHt }] : []),
      ];
      const payload = { categorie, statutPublication, ordre, traductions };
      if (editing) {
        await faqApi.update(editing.id, payload);
      } else {
        await faqApi.create(payload);
      }
      setModalOpen(false);
      await charger();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Une erreur est survenue.';
      setErreur(message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimer(faq: Faq) {
    if (!confirm('Supprimer cette question ?')) return;
    await faqApi.remove(faq.id);
    await charger();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>FAQ</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
        Questions fréquentes affichées sur la page publique /faq, par catégorie.
      </p>

      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <PageToolbar actionLabel="Nouvelle question" onAction={ouvrirCreation} />
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : faqs.length === 0 ? (
          <EmptyState icon={HelpCircle} title="Aucune question" hint="Créez la première question" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Question (FR)</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>Ordre</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id}>
                    <td className="font-semibold max-w-xs truncate">{traduction(faq, 'FR')?.question ?? '—'}</td>
                    <td>{CATEGORIE_LABELS[faq.categorie]}</td>
                    <td><Badge tone={STATUT_TONE[faq.statutPublication]}>{STATUT_LABELS[faq.statutPublication]}</Badge></td>
                    <td>{faq.ordre}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => ouvrirEdition(faq)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => supprimer(faq)} className="btn" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la question' : 'Nouvelle question'} maxWidth={680}>
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
              <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Statut</label>
              <select className="input" value={statutPublication} onChange={(e) => setStatutPublication(e.target.value)}>
                {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Ordre</label>
              <input type="number" className="input" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Français</p>
              <input className="input mb-2" placeholder="Question" value={questionFr} onChange={(e) => setQuestionFr(e.target.value)} />
              <textarea className="input" rows={4} placeholder="Réponse" value={reponseFr} onChange={(e) => setReponseFr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary-2)' }}>Kreyòl</p>
              <input className="input mb-2" placeholder="Kesyon" value={questionHt} onChange={(e) => setQuestionHt(e.target.value)} />
              <textarea className="input" rows={4} placeholder="Repons" value={reponseHt} onChange={(e) => setReponseHt(e.target.value)} />
            </div>
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={enregistrer} disabled={enregistrement}>
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
