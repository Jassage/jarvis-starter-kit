import { Domain } from '@/lib/types';
import { CheckDot } from './StatusBadge';
import { CopyableField } from './CopyableField';

export function DnsRecordsPanel({ domain }: { domain: Domain }) {
  const records = [
    {
      type: 'MX',
      host: '@',
      value: 'mail.' + domain.nomDomaine + ' (priorité 10)',
      ok: domain.mxOk,
      note: "À remplacer par l'hôte réel de votre serveur mail (fourni par l'hébergeur POSTA).",
    },
    {
      type: 'TXT (SPF)',
      host: '@',
      value: 'v=spf1 mx ~all',
      ok: domain.spfOk,
      note: 'Autorise votre serveur MX à envoyer des emails pour ce domaine.',
    },
    {
      type: 'TXT (DKIM)',
      host: `${domain.dkimSelector}._domainkey`,
      value: domain.dkimTxtValue,
      ok: domain.dkimOk,
      note: 'Signature cryptographique des emails sortants, générée automatiquement.',
    },
    {
      type: 'TXT (DMARC)',
      host: '_dmarc',
      value: `v=DMARC1; p=quarantine; rua=mailto:postmaster@${domain.nomDomaine}`,
      ok: domain.dmarcOk,
      note: 'Politique appliquée aux emails qui échouent SPF/DKIM.',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {domain.lastError && (
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">{domain.lastError}</p>
      )}
      <div className="overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Hôte</th>
              <th className="px-4 py-2">Valeur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {records.map((r) => (
              <tr key={r.type}>
                <td className="px-4 py-3">
                  <CheckDot ok={r.ok} />
                </td>
                <td className="px-4 py-3 font-medium">{r.type}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.host}</td>
                <td className="px-4 py-3">
                  <CopyableField value={r.value} />
                  <p className="mt-1 text-xs text-neutral-400">{r.note}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {domain.lastCheckedAt && (
        <p className="text-xs text-neutral-400">
          Dernière vérification : {new Date(domain.lastCheckedAt).toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
}
