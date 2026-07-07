import { promises as dns } from 'dns';

export interface DnsCheckResult {
  mxOk: boolean;
  spfOk: boolean;
  dkimOk: boolean;
  dmarcOk: boolean;
  lastError: string | null;
}

async function resolveTxtFlat(hostname: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(hostname);
    return records.map((parts) => parts.join(''));
  } catch {
    return [];
  }
}

export async function checkDomainDns(
  nomDomaine: string,
  dkimSelector: string,
  dkimPublicKey: string
): Promise<DnsCheckResult> {
  const missing: string[] = [];

  let mxOk = false;
  try {
    mxOk = (await dns.resolveMx(nomDomaine)).length > 0;
  } catch {
    mxOk = false;
  }
  if (!mxOk) missing.push('MX');

  const txtRecords = await resolveTxtFlat(nomDomaine);
  const spfOk = txtRecords.some((r) => r.startsWith('v=spf1'));
  if (!spfOk) missing.push('SPF');

  const dkimRecords = await resolveTxtFlat(`${dkimSelector}._domainkey.${nomDomaine}`);
  const dkimOk = dkimRecords.some((r) => r.includes('v=DKIM1') && r.includes(dkimPublicKey));
  if (!dkimOk) missing.push('DKIM');

  const dmarcRecords = await resolveTxtFlat(`_dmarc.${nomDomaine}`);
  const dmarcOk = dmarcRecords.some((r) => r.startsWith('v=DMARC1'));
  if (!dmarcOk) missing.push('DMARC');

  return {
    mxOk,
    spfOk,
    dkimOk,
    dmarcOk,
    lastError: missing.length > 0 ? `Enregistrements manquants ou invalides : ${missing.join(', ')}` : null,
  };
}
