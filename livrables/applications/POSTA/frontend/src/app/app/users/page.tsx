'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, apiErrorMessage } from '@/lib/api';
import { ClientUser } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

export default function UtilisateursPage() {
  const router = useRouter();
  const { utilisateur, chargement: chargementAuth } = useAuthStore();

  const [utilisateurs, setUtilisateurs] = useState<ClientUser[] | null>(null);
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);

  useEffect(() => {
    if (!chargementAuth && utilisateur && utilisateur.role !== 'SUPER_ADMIN') {
      router.replace('/app');
    }
  }, [chargementAuth, utilisateur, router]);

  async function charger() {
    const { data } = await api.get('/users');
    setUtilisateurs(data.data.utilisateurs);
  }

  useEffect(() => {
    if (utilisateur?.role === 'SUPER_ADMIN') charger();
  }, [utilisateur]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
    setCreation(true);
    try {
      const { data } = await api.post('/users', { email, nom, prenom });
      setEmail('');
      setNom('');
      setPrenom('');
      setSucces(data.message);
      await charger();
    } catch (err) {
      setErreur(apiErrorMessage(err, 'Impossible de créer le compte'));
    } finally {
      setCreation(false);
    }
  }

  async function toggleActif(u: ClientUser) {
    if (u.actif && !confirm(`Désactiver le compte de ${u.prenom} ${u.nom} ? Ses sessions actives seront révoquées immédiatement.`)) {
      return;
    }
    await api.patch(`/users/${u.id}/actif`, { actif: !u.actif });
    await charger();
  }

  if (chargementAuth || utilisateur?.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Utilisateurs</h1>
        <p className="text-sm text-neutral-500">
          Créez un compte pour un client afin qu&apos;il puisse gérer ses propres domaines. Un
          email d&apos;invitation lui permettra de choisir lui-même son mot de passe.
        </p>
      </div>

      <form onSubmit={onCreate} className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="col-span-2 rounded border border-neutral-300 px-3 py-2 text-sm"
          required
        />
        <div className="col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={creation}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {creation ? 'Création...' : 'Créer le compte client'}
          </button>
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          {succes && <p className="text-sm text-green-700">{succes}</p>}
        </div>
      </form>

      <div className="overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Domaines</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {utilisateurs?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  Aucun compte client pour l&apos;instant.
                </td>
              </tr>
            )}
            {utilisateurs?.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">
                  {u.prenom} {u.nom}
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u._count.domaines}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.actif ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {u.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActif(u)}
                    className="text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
                  >
                    {u.actif ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
