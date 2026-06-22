export type FieldType = 'number' | 'select' | 'textarea'

export interface ExamFieldDef {
  key: string
  label: string
  unit?: string
  type: FieldType
  options?: string[]
  placeholder?: string
  normalRange?: string
  normalMin?: number
  normalMax?: number
  required?: boolean
}

export type ExamCategory = 'biologie' | 'serologie' | 'microbiologie' | 'imagerie'

export interface ExamSchemaDef {
  category: ExamCategory
  fields: ExamFieldDef[]
}

export const EXAM_SCHEMAS: Record<string, ExamSchemaDef> = {
  'NFS / Hémogramme': {
    category: 'biologie',
    fields: [
      { key: 'gb',          label: 'Globules blancs',  unit: 'x10³/µL', type: 'number', normalRange: '4.0 – 10.0', normalMin: 4, normalMax: 10 },
      { key: 'gr',          label: 'Globules rouges',  unit: 'x10⁶/µL', type: 'number', normalRange: '4.0 – 5.5',  normalMin: 4, normalMax: 5.5 },
      { key: 'hb',          label: 'Hémoglobine',      unit: 'g/dL',     type: 'number', normalRange: '12 – 17',    normalMin: 12, normalMax: 17 },
      { key: 'ht',          label: 'Hématocrite',      unit: '%',         type: 'number', normalRange: '36 – 52',    normalMin: 36, normalMax: 52 },
      { key: 'vgm',         label: 'VGM',              unit: 'fL',        type: 'number', normalRange: '80 – 100',   normalMin: 80, normalMax: 100 },
      { key: 'plq',         label: 'Plaquettes',       unit: 'x10³/µL', type: 'number', normalRange: '150 – 400',  normalMin: 150, normalMax: 400 },
      { key: 'neutrophiles',label: 'Neutrophiles',     unit: '%',         type: 'number', normalRange: '50 – 70',    normalMin: 50, normalMax: 70 },
      { key: 'lymphocytes', label: 'Lymphocytes',      unit: '%',         type: 'number', normalRange: '20 – 40',    normalMin: 20, normalMax: 40 },
    ]
  },
  'Glycémie à jeun': {
    category: 'biologie',
    fields: [
      { key: 'valeur',         label: 'Glycémie',        unit: 'g/L',  type: 'number', normalRange: '0.70 – 1.10', normalMin: 0.7, normalMax: 1.1, placeholder: '0.90', required: true },
      { key: 'interpretation', label: 'Interprétation', type: 'select', options: ['', 'Normal', 'Hypoglycémie', 'Prédiabète (0.70–1.10)', 'Diabète (≥ 1.26)'] },
    ]
  },
  'Glycémie post-prandiale': {
    category: 'biologie',
    fields: [
      { key: 'valeur',         label: 'Glycémie 2h post-prandiale', unit: 'g/L',  type: 'number', normalRange: '< 1.40', normalMax: 1.4, placeholder: '1.20', required: true },
      { key: 'interpretation', label: 'Interprétation', type: 'select', options: ['', 'Normal', 'Hyperglycémie post-prandiale', 'Diabète (≥ 2.00)'] },
    ]
  },
  'Bilan lipidique (cholestérol)': {
    category: 'biologie',
    fields: [
      { key: 'cholesterol_total', label: 'Cholestérol total', unit: 'g/L', type: 'number', normalRange: '< 2.00', normalMax: 2.0, required: true },
      { key: 'hdl',              label: 'HDL-Cholestérol',   unit: 'g/L', type: 'number', normalRange: '> 0.40', normalMin: 0.4 },
      { key: 'ldl',              label: 'LDL-Cholestérol',   unit: 'g/L', type: 'number', normalRange: '< 1.60', normalMax: 1.6 },
      { key: 'triglycerides',    label: 'Triglycérides',     unit: 'g/L', type: 'number', normalRange: '< 1.50', normalMax: 1.5 },
    ]
  },
  'Créatinine / Urée': {
    category: 'biologie',
    fields: [
      { key: 'creatinine', label: 'Créatinine', unit: 'mg/L', type: 'number', normalRange: '6 – 13',         normalMin: 6,    normalMax: 13   },
      { key: 'uree',       label: 'Urée',        unit: 'g/L',  type: 'number', normalRange: '0.15 – 0.45',   normalMin: 0.15, normalMax: 0.45 },
    ]
  },
  'Transaminases (ASAT / ALAT)': {
    category: 'biologie',
    fields: [
      { key: 'asat', label: 'ASAT (TGO)', unit: 'UI/L', type: 'number', normalRange: '< 40', normalMax: 40 },
      { key: 'alat', label: 'ALAT (TGP)', unit: 'UI/L', type: 'number', normalRange: '< 40', normalMax: 40 },
    ]
  },
  'TSH / T4 (thyroïde)': {
    category: 'biologie',
    fields: [
      { key: 'tsh',      label: 'TSH',      unit: 'mUI/L',  type: 'number', normalRange: '0.4 – 4.0',  normalMin: 0.4,  normalMax: 4.0  },
      { key: 't4_libre', label: 'T4 libre', unit: 'pmol/L', type: 'number', normalRange: '10 – 20',     normalMin: 10,   normalMax: 20   },
    ]
  },
  'CRP (inflammation)': {
    category: 'biologie',
    fields: [
      { key: 'valeur',         label: 'CRP',             unit: 'mg/L', type: 'number', normalRange: '< 6', normalMax: 6, placeholder: '5.0', required: true },
      { key: 'interpretation', label: 'Interprétation', type: 'select', options: ['', 'Normal (< 6)', 'Inflammation légère (6–40)', 'Inflammation modérée (40–200)', 'Inflammation sévère (> 200)'] },
    ]
  },
  'ECBU (urine)': {
    category: 'microbiologie',
    fields: [
      { key: 'leucocytes',    label: 'Leucocytes',          unit: '/mm³', type: 'number', normalRange: '< 10', normalMax: 10 },
      { key: 'nitrites',      label: 'Nitrites',            type: 'select', options: ['', 'Négatif', 'Positif'] },
      { key: 'bacteriurie',   label: 'Bactériurie',         type: 'select', options: ['', 'Absente', 'Présente'] },
      { key: 'germe',         label: 'Germe identifié',     type: 'textarea', placeholder: 'Ex: E. coli, Klebsiella pneumoniae, Staphylocoque...' },
      { key: 'antibiogramme', label: 'Antibiogramme',       type: 'textarea', placeholder: 'Sensible : Amoxicilline, Ciprofloxacine...\nRésistant : Ampicilline...' },
    ]
  },
  'Sérologie VIH': {
    category: 'serologie',
    fields: [
      { key: 'resultat',     label: 'Résultat',     type: 'select', options: ['', 'Négatif', 'Positif'],                        required: true },
      { key: 'type_test',    label: 'Type de test', type: 'select', options: ['', 'Test rapide', 'ELISA', 'Western Blot'] },
      { key: 'observations', label: 'Observations', type: 'textarea' },
    ]
  },
  'Hépatite B (AgHBs)': {
    category: 'serologie',
    fields: [
      { key: 'agHBs',        label: 'AgHBs',        type: 'select', options: ['', 'Négatif', 'Positif'], required: true },
      { key: 'antiHBs',      label: 'Anti-HBs',     type: 'select', options: ['', 'Négatif', 'Positif'] },
      { key: 'antiHBc',      label: 'Anti-HBc',     type: 'select', options: ['', 'Négatif', 'Positif'] },
      { key: 'observations', label: 'Observations',  type: 'textarea' },
    ]
  },
  'Hépatite C (Anti-VHC)': {
    category: 'serologie',
    fields: [
      { key: 'antiVHC',      label: 'Anti-VHC',     type: 'select', options: ['', 'Négatif', 'Positif'], required: true },
      { key: 'observations', label: 'Observations',  type: 'textarea' },
    ]
  },
  'VDRL (syphilis)': {
    category: 'serologie',
    fields: [
      { key: 'resultat',     label: 'VDRL',              type: 'select', options: ['', 'Négatif', 'Positif'],                                        required: true },
      { key: 'titre',        label: 'Titre (si positif)', type: 'select', options: ['', '1/2', '1/4', '1/8', '1/16', '1/32', '1/64', '> 1/64'] },
      { key: 'observations', label: 'Observations',       type: 'textarea' },
    ]
  },
  'Goutte épaisse (paludisme)': {
    category: 'microbiologie',
    fields: [
      { key: 'resultat',      label: 'Plasmodium',           type: 'select', options: ['', 'Négatif', 'Positif'],                                                    required: true },
      { key: 'espece',        label: 'Espèce (si positif)',  type: 'select', options: ['', 'P. falciparum', 'P. vivax', 'P. malariae', 'P. ovale', 'Mixte'] },
      { key: 'parasitemie',   label: 'Parasitémie',          unit: 'parasites/µL', type: 'number', placeholder: 'Nombre de parasites' },
      { key: 'observations',  label: 'Observations',         type: 'textarea' },
    ]
  },
  'Test de grossesse (βhCG)': {
    category: 'serologie',
    fields: [
      { key: 'resultat',     label: 'Résultat',              type: 'select', options: ['', 'Négatif', 'Positif'], required: true },
      { key: 'valeur_bhcg',  label: 'βhCG quantitatif',     unit: 'mUI/mL', type: 'number', placeholder: 'Optionnel' },
      { key: 'observations', label: 'Observations',          type: 'textarea' },
    ]
  },
}

