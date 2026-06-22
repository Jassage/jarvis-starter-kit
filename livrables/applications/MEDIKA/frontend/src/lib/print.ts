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
  const nom      = data.hopital?.nom || 'CLINIQUE MEDIKA'
  const adresse  = [data.hopital?.adresse, data.hopital?.telephone].filter(Boolean).join(' · ') || 'Haïti'
  const dateStr  = new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const now      = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

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
