import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Settings, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Field, Input, Select, Textarea } from '../components/ui/Field';
import { useAuth } from '../contexts/AuthContext';
import { useParametres } from '../contexts/ParametresContext';
import { enregistrerParametres } from '../services/parametres.service';
import { formatDate } from '../lib/format';

const DEVISES = ['HTG', 'USD', 'EUR', 'CAD'];

export function Parametres() {
  const { profil } = useAuth();
  const parametres = useParametres();
  const [nomAssociation, setNomAssociation] = useState(parametres.nomAssociation);
  const [montantCotisation, setMontantCotisation] = useState(parametres.montantCotisation);
  const [devise, setDevise] = useState(parametres.devise);
  const [indicatifPays, setIndicatifPays] = useState(parametres.indicatifPays);
  const [modeleRelance, setModeleRelance] = useState(parametres.modeleRelance);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistre, setEnregistre] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  // Initialisation unique : resynchroniser le formulaire à chaque changement de
  // `parametres` écraserait la saisie en cours dès que l'enregistrement remonte
  // par l'écoute temps réel.
  const initialise = useRef(false);
  useEffect(() => {
    if (initialise.current || !parametres.majLe) return;
    initialise.current = true;
    setNomAssociation(parametres.nomAssociation);
    setMontantCotisation(parametres.montantCotisation);
    setDevise(parametres.devise);
    setIndicatifPays(parametres.indicatifPays);
    setModeleRelance(parametres.modeleRelance);
  }, [parametres]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnregistre(false);
    if (!nomAssociation.trim()) {
      setErreur("Le nom de l'association est obligatoire.");
      return;
    }
    if (montantCotisation <= 0) {
      setErreur('Le montant de la cotisation doit être supérieur à zéro.');
      return;
    }
    if (!/^\d{1,4}$/.test(indicatifPays)) {
      setErreur("L'indicatif pays doit être composé de 1 à 4 chiffres, sans le « + ».");
      return;
    }
    if (!modeleRelance.trim()) {
      setErreur('Le modèle de message de relance ne peut pas être vide.');
      return;
    }
    if (!profil) return;
    setEnvoi(true);
    try {
      await enregistrerParametres(
        {
          nomAssociation: nomAssociation.trim(),
          montantCotisation,
          devise,
          indicatifPays,
          modeleRelance: modeleRelance.trim(),
        },
        profil.id
      );
      setEnregistre(true);
    } catch {
      setErreur("Enregistrement refusé. Seul le responsable finances peut modifier les paramètres.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Settings size={18} className="text-[var(--color-brand)]" />
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Paramètres de l'association</h2>
        </div>

        {erreur && (
          <p className="mb-4 rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {erreur}
          </p>
        )}
        {enregistre && (
          <p className="mb-4 flex items-center gap-1.5 rounded-lg bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
            <Check size={14} /> Paramètres enregistrés.
          </p>
        )}

        <form onSubmit={onSubmit}>
          <Field label="Nom de l'association" required>
            <Input required value={nomAssociation} onChange={(e) => setNomAssociation(e.target.value)} />
          </Field>
          <Field label="Cotisation mensuelle attendue" required>
            <Input
              type="number"
              min={1}
              step="1"
              required
              value={montantCotisation}
              onChange={(e) => setMontantCotisation(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Montant en dessous duquel un membre est considéré en retard, et au-dessus duquel le
              surplus est comptabilisé.
            </p>
          </Field>
          <Field label="Devise" required>
            <Select value={devise} onChange={(e) => setDevise(e.target.value)}>
              {DEVISES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Indicatif pays des numéros de téléphone" required>
            <Input
              required
              value={indicatifPays}
              onChange={(e) => setIndicatifPays(e.target.value.replace(/\D/g, ''))}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Sans le « + ». Ajouté automatiquement aux numéros saisis au format local pour ouvrir
              WhatsApp (509 pour Haïti).
            </p>
          </Field>
          <Field label="Message de relance" required>
            <Textarea rows={4} required value={modeleRelance} onChange={(e) => setModeleRelance(e.target.value)} />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Variables disponibles : {'{nom}'}, {'{mois}'}, {'{montant}'}, {'{association}'}.
            </p>
          </Field>
          <button
            type="submit"
            disabled={envoi}
            className="w-full rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
          >
            {envoi ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        {parametres.majLe && (
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Dernière modification le {formatDate(parametres.majLe)}.
          </p>
        )}
      </Card>
    </div>
  );
}
