const STYLES: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-100 text-amber-800',
  VERIFIE: 'bg-green-100 text-green-800',
  ECHEC: 'bg-red-100 text-red-800',
  SUSPENDU: 'bg-neutral-200 text-neutral-600',
};

const LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  VERIFIE: 'Vérifié',
  ECHEC: 'Échec',
  SUSPENDU: 'Suspendu',
};

export function StatusBadge({ statut }: { statut: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[statut] || 'bg-neutral-100 text-neutral-600'}`}
    >
      {LABELS[statut] || statut}
    </span>
  );
}

export function CheckDot({ ok }: { ok: boolean }) {
  return (
    <span
      title={ok ? 'OK' : 'Manquant'}
      className={`inline-flex h-2.5 w-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-neutral-300'}`}
    />
  );
}
