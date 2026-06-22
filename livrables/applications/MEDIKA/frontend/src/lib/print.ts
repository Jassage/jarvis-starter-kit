import type { Consultation, Facture, Examen } from '@/types'
import { EXAM_SCHEMAS } from './exam-schemas'
import api from './api'

interface HopitalConfig { nom: string; adresse?: string | null; telephone?: string | null; email?: string | null }

let _configCache: HopitalConfig | null = null

async function getConfig(): Promise<HopitalConfig> {
  if (_configCache) return _configCache
  try {
    const r = await api.get('/settings/hopital')
    _configCache = r.data.data
    return _configCache!
  } catch {
    return { nom: 'CLINIQUE MEDIKA', adresse: 'Haïti' }
  }
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function openPrintWindow(html: string, title: string) {
  const win = window.open('', '_blank', 'width=860,height=700')
  if (!win) return
  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: white;
      padding: 48px;
      max-width: 760px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .doc-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e293b;
      margin-bottom: 24px;
    }
    .doc-header h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .doc-header p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .doc-type {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #64748b;
      text-align: right;
    }
    .doc-type .numero { font-size: 20px; font-weight: 800; color: #0f172a; display: block; letter-spacing: 0; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .info-box .label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .info-box .value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .info-box .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    section { margin-bottom: 20px; }
    section .sec-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    section p, section pre { font-size: 13px; color: #1e293b; line-height: 1.7; }
    section pre { white-space: pre-wrap; font-family: inherit; }
    .vital-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .vital-item {
      text-align: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
    }
    .vital-item .v-val { font-size: 18px; font-weight: 700; color: #0f172a; }
    .vital-item .v-label { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    thead tr { background: #f1f5f9; }
    th { padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #64748b; }
    td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row td { font-weight: 700; font-size: 14px; border-top: 2px solid #1e293b; padding-top: 12px; }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
    }
    .badge-ok    { background: #dcfce7; color: #166534; }
    .badge-low   { background: #dbeafe; color: #1e40af; }
    .badge-high  { background: #fee2e2; color: #991b1b; }
    .badge-warn  { background: #fef3c7; color: #92400e; }
    .sig-line {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
    }
    .sig-box { border-top: 1px solid #1e293b; width: 200px; padding-top: 6px; text-align: center; }
    .sig-box p { font-size: 11px; color: #64748b; }
    .doc-footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    .payments-section { margin-top: 14px; }
    .pay-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px dashed #e2e8f0; }
    .solde-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .solde-box.unpaid { background: #fff7ed; border-color: #fed7aa; }
    .solde-box .s-label { font-size: 11px; color: #64748b; }
    .solde-box .s-val { font-size: 18px; font-weight: 800; color: #0f172a; }
    @media print {
      body { padding: 20px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>${html}
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
</script>
</body>
</html>`)
  win.document.close()
}

// ─── Ordonnance ───────────────────────────────────────────────────────────────

export async function printOrdonnance(consultation: Consultation) {
  const cfg = await getConfig()
  const HOSPITAL_NAME    = cfg.nom
  const HOSPITAL_ADDRESS = [cfg.adresse, cfg.telephone].filter(Boolean).join(' · ') || 'Haïti'
  const sv = consultation.signesVitaux as { tension?: string; temperature?: number; poids?: number } | undefined
  const hasVitaux = sv && (sv.tension || sv.temperature != null || sv.poids != null)

  const vitauxHtml = hasVitaux ? `
    <section>
      <div class="sec-title">Signes vitaux</div>
      <div class="vital-grid">
        ${sv?.tension ? `<div class="vital-item"><div class="v-val">${sv.tension}</div><div class="v-label">Tension (mmHg)</div></div>` : ''}
        ${sv?.temperature != null ? `<div class="vital-item"><div class="v-val">${sv.temperature}°C</div><div class="v-label">Température</div></div>` : ''}
        ${sv?.poids != null ? `<div class="vital-item"><div class="v-val">${sv.poids} kg</div><div class="v-label">Poids</div></div>` : ''}
      </div>
    </section>` : ''

  const plaintHtml = consultation.plainte ? `
    <section>
      <div class="sec-title">Motif de consultation</div>
      <p>${consultation.plainte}</p>
    </section>` : ''

  const diagHtml = consultation.diagnostic ? `
    <section>
      <div class="sec-title">Diagnostic</div>
      <p>${consultation.diagnostic}</p>
    </section>` : ''

  const notesHtml = consultation.notes ? `
    <section>
      <div class="sec-title">Notes cliniques</div>
      <p>${consultation.notes}</p>
    </section>` : ''

  const prescHtml = consultation.prescriptions ? `
    <section>
      <div class="sec-title">Ordonnance médicale</div>
      <pre>${consultation.prescriptions}</pre>
    </section>` : '<section><div class="sec-title">Ordonnance médicale</div><p style="color:#94a3b8;font-style:italic">Aucune prescription.</p></section>'

  const rdvHtml = consultation.prochainRdv ? `
    <section>
      <div class="sec-title">Prochain rendez-vous</div>
      <p>${fmt(consultation.prochainRdv)}</p>
    </section>` : ''

  const html = `
    <div class="doc-header">
      <div>
        <h1>${HOSPITAL_NAME}</h1>
        <p>${HOSPITAL_ADDRESS}</p>
      </div>
      <div class="doc-type">Compte-rendu médical<span class="numero">ORDONNANCE</span></div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="label">Patient</div>
        <div class="value">${consultation.patient.prenom} ${consultation.patient.nom}</div>
        <div class="sub">Dossier N° ${consultation.patient.numero}</div>
      </div>
      <div class="info-box">
        <div class="label">Médecin traitant</div>
        <div class="value">Dr. ${consultation.medecin.prenom} ${consultation.medecin.nom}</div>
        <div class="sub">Date : ${fmt(consultation.date)}</div>
      </div>
    </div>

    ${plaintHtml}
    ${vitauxHtml}
    ${diagHtml}
    ${notesHtml}
    ${prescHtml}
    ${rdvHtml}

    <div class="sig-line">
      <div class="sig-box">
        <p>Signature & Cachet du médecin</p>
      </div>
    </div>

    <div class="doc-footer">
      <span>${HOSPITAL_NAME} — ${HOSPITAL_ADDRESS}</span>
      <span>Imprimé le ${new Date().toLocaleDateString('fr-FR')}</span>
    </div>`

  openPrintWindow(html, `Ordonnance — ${consultation.patient.prenom} ${consultation.patient.nom}`)
}

// ─── Facture ──────────────────────────────────────────────────────────────────

export async function printFacture(facture: Facture) {
  const cfg = await getConfig()
  const HOSPITAL_NAME    = cfg.nom
  const HOSPITAL_ADDRESS = [cfg.adresse, cfg.telephone].filter(Boolean).join(' · ') || 'Haïti'
  const METHODE_LABELS: Record<string, string> = {
    CASH: 'Espèces', CARTE: 'Carte', MONCASH: 'MonCash', ASSURANCE: 'Assurance'
  }
  const STATUT_LABELS: Record<string, string> = {
    EN_ATTENTE: 'Non payée', PARTIELLEMENT_PAYE: 'Partiellement payée', PAYE: 'Payée intégralement', ANNULE: 'Annulée'
  }

  const lignesHtml = facture.lignes.map(l => `
    <tr>
      <td>${l.description}</td>
      <td class="text-center">${l.quantite}</td>
      <td class="text-right">${l.prixUnitaire.toLocaleString('fr-FR')} HTG</td>
      <td class="text-right">${l.montant.toLocaleString('fr-FR')} HTG</td>
    </tr>`).join('')

  const paiementsHtml = facture.paiements?.length
    ? facture.paiements.map(p => `
      <div class="pay-row">
        <span>${METHODE_LABELS[p.methode] ?? p.methode} — ${fmt(p.date)}</span>
        <span style="font-weight:600">${p.montant.toLocaleString('fr-FR')} HTG</span>
      </div>`).join('')
    : '<p style="color:#94a3b8;font-size:12px;font-style:italic">Aucun paiement enregistré.</p>'

  const restant = facture.montantTotal - facture.montantPaye
  const isPaid = facture.statut === 'PAYE'

  const html = `
    <div class="doc-header">
      <div>
        <h1>${HOSPITAL_NAME}</h1>
        <p>${HOSPITAL_ADDRESS}</p>
      </div>
      <div class="doc-type">Facturation<span class="numero">${facture.numero}</span></div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="label">Patient</div>
        <div class="value">${facture.patient.prenom} ${facture.patient.nom}</div>
        <div class="sub">Dossier N° ${facture.patient.numero}</div>
      </div>
      <div class="info-box">
        <div class="label">Statut de la facture</div>
        <div class="value">${STATUT_LABELS[facture.statut] ?? facture.statut}</div>
        <div class="sub">Émise le ${fmt(facture.createdAt)}</div>
      </div>
    </div>

    <section>
      <div class="sec-title">Détail des prestations</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Qté</th>
            <th class="text-right">Prix unitaire</th>
            <th class="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${lignesHtml}
          <tr class="total-row">
            <td colspan="3">TOTAL</td>
            <td class="text-right">${facture.montantTotal.toLocaleString('fr-FR')} HTG</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <div class="sec-title">Historique des paiements</div>
      <div class="payments-section">${paiementsHtml}</div>
      <div class="solde-box ${isPaid ? '' : 'unpaid'}">
        <div>
          <div class="s-label">${isPaid ? 'Montant total réglé' : 'Solde restant à payer'}</div>
        </div>
        <div class="s-val">${isPaid ? facture.montantTotal.toLocaleString('fr-FR') : restant.toLocaleString('fr-FR')} HTG</div>
      </div>
    </section>

    <div class="doc-footer">
      <span>${HOSPITAL_NAME} — ${HOSPITAL_ADDRESS}</span>
      <span>Imprimé le ${new Date().toLocaleDateString('fr-FR')}</span>
    </div>`

  openPrintWindow(html, `Facture ${facture.numero} — ${facture.patient.prenom} ${facture.patient.nom}`)
}

// ─── Rapport journalier ───────────────────────────────────────────────────────

interface RapportData {
  date: string
  dateFin?: string
  hopital: { nom: string; adresse?: string | null; telephone?: string | null } | null
  appointments: Array<{ dateHeure: string; statut: string; motif?: string | null; patient: { prenom: string; nom: string; numero: string }; medecin: { prenom: string; nom: string }; service: { nom: string } }>
  consultations: Array<{ date: string; diagnostic?: string | null; patient: { prenom: string; nom: string; numero: string }; medecin: { prenom: string; nom: string } }>
  examens: Array<{ type: string; statut: string; patient: { prenom: string; nom: string }; medecin: { prenom: string; nom: string } }>
  facturesJour: Array<{ numero: string; statut: string; montantTotal: number; montantPaye: number; patient: { prenom: string; nom: string } }>
  recettesJour: number
  impayesTotal: number
}

const APPT_STATUT: Record<string, string> = {
  PLANIFIE: 'Planifié', EN_ATTENTE: 'En attente', EN_CONSULTATION: 'En cours',
  TERMINE: 'Terminé', ANNULE: 'Annulé',
}
const FACT_STATUT: Record<string, string> = {
  EN_ATTENTE: 'Non payée', PARTIELLEMENT_PAYE: 'Partielle', PAYE: 'Payée', ANNULE: 'Annulée',
}

export function printRapport(data: RapportData) {
  const nom     = data.hopital?.nom || 'CLINIQUE MEDIKA'
  const adresse = [data.hopital?.adresse, data.hopital?.telephone].filter(Boolean).join(' · ') || 'Haïti'
  const now     = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const fmtD    = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const isSingleDay = !data.dateFin || data.date.slice(0, 10) === data.dateFin.slice(0, 10)
  const dateStr = isSingleDay
    ? new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : `Du ${fmtD(data.date)} au ${fmtD(data.dateFin!)}`

  function fmtTime(d: string) {
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const apptRows = data.appointments.map(a => `
    <tr>
      <td>${fmtTime(a.dateHeure)}</td>
      <td><strong>${a.patient.prenom} ${a.patient.nom}</strong><br><span style="font-size:10px;color:#94a3b8">${a.patient.numero}</span></td>
      <td>Dr. ${a.medecin.prenom} ${a.medecin.nom}</td>
      <td>${a.service.nom}</td>
      <td>${a.motif || '—'}</td>
      <td><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#f1f5f9;color:#475569">${APPT_STATUT[a.statut] || a.statut}</span></td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#94a3b8;font-style:italic">Aucun rendez-vous</td></tr>'

  const consultRows = data.consultations.map(c => `
    <tr>
      <td>${fmtTime(c.date)}</td>
      <td><strong>${c.patient.prenom} ${c.patient.nom}</strong><br><span style="font-size:10px;color:#94a3b8">${c.patient.numero}</span></td>
      <td>Dr. ${c.medecin.prenom} ${c.medecin.nom}</td>
      <td>${c.diagnostic || '<span style="color:#94a3b8;font-style:italic">Non renseigné</span>'}</td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic">Aucune consultation</td></tr>'

  const examRows = data.examens.map(e => `
    <tr>
      <td><strong>${e.patient.prenom} ${e.patient.nom}</strong></td>
      <td>${e.type}</td>
      <td>Dr. ${e.medecin.prenom} ${e.medecin.nom}</td>
      <td><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#f1f5f9;color:#475569">${e.statut.replace(/_/g, ' ')}</span></td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic">Aucun examen</td></tr>'

  const factRows = data.facturesJour.map(f => `
    <tr>
      <td><strong>${f.numero}</strong></td>
      <td>${f.patient.prenom} ${f.patient.nom}</td>
      <td class="text-right">${f.montantTotal.toLocaleString('fr-FR')} HTG</td>
      <td class="text-right">${f.montantPaye.toLocaleString('fr-FR')} HTG</td>
      <td><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${f.statut === 'PAYE' ? '#dcfce7' : '#fff7ed'};color:${f.statut === 'PAYE' ? '#166534' : '#9a3412'}">${FACT_STATUT[f.statut] || f.statut}</span></td>
    </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;font-style:italic">Aucune facture</td></tr>'

  const html = `
    <div class="doc-header">
      <div>
        <h1>${nom}</h1>
        <p>${adresse}</p>
      </div>
      <div class="doc-type">Rapport journalier<span class="numero" style="font-size:14px;letter-spacing:0">${dateStr}</span></div>
    </div>

    <!-- KPIs -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
      ${[
        { label: 'Rendez-vous',   value: data.appointments.length,  color: '#7c3aed' },
        { label: 'Consultations', value: data.consultations.length, color: '#0f766e' },
        { label: 'Examens',       value: data.examens.length,       color: '#0369a1' },
        { label: 'Recettes',      value: data.recettesJour.toLocaleString('fr-FR') + ' HTG', color: '#15803d' },
      ].map(k => `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;text-align:center">
          <p style="font-size:20px;font-weight:800;color:${k.color}">${k.value}</p>
          <p style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:2px">${k.label}</p>
        </div>`).join('')}
    </div>

    <section>
      <div class="sec-title">Rendez-vous du jour (${data.appointments.length})</div>
      <table>
        <thead><tr><th>Heure</th><th>Patient</th><th>Médecin</th><th>Service</th><th>Motif</th><th>Statut</th></tr></thead>
        <tbody>${apptRows}</tbody>
      </table>
    </section>

    <section>
      <div class="sec-title">Consultations du jour (${data.consultations.length})</div>
      <table>
        <thead><tr><th>Heure</th><th>Patient</th><th>Médecin</th><th>Diagnostic</th></tr></thead>
        <tbody>${consultRows}</tbody>
      </table>
    </section>

    <section>
      <div class="sec-title">Examens prescrits aujourd'hui (${data.examens.length})</div>
      <table>
        <thead><tr><th>Patient</th><th>Type d'examen</th><th>Prescrit par</th><th>Statut</th></tr></thead>
        <tbody>${examRows}</tbody>
      </table>
    </section>

    <section>
      <div class="sec-title">Facturation du jour (${data.facturesJour.length})</div>
      <table>
        <thead><tr><th>N° Facture</th><th>Patient</th><th class="text-right">Total</th><th class="text-right">Payé</th><th>Statut</th></tr></thead>
        <tbody>${factRows}</tbody>
      </table>
      <div style="display:flex;justify-content:space-between;margin-top:14px;gap:12px">
        <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px">
          <p style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px">Recettes du jour</p>
          <p style="font-size:20px;font-weight:800;color:#15803d;margin-top:4px">${data.recettesJour.toLocaleString('fr-FR')} HTG</p>
        </div>
        <div style="flex:1;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px">
          <p style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px">Impayés cumulés</p>
          <p style="font-size:20px;font-weight:800;color:#c2410c;margin-top:4px">${data.impayesTotal.toLocaleString('fr-FR')} HTG</p>
        </div>
      </div>
    </section>

    <div class="doc-footer">
      <span>${nom} — Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${now}</span>
      <span>Document confidentiel</span>
    </div>`

  openPrintWindow(html, `Rapport journalier — ${dateStr}`)
}

// ─── Résultat d'examen ────────────────────────────────────────────────────────

export async function printExamen(examen: Examen) {
  const cfg = await getConfig()
  const HOSPITAL_NAME    = cfg.nom
  const HOSPITAL_ADDRESS = [cfg.adresse, cfg.telephone].filter(Boolean).join(' · ') || 'Haïti'
  const schema = EXAM_SCHEMAS[examen.type]
  const rs = examen.resultatStructure as Record<string, string> | undefined

  let resultHtml = ''

  if (rs && schema) {
    const rows = schema.fields.map(field => {
      const val = rs[field.key] ?? ''
      if (!val) return ''
      const num = parseFloat(val)
      let flag = ''
      let badgeClass = 'badge-ok'
      if (field.type === 'number' && !isNaN(num)) {
        if (field.normalMin !== undefined && num < field.normalMin) { flag = '↓ Bas'; badgeClass = 'badge-low' }
        if (field.normalMax !== undefined && num > field.normalMax) { flag = '↑ Élevé'; badgeClass = 'badge-high' }
      }
      const display = field.unit ? `${val} ${field.unit}` : val
      return `<tr>
        <td><strong>${field.label}</strong></td>
        <td class="text-center" style="font-weight:600">${display}</td>
        <td class="text-center">${field.normalRange ?? '—'}</td>
        <td class="text-center">${flag ? `<span class="badge ${badgeClass}">${flag}</span>` : '<span class="badge badge-ok">Normal</span>'}</td>
      </tr>`
    }).filter(Boolean).join('')

    resultHtml = rows ? `
      <table>
        <thead>
          <tr>
            <th>Paramètre</th>
            <th class="text-center">Résultat</th>
            <th class="text-center">Valeurs normales</th>
            <th class="text-center">Statut</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>` : '<p style="color:#94a3b8;font-style:italic">Aucune valeur saisie.</p>'
  } else if (rs?._texte) {
    resultHtml = `<pre>${rs._texte}</pre>`
  } else if (examen.resultat) {
    resultHtml = `<pre>${examen.resultat}</pre>`
  } else {
    resultHtml = '<p style="color:#94a3b8;font-style:italic">Aucun résultat disponible.</p>'
  }

  const instrHtml = examen.description ? `
    <section>
      <div class="sec-title">Instructions du médecin</div>
      <p>${examen.description}</p>
    </section>` : ''

  const html = `
    <div class="doc-header">
      <div>
        <h1>${HOSPITAL_NAME}</h1>
        <p>${HOSPITAL_ADDRESS}</p>
      </div>
      <div class="doc-type">Laboratoire / Imagerie<span class="numero">RÉSULTATS</span></div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="label">Patient</div>
        <div class="value">${examen.patient.prenom} ${examen.patient.nom}</div>
        <div class="sub">Dossier N° ${examen.patient.numero}</div>
      </div>
      <div class="info-box">
        <div class="label">Examen prescrit par</div>
        <div class="value">Dr. ${examen.medecin.prenom} ${examen.medecin.nom}</div>
        <div class="sub">Prescrit le ${fmt(examen.createdAt)}</div>
      </div>
    </div>

    <section>
      <div class="sec-title">Type d'examen</div>
      <p style="font-size:16px;font-weight:700;color:#0f172a">${examen.type}</p>
      ${examen.dateResultat ? `<p style="font-size:11px;color:#64748b;margin-top:4px">Résultat disponible le ${fmt(examen.dateResultat)}</p>` : ''}
    </section>

    ${instrHtml}

    <section>
      <div class="sec-title">Résultats</div>
      ${resultHtml}
    </section>

    <div class="sig-line">
      <div class="sig-box">
        <p>Signature du technicien</p>
      </div>
    </div>

    <div class="doc-footer">
      <span>${HOSPITAL_NAME} — ${HOSPITAL_ADDRESS}</span>
      <span>Imprimé le ${new Date().toLocaleDateString('fr-FR')}</span>
    </div>`

  openPrintWindow(html, `Examen ${examen.type} — ${examen.patient.prenom} ${examen.patient.nom}`)
}

// ─── Dossier médical complet ──────────────────────────────────────────────────

interface DossierPatient {
  id: string; numero: string; prenom: string; nom: string
  dateNaissance: string; sexe: 'M' | 'F'; telephone: string
  adresse?: string | null; groupeSanguin?: string | null
  antecedents?: string | null; allergies?: string | null
  createdAt: string
  consultations: Array<{
    id: string; date: string; diagnostic?: string | null; notes?: string | null
    prescriptions?: string | null; signesVitaux?: Record<string, unknown> | null
    medecin: { prenom: string; nom: string }
  }>
  examens: Array<{
    id: string; type: string; statut: string; resultat?: string | null
    createdAt: string; medecin: { prenom: string; nom: string }
  }>
  factures: Array<{
    id: string; numero: string; montantTotal: number; montantPaye: number; statut: string; createdAt: string
  }>
}

interface DossierSejour {
  id: string; dateAdmission: string; dateSortie?: string | null; motif?: string | null; statut: string
  medecin: { prenom: string; nom: string }
  lit: { numero: string; chambre: { numero: string; type: string; service?: { nom: string } | null } }
}

interface DossierPrescription {
  id: string; medicament: string; dosage: string; voie: string; frequence: string
  medecin: { prenom: string; nom: string }
}

export async function printDossierPatient(
  patient: DossierPatient,
  sejours: DossierSejour[],
  prescriptionsActives: DossierPrescription[],
) {
  const cfg = await getConfig()
  const HOSPITAL_NAME    = cfg.nom
  const HOSPITAL_ADDRESS = [cfg.adresse, cfg.telephone].filter(Boolean).join(' · ') || 'Haïti'

  function fmtD(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
  function fmtT(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  const age = Math.floor((Date.now() - new Date(patient.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000))

  const STATUT_EXAMEN: Record<string, string> = {
    EN_ATTENTE: 'En attente', EN_COURS: 'En cours',
    RESULTAT_DISPONIBLE: 'Résultat dispo.', VALIDE: 'Validé', ANNULE: 'Annulé',
  }
  const STATUT_FACTURE: Record<string, string> = {
    EN_ATTENTE: 'Non payée', PARTIELLEMENT_PAYE: 'Partielle', PAYE: 'Payée', ANNULE: 'Annulée',
  }
  const TYPE_CHAMBRE: Record<string, string> = {
    STANDARD: 'Standard', SOINS_INTENSIFS: 'Soins intensifs',
    MATERNITE: 'Maternité', PEDIATRIE: 'Pédiatrie', ISOLEMENT: 'Isolement',
  }

  const consultHtml = patient.consultations.length === 0
    ? '<p style="color:#94a3b8;font-style:italic;font-size:12px">Aucune consultation enregistrée.</p>'
    : patient.consultations.map((c, i) => {
        const sv = c.signesVitaux as { tension?: string; temperature?: number; poids?: number } | undefined
        const vitauxStr = sv
          ? [sv.tension && `TA ${sv.tension}`, sv.temperature && `T° ${sv.temperature}°C`, sv.poids && `${sv.poids} kg`].filter(Boolean).join(' · ')
          : ''
        return `
          <div style="border-left:3px solid #e2e8f0;padding:10px 16px;margin-bottom:${i < patient.consultations.length - 1 ? '14px' : '0'}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div>
                <strong style="font-size:13px;color:#0f172a">${fmtD(c.date)}</strong>
                <span style="font-size:10px;color:#94a3b8;margin-left:6px">${fmtT(c.date)}</span>
              </div>
              <span style="font-size:11px;color:#64748b">Dr. ${c.medecin.prenom} ${c.medecin.nom}</span>
            </div>
            ${vitauxStr ? `<p style="font-size:10px;color:#64748b;margin-bottom:6px;background:#f8fafc;padding:4px 8px;border-radius:4px">Signes vitaux : ${vitauxStr}</p>` : ''}
            ${c.diagnostic ? `<p style="font-size:12px;color:#1e293b;margin-bottom:4px"><strong>Diagnostic :</strong> ${c.diagnostic}</p>` : ''}
            ${c.notes ? `<p style="font-size:12px;color:#475569;margin-bottom:4px"><em>Notes :</em> ${c.notes}</p>` : ''}
            ${c.prescriptions ? `<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:6px;padding:8px 12px;margin-top:6px"><p style="font-size:10px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Ordonnance</p><pre style="font-size:11px;color:#3730a3;white-space:pre-wrap;font-family:inherit">${c.prescriptions}</pre></div>` : ''}
          </div>`
      }).join('')

  const examenRows = patient.examens.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic">Aucun examen</td></tr>'
    : patient.examens.map(e => {
        const isOk = e.statut === 'RESULTAT_DISPONIBLE' || e.statut === 'VALIDE'
        return `<tr>
          <td>${fmtD(e.createdAt)}</td>
          <td><strong>${e.type}</strong></td>
          <td>Dr. ${e.medecin.prenom} ${e.medecin.nom}</td>
          <td><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${isOk ? '#dcfce7' : '#fef3c7'};color:${isOk ? '#166534' : '#92400e'}">${STATUT_EXAMEN[e.statut] || e.statut}</span></td>
        </tr>
        ${e.resultat ? `<tr><td colspan="4" style="padding:2px 12px 8px;font-size:11px;color:#475569;font-style:italic">${e.resultat}</td></tr>` : ''}`
      }).join('')

  const sejourHtml = sejours.length === 0
    ? '<p style="color:#94a3b8;font-style:italic;font-size:12px">Aucune hospitalisation dans le dossier.</p>'
    : sejours.map(s => {
        const dureeMs = (s.dateSortie ? new Date(s.dateSortie) : new Date()).getTime() - new Date(s.dateAdmission).getTime()
        const jours = Math.ceil(dureeMs / 86_400_000)
        const isActif = s.statut === 'EN_COURS'
        return `
          <div style="border:1px solid ${isActif ? '#fecaca' : '#e2e8f0'};background:${isActif ? '#fff5f5' : '#f8fafc'};border-radius:8px;padding:10px 14px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <strong style="font-size:13px;color:#0f172a">Chambre ${s.lit.chambre.numero} — Lit ${s.lit.numero}</strong>
                <span style="font-size:10px;color:#94a3b8;margin-left:6px">${TYPE_CHAMBRE[s.lit.chambre.type] || s.lit.chambre.type}${s.lit.chambre.service ? ` · ${s.lit.chambre.service.nom}` : ''}</span>
              </div>
              <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${isActif ? '#fee2e2' : '#f1f5f9'};color:${isActif ? '#dc2626' : '#64748b'}">${isActif ? 'En cours' : `${jours} jour${jours > 1 ? 's' : ''}`}</span>
            </div>
            <p style="font-size:11px;color:#64748b;margin-top:4px">
              ${fmtD(s.dateAdmission)}${s.dateSortie ? ` → ${fmtD(s.dateSortie)}` : ' → en cours'} · Dr. ${s.medecin.prenom} ${s.medecin.nom}
            </p>
            ${s.motif ? `<p style="font-size:11px;color:#475569;font-style:italic;margin-top:2px">Motif : ${s.motif}</p>` : ''}
          </div>`
      }).join('')

  const prescHtml = prescriptionsActives.length === 0 ? '' : `
    <section>
      <div class="sec-title">Prescriptions actives (séjour en cours)</div>
      <table>
        <thead><tr><th>Médicament</th><th>Dosage</th><th>Voie</th><th>Fréquence</th><th>Prescrit par</th></tr></thead>
        <tbody>
          ${prescriptionsActives.map(p => `<tr>
            <td><strong>${p.medicament}</strong></td>
            <td>${p.dosage}</td>
            <td>${p.voie}</td>
            <td>${p.frequence}</td>
            <td>Dr. ${p.medecin.prenom} ${p.medecin.nom}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>`

  const totalImpayes = patient.factures
    .filter(f => ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'].includes(f.statut))
    .reduce((s, f) => s + (f.montantTotal - f.montantPaye), 0)

  const factureRows = patient.factures.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic">Aucune facture</td></tr>'
    : patient.factures.map(f => {
        const isPaid = f.statut === 'PAYE'
        return `<tr>
          <td><strong>${f.numero}</strong><br><span style="font-size:10px;color:#94a3b8">${fmtD(f.createdAt)}</span></td>
          <td class="text-right">${f.montantTotal.toLocaleString('fr-FR')} HTG</td>
          <td class="text-right">${f.montantPaye.toLocaleString('fr-FR')} HTG</td>
          <td><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${isPaid ? '#dcfce7' : '#fff7ed'};color:${isPaid ? '#166534' : '#9a3412'}">${STATUT_FACTURE[f.statut] || f.statut}</span></td>
        </tr>`
      }).join('')

  const html = `
    <div class="doc-header">
      <div>
        <h1>${HOSPITAL_NAME}</h1>
        <p>${HOSPITAL_ADDRESS}</p>
      </div>
      <div class="doc-type">Dossier médical<span class="numero" style="font-size:14px">${patient.numero}</span></div>
    </div>

    <!-- Identité -->
    <div class="info-grid">
      <div class="info-box">
        <div class="label">Patient</div>
        <div class="value">${patient.prenom} ${patient.nom}</div>
        <div class="sub">${patient.sexe === 'M' ? 'Masculin' : 'Féminin'} · ${age} ans · Né(e) le ${fmtD(patient.dateNaissance)}</div>
        ${patient.groupeSanguin ? `<div class="sub" style="margin-top:4px;font-weight:700;color:#dc2626">Groupe sanguin : ${patient.groupeSanguin}</div>` : ''}
      </div>
      <div class="info-box">
        <div class="label">Contact</div>
        <div class="value">${patient.telephone}</div>
        ${patient.adresse ? `<div class="sub">${patient.adresse}</div>` : ''}
        <div class="sub" style="margin-top:6px;font-size:10px;color:#94a3b8">Enregistré le ${fmtD(patient.createdAt)}</div>
      </div>
    </div>

    <!-- Antécédents & Allergies -->
    ${(patient.antecedents || patient.allergies) ? `
    <div class="info-grid" style="margin-top:0">
      ${patient.antecedents ? `<div class="info-box"><div class="label">Antécédents médicaux</div><div style="font-size:12px;color:#1e293b;line-height:1.6;margin-top:4px">${patient.antecedents}</div></div>` : '<div></div>'}
      ${patient.allergies ? `<div class="info-box" style="border-color:#fca5a5;background:#fff5f5"><div class="label" style="color:#dc2626">⚠ Allergies connues</div><div style="font-size:12px;color:#991b1b;line-height:1.6;margin-top:4px;font-weight:600">${patient.allergies}</div></div>` : '<div></div>'}
    </div>` : ''}

    <!-- Consultations -->
    <section>
      <div class="sec-title">Consultations (${patient.consultations.length})</div>
      ${consultHtml}
    </section>

    <!-- Examens -->
    <section>
      <div class="sec-title">Examens médicaux (${patient.examens.length})</div>
      <table>
        <thead><tr><th>Date</th><th>Type</th><th>Prescrit par</th><th>Statut</th></tr></thead>
        <tbody>${examenRows}</tbody>
      </table>
    </section>

    <!-- Hospitalisations -->
    <section>
      <div class="sec-title">Hospitalisations (${sejours.length})</div>
      ${sejourHtml}
    </section>

    ${prescHtml}

    <!-- Facturation -->
    <section>
      <div class="sec-title">Facturation (${patient.factures.length})</div>
      <table>
        <thead><tr><th>Facture</th><th class="text-right">Montant</th><th class="text-right">Payé</th><th>Statut</th></tr></thead>
        <tbody>
          ${factureRows}
          ${totalImpayes > 0 ? `
          <tr class="total-row">
            <td colspan="3">Total impayés</td>
            <td class="text-right" style="color:#dc2626">${totalImpayes.toLocaleString('fr-FR')} HTG</td>
          </tr>` : ''}
        </tbody>
      </table>
    </section>

    <div class="sig-line" style="margin-top:32px;display:flex;justify-content:space-between">
      <div class="sig-box"><p>Signature du médecin responsable</p></div>
      <div class="sig-box"><p>Cachet de l'établissement</p></div>
    </div>

    <div class="doc-footer">
      <span>${HOSPITAL_NAME} — Document confidentiel</span>
      <span>Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>`

  openPrintWindow(html, `Dossier médical — ${patient.prenom} ${patient.nom}`)
}
