export function openPrintWindow(html: string, title = 'BANKA') {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #0b1733; background: white; padding: 32px; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
  h2 { font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; }
  h3 { font-size: 12px; font-weight: 700; margin: 12px 0 6px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0b1733; }
  .logo { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; }
  .meta { text-align: right; font-size: 11px; color: #4a5578; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #eef2ff; color: #1e3a8a; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 10px; text-align: left; border: 1px solid #e7eaf3; }
  td { padding: 6px 10px; border: 1px solid #e7eaf3; vertical-align: top; }
  tr:nth-child(even) td { background: #f7f8fc; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .kpi { border: 1px solid #e7eaf3; border-radius: 8px; padding: 12px; }
  .kpi-label { font-size: 10px; color: #8b94b0; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
  .kpi-value { font-size: 18px; font-weight: 700; color: #0b1733; }
  .chip { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
  .chip-success { background: #ecfdf5; color: #047857; }
  .chip-danger  { background: #fef2f2; color: #b91c1c; }
  .chip-warning { background: #fffbeb; color: #b45309; }
  .chip-neutral { background: #f0f2f9; color: #4a5578; }
  .chip-blue    { background: #eef2ff; color: #1e40af; }
  .credit { color: #047857; font-weight: 700; }
  .debit  { color: #b91c1c; font-weight: 700; }
  .total-row td { font-weight: 700; background: #eef2ff !important; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e7eaf3; font-size: 10px; color: #8b94b0; display: flex; justify-content: space-between; }
  @media print { body { padding: 16px; } }
</style>
</head><body>
${html}
<script>window.onload = () => { window.print(); }<\/script>
</body></html>`);
  win.document.close();
}

export function formatMontantPrint(n: number | string, devise = 'HTG') {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + ' ' + devise;
}

export function formatDatePrint(d: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
}

export function formatDatetimePrint(d: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
}

export function bankaHeader(subtitle = '') {
  return `
<div class="header">
  <div>
    <div class="logo">BANKA</div>
    <div style="font-size:11px;color:#4a5578;margin-top:2px;">Système de Gestion Bancaire</div>
  </div>
  <div class="meta">
    <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${subtitle}</div>
    <div>Édité le ${formatDatetimePrint(new Date())}</div>
  </div>
</div>`;
}