export const FREE_TEXT_TYPES = new Set([
  'Radiographie pulmonaire',
  'Échographie abdominale',
  'Échographie pelvienne',
  'Échographie obstétricale (Grossesse)',
  'ECG',
  'Scanner (TDM)',
  'IRM',
  'Autre (préciser dans la description)',
])

export function generateResultatText(type: string, values: Record<string, string>): string {
  if (FREE_TEXT_TYPES.has(type)) return values._texte || ''

  const schema = EXAM_SCHEMAS[type]
  if (!schema) return Object.values(values).filter(Boolean).join(' | ')

  const parts: string[] = []
  for (const field of schema.fields) {
    const val = values[field.key]
    if (!val || val === '') continue
    if (field.type === 'number') {
      const numVal = parseFloat(val)
      const isLow  = !isNaN(numVal) && field.normalMin !== undefined && numVal < field.normalMin
      const isHigh = !isNaN(numVal) && field.normalMax !== undefined && numVal > field.normalMax
      const flag   = isLow ? ' ↓' : isHigh ? ' ↑' : ''
      parts.push(`${field.label}: ${val}${field.unit ? ' ' + field.unit : ''}${flag}`)
    } else if (field.type !== 'textarea' || val.trim()) {
      parts.push(`${field.label}: ${val}`)
    }
  }
  return parts.join(' | ')
}

export type ResultatValues = Record<string, string>

export const EXAM_TYPES = [
  'NFS / Hémogramme',
  'Glycémie à jeun',
  'Glycémie post-prandiale',
  'Bilan lipidique (cholestérol)',
  'Créatinine / Urée',
  'Transaminases (ASAT / ALAT)',
  'TSH / T4 (thyroïde)',
  'CRP (inflammation)',
  'ECBU (urine)',
  'Sérologie VIH',
  'Hépatite B (AgHBs)',
  'Hépatite C (Anti-VHC)',
  'VDRL (syphilis)',
  'Goutte épaisse (paludisme)',
  'Test de grossesse (βhCG)',
  'Radiographie pulmonaire',
  'Échographie abdominale',
  'Échographie pelvienne',
  'Échographie obstétricale (Grossesse)',
  'ECG',
  'Scanner (TDM)',
  'IRM',
  'Autre (préciser dans la description)',
]
