'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PlanLimits, PlanType } from '@/lib/types';

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@posta.ht';
const PLAN_ORDER: PlanType[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS'];

const FONCTIONNALITES = [
  {
    titre: 'Votre propre nom de domaine',
    description: 'Des adresses email professionnelles comme contact@votreentreprise.ht, plutôt que @gmail.com.',
  },
  {
    titre: 'DKIM, SPF et DMARC automatiques',
    description:
      'La clé de signature et les enregistrements DNS nécessaires sont générés pour vous, avec une vérification en un clic.',
  },
  {
    titre: 'Boîtes mail et alias illimités selon votre plan',
    description: "Créez des adresses pour chaque employé et des redirections (info@, support@...) en quelques secondes.",
  },
  {
    titre: 'Contrôle total, à tout moment',
    description: 'Gérez vos domaines, boîtes mail et abonnement depuis un panel simple, sans ligne de commande.',
  },
];

function contactHref(sujet: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(sujet)}`;
}

export default function LandingPage() {
  const [plans, setPlans] = useState<Record<PlanType, PlanLimits> | null>(null);

  useEffect(() => {
    api
      .get('/billing/plans')
      .then(({ data }) => setPlans(data.data.plans))
      .catch(() => setPlans(null));
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sm:px-12">
        <span className="text-lg font-semibold tracking-tight">POSTA</span>
        <Link
          href="/login"
          className="rounded border border-neutral-300 px-4 py-1.5 text-sm hover:bg-neutral-50"
        >
          Se connecter
        </Link>
      </header>

      <section className="flex flex-col items-center gap-6 px-6 py-20 text-center sm:px-12">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Votre email professionnel, sur votre propre nom de domaine
        </h1>
        <p className="max-w-xl text-neutral-600">
          POSTA vous permet de créer des adresses email personnalisées pour votre entreprise ou
          votre activité, avec la sécurité et la configuration technique gérées pour vous.
        </p>
        <a
          href={contactHref('Demande de compte POSTA')}
          className="rounded bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Nous contacter pour démarrer
        </a>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-2 sm:px-12">
        {FONCTIONNALITES.map((f) => (
          <div key={f.titre}>
            <h3 className="font-semibold">{f.titre}</h3>
            <p className="mt-1 text-sm text-neutral-600">{f.description}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-neutral-200 px-6 py-16 sm:px-12">
        <h2 className="text-center text-2xl font-semibold">Tarifs</h2>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Un plan gratuit pour commencer, sans engagement.
        </p>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans &&
            PLAN_ORDER.map((plan) => {
              const limites = plans[plan];
              return (
                <div key={plan} className="flex flex-col gap-3 rounded border border-neutral-200 p-5">
                  <p className="font-semibold">{limites.label}</p>
                  <p className="text-2xl font-semibold">
                    {limites.prixHtg === 0 ? (
                      'Gratuit'
                    ) : (
                      <>
                        {limites.prixHtg} <span className="text-sm font-normal text-neutral-500">HTG/mois</span>
                      </>
                    )}
                  </p>
                  <ul className="flex flex-1 flex-col gap-1 text-sm text-neutral-600">
                    <li>
                      {Number.isFinite(limites.maxDomaines) ? limites.maxDomaines : 'Illimité'} domaine
                      {limites.maxDomaines > 1 ? 's' : ''}
                    </li>
                    <li>
                      {Number.isFinite(limites.maxMailboxesTotal) ? limites.maxMailboxesTotal : 'Illimité'} boîtes
                      mail
                    </li>
                    <li>{limites.quotaMbParBoite} Mo par boîte</li>
                  </ul>
                  <a
                    href={contactHref(`Demande de compte POSTA — plan ${limites.label}`)}
                    className="rounded border border-neutral-300 py-2 text-center text-sm hover:bg-neutral-50"
                  >
                    Nous contacter
                  </a>
                </div>
              );
            })}
        </div>
      </section>

      <footer className="mt-auto border-t border-neutral-200 px-6 py-8 text-center text-sm text-neutral-500 sm:px-12">
        <p>
          Une question ? Écrivez-nous à{' '}
          <a href={contactHref('Question sur POSTA')} className="underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
        </p>
      </footer>
    </main>
  );
}
