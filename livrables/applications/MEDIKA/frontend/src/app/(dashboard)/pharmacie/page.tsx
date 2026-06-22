'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useSSE } from '@/hooks/useSSE'
import { Combobox } from '@/components/ui/Combobox'
import {
  Pill, PackageSearch, AlertTriangle, ShoppingCart, Plus, X, ChevronDown,
  ChevronUp, Search, AlertCircle, CheckCircle2, Clock, TrendingDown,
  Truck, ArrowDownCircle, RefreshCw, Info, Edit2, Trash2, Archive
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Medicament {
  id: string; nom: string; dci: string | null; categorie: string | null
  forme: string | null; dosageForme: string | null; unite: string
  stockActuel: number; seuilAlerte: number; prixUnitaire: number | null; actif: boolean
  lots: LotMedicament[]
}
interface LotMedicament {
  id: string; numero: string; quantiteInitiale: number; quantiteRestante: number
  datePeremption: string | null; fournisseur: string | null
}
interface Alerte {
  ruptureStock: Medicament[]
  lotsPerimanent: { id: string; numero: string; quantiteRestante: number; datePeremption: string; medicament: { id: string; nom: string; unite: string } }[]
  lotsPerimes:   { id: string; numero: string; quantiteRestante: number; datePeremption: string; medicament: { id: string; nom: string; unite: string } }[]
  total: number
}
interface PrescriptionActive {
  id: string; medicament: string; dosage: string; voie: string; frequence: string; statut: string
  patient: { id: string; prenom: string; nom: string; numero: string }
  medecin: { prenom: string; nom: string }
}
interface CommandeFournisseur {
  id: string; numero: string; fournisseur: string; statut: string
  dateLivraisonPrevue: string | null; createdAt: string
  lignes: { id: string; medicamentId: string; quantiteCommandee: number; quantiteRecue: number | null; prixUnitaire: number | null; medicament: { id: string; nom: string; unite: string } }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TABS = ['Inventaire', 'Alertes', 'Dispenser', 'Commandes'] as const
type Tab = typeof TABS[number]

function cmdBadge(statut: string) {
  const map: Record<string, string> = {
    BROUILLON: 'bg-slate-100 text-slate-600', ENVOYE: 'bg-blue-100 text-blue-700',
    RECU_PARTIEL: 'bg-amber-100 text-amber-700', RECU: 'bg-emerald-100 text-emerald-700', ANNULE: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = { BROUILLON: 'Brouillon', ENVOYE: 'Envoyée', RECU_PARTIEL: 'Partielle', RECU: 'Reçue', ANNULE: 'Annulée' }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[statut] || 'bg-slate-100 text-slate-600'}`}>{labels[statut] || statut}</span>
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function jursAvant(s: string) { return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000) }

// ── Page principale ───────────────────────────────────────────────────────────

export default function PharmaciePage() {
  const { user } = useAuthStore()
  const [tab, setTab]   = useState<Tab>('Inventaire')
  const [meds, setMeds] = useState<Medicament[]>([])
  const [search, setSearch]     = useState('')
  const [expandedMed, setExpandedMed] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [alertes, setAlertes]   = useState<Alerte | null>(null)
  const [prescriptions, setPrescriptions] = useState<PrescriptionActive[]>([])
  const [commandes, setCommandes] = useState<CommandeFournisseur[]>([])

  // Modals
  const [showAddMed, setShowAddMed]           = useState(false)
  const [editMed, setEditMed]                 = useState<Medicament | null>(null)
  const [showLot, setShowLot]                 = useState<Medicament | null>(null)
  const [showMouvement, setShowMouvement]     = useState<Medicament | null>(null)
  const [showDispenser, setShowDispenser]         = useState<PrescriptionActive | null>(null)
  const [showDispenserDirect, setShowDispenserDirect] = useState(false)
  const [showAddCommande, setShowAddCommande] = useState(false)
  const [confirmArchive, setConfirmArchive]   = useState<Medicament | null>(null)

  const isAdmin = user?.role === 'ADMIN'
  const canAct  = ['ADMIN', 'MEDECIN', 'INFIRMIER'].includes(user?.role || '')

  const fetchInventaire = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/pharmacie/medicaments', { params: { search: search || undefined } }); setMeds(r.data.data) }
    finally { setLoading(false) }
  }, [search])

  const fetchAlertes     = useCallback(async () => { const r = await api.get('/pharmacie/alertes');                setAlertes(r.data.data) }, [])
  const fetchPrescriptions = useCallback(async () => { const r = await api.get('/pharmacie/prescriptions-actives'); setPrescriptions(r.data.data) }, [])
  const fetchCommandes   = useCallback(async () => { const r = await api.get('/pharmacie/commandes');              setCommandes(r.data.data) }, [])

  useEffect(() => {
    if (tab === 'Inventaire') fetchInventaire()
    if (tab === 'Alertes')    fetchAlertes()
    if (tab === 'Dispenser')  fetchPrescriptions()
    if (tab === 'Commandes')  fetchCommandes()
  }, [tab, fetchInventaire, fetchAlertes, fetchPrescriptions, fetchCommandes])

  useEffect(() => { fetchAlertes() }, [fetchAlertes])

  useSSE(['pharmacie'], () => {
    fetchAlertes()
    if (tab === 'Inventaire') fetchInventaire()
    if (tab === 'Dispenser')  fetchPrescriptions()
    if (tab === 'Commandes')  fetchCommandes()
  })

  async function archiver(med: Medicament) {
    await api.patch(`/pharmacie/medicaments/${med.id}`, { actif: false })
    setConfirmArchive(null); fetchInventaire()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-emerald-600" /> Pharmacie
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Inventaire, dispensation et commandes</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && tab === 'Inventaire' && (
            <button onClick={() => setShowAddMed(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Nouveau médicament
            </button>
          )}
          {isAdmin && tab === 'Commandes' && (
            <button onClick={() => setShowAddCommande(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Nouvelle commande
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t}
            {t === 'Alertes' && alertes && alertes.total > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {alertes.total > 9 ? '9+' : alertes.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Inventaire ──────────────────────────────────────────────────────── */}
      {tab === 'Inventaire' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un médicament..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 shadow-sm" />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Chargement...</div>
          ) : meds.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Aucun médicament trouvé
            </div>
          ) : (
            <div className="space-y-2">
              {meds.map(med => {
                const enAlerte   = med.stockActuel <= med.seuilAlerte
                const isExpanded = expandedMed === med.id
                return (
                  <div key={med.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${enAlerte ? 'border-amber-300' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-4 p-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${enAlerte ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                        <Pill className={`w-5 h-5 ${enAlerte ? 'text-amber-600' : 'text-emerald-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-semibold text-sm">{med.nom}</span>
                          {med.dci && <span className="text-slate-400 text-xs">({med.dci})</span>}
                          {!med.actif && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">Archivé</span>}
                          {enAlerte && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {med.forme && <span className="text-slate-500 text-xs">{med.forme}</span>}
                          {med.dosageForme && <span className="text-slate-500 text-xs">{med.dosageForme}</span>}
                          {med.categorie && <span className="text-xs bg-slate-100 text-slate-600 px-1.5 rounded">{med.categorie}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-lg font-bold ${enAlerte ? 'text-amber-600' : 'text-emerald-600'}`}>{med.stockActuel}</div>
                        <div className="text-slate-400 text-xs">{med.unite} · seuil {med.seuilAlerte}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {canAct && (
                          <>
                            <button onClick={() => setShowLot(med)} title="Ajouter un lot"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                              <ArrowDownCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowMouvement(med)} title="Mouvement de stock"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <>
                            <button onClick={() => setEditMed(med)} title="Modifier"
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {med.actif && (
                              <button onClick={() => setConfirmArchive(med)} title="Archiver"
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        <button onClick={() => setExpandedMed(isExpanded ? null : med.id)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                        {med.prixUnitaire != null && (
                          <div className="text-xs text-slate-500 mb-2">Prix unitaire : <span className="font-semibold text-slate-700">{med.prixUnitaire.toLocaleString('fr-FR')} HTG</span></div>
                        )}
                        {med.lots.length === 0 ? (
                          <p className="text-slate-400 text-xs">Aucun lot enregistré</p>
                        ) : (
                          <>
                            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Lots en stock</p>
                            <div className="space-y-1.5">
                              {med.lots.map(lot => {
                                const jrs     = lot.datePeremption ? jursAvant(lot.datePeremption) : null
                                const expired = jrs !== null && jrs < 0
                                const soon    = jrs !== null && jrs >= 0 && jrs <= 30
                                return (
                                  <div key={lot.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${expired ? 'bg-red-50 border border-red-200' : soon ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-200'}`}>
                                    <div>
                                      <span className="text-slate-700 font-mono font-medium">{lot.numero}</span>
                                      {lot.fournisseur && <span className="text-slate-400 ml-2">· {lot.fournisseur}</span>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-slate-600">{lot.quantiteRestante} {med.unite}</span>
                                      {lot.datePeremption && (
                                        <span className={expired ? 'text-red-600 font-medium' : soon ? 'text-amber-600 font-medium' : 'text-slate-400'}>
                                          {expired ? 'Périmé' : `J-${jrs}`} · {formatDate(lot.datePeremption)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Alertes ─────────────────────────────────────────────────────────── */}
      {tab === 'Alertes' && alertes && (
        <div className="space-y-6">
          <Section title="Rupture / stock bas" icon={<TrendingDown className="w-4 h-4 text-red-500" />} count={alertes.ruptureStock.length}>
            {alertes.ruptureStock.length === 0 ? (
              <EmptyAlert icon={<CheckCircle2 className="w-4 h-4" />} text="Aucune rupture de stock" color="emerald" />
            ) : alertes.ruptureStock.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <div>
                  <span className="text-slate-900 text-sm font-medium">{m.nom}</span>
                  {m.dci && <span className="text-slate-400 text-xs ml-2">({m.dci})</span>}
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold text-sm">{m.stockActuel} {m.unite}</span>
                  <div className="text-slate-400 text-xs">seuil : {m.seuilAlerte}</div>
                </div>
              </div>
            ))}
          </Section>

          {alertes.lotsPerimes.length > 0 && (
            <Section title="Lots périmés" icon={<X className="w-4 h-4 text-red-500" />} count={alertes.lotsPerimes.length}>
              {alertes.lotsPerimes.map(lot => (
                <div key={lot.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <div>
                    <span className="text-slate-900 text-sm">{lot.medicament.nom}</span>
                    <span className="text-slate-400 text-xs ml-2">· lot {lot.numero}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-red-600 text-xs font-medium">Périmé le {formatDate(lot.datePeremption)}</span>
                    <div className="text-slate-500 text-xs">{lot.quantiteRestante} {lot.medicament.unite} à retirer</div>
                  </div>
                </div>
              ))}
            </Section>
          )}

          <Section title="Péremption dans 30 jours" icon={<Clock className="w-4 h-4 text-amber-500" />} count={alertes.lotsPerimanent.length}>
            {alertes.lotsPerimanent.length === 0 ? (
              <EmptyAlert icon={<CheckCircle2 className="w-4 h-4" />} text="Aucun lot n'expire bientôt" color="emerald" />
            ) : alertes.lotsPerimanent.map(lot => {
              const jrs = jursAvant(lot.datePeremption)
              return (
                <div key={lot.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div>
                    <span className="text-slate-900 text-sm">{lot.medicament.nom}</span>
                    <span className="text-slate-400 text-xs ml-2">· lot {lot.numero}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700 text-xs font-medium">Dans {jrs} jour{jrs > 1 ? 's' : ''}</span>
                    <div className="text-slate-500 text-xs">{lot.quantiteRestante} {lot.medicament.unite} · expire le {formatDate(lot.datePeremption)}</div>
                  </div>
                </div>
              )
            })}
          </Section>
        </div>
      )}

      {/* ── Dispenser ───────────────────────────────────────────────────────── */}
      {tab === 'Dispenser' && (
        <div className="space-y-3">
          {/* Prescriptions patients hospitalisés */}
          <div className="flex items-center gap-2 text-slate-600 text-sm bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 shrink-0 text-blue-500" />
            Prescriptions actives des patients hospitalisés
          </div>
          {prescriptions.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <PackageSearch className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Aucune prescription active à dispenser
            </div>
          ) : prescriptions.map(pr => (
            <div key={pr.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 font-semibold text-sm">{pr.medicament}</span>
                    <span className="text-slate-600 text-xs">{pr.dosage}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 rounded">{pr.voie}</span>
                  </div>
                  <div className="text-slate-500 text-xs mt-1">{pr.frequence}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>Patient : <span className="text-slate-700 font-medium">{pr.patient.prenom} {pr.patient.nom}</span> <span className="text-slate-400">#{pr.patient.numero}</span></span>
                    <span>Dr {pr.medecin.prenom} {pr.medecin.nom}</span>
                  </div>
                </div>
                {canAct && (
                  <button onClick={() => setShowDispenser(pr)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shrink-0">
                    Dispenser
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Dispensation ambulatoire */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200 mt-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Dispensation ambulatoire</p>
              <p className="text-xs text-slate-400">Patients externes, ordonnances libres, vente directe</p>
            </div>
            {canAct && (
              <button onClick={() => { fetchInventaire(); setShowDispenserDirect(true) }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shrink-0">
                <Plus className="w-4 h-4" /> Dispenser
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Commandes ───────────────────────────────────────────────────────── */}
      {tab === 'Commandes' && (
        <div className="space-y-3">
          {commandes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Aucune commande fournisseur
            </div>
          ) : commandes.map(cmd => (
            <div key={cmd.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-900 font-semibold text-sm">{cmd.numero}</span>
                  <span className="text-slate-500 text-xs ml-2">· {cmd.fournisseur}</span>
                </div>
                <div className="flex items-center gap-2">
                  {cmdBadge(cmd.statut)}
                  <span className="text-slate-400 text-xs">{formatDate(cmd.createdAt)}</span>
                  {isAdmin && cmd.statut !== 'RECU' && cmd.statut !== 'ANNULE' && (
                    <ReceptionCommandeBtn cmd={cmd} onDone={fetchCommandes} />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {cmd.lignes.map(l => (
                  <div key={l.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-1.5">
                    <span className="text-slate-700">{l.medicament.nom}</span>
                    <span className="text-slate-500">
                      {l.quantiteCommandee} {l.medicament.unite}
                      {l.quantiteRecue != null && <span className="text-emerald-600 ml-2">(reçu : {l.quantiteRecue})</span>}
                    </span>
                  </div>
                ))}
              </div>
              {cmd.dateLivraisonPrevue && (
                <div className="text-slate-400 text-xs">Livraison prévue : {formatDate(cmd.dateLivraisonPrevue)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddMed  && <MedicamentModal onClose={() => setShowAddMed(false)} onSuccess={() => { setShowAddMed(false); fetchInventaire() }} />}
      {editMed     && <MedicamentModal med={editMed} onClose={() => setEditMed(null)} onSuccess={() => { setEditMed(null); fetchInventaire() }} />}
      {showLot     && <AddLotModal med={showLot} onClose={() => setShowLot(null)} onSuccess={() => { setShowLot(null); fetchInventaire() }} />}
      {showMouvement && <MouvementModal med={showMouvement} onClose={() => setShowMouvement(null)} onSuccess={() => { setShowMouvement(null); fetchInventaire() }} />}
      {showDispenser && <DispenserModal prescription={showDispenser} meds={meds} onClose={() => setShowDispenser(null)} onSuccess={() => { setShowDispenser(null); fetchPrescriptions(); fetchInventaire() }} />}
      {showDispenserDirect && <DispenserDirectModal meds={meds} onClose={() => setShowDispenserDirect(false)} onSuccess={() => { setShowDispenserDirect(false); fetchInventaire() }} />}
      {showAddCommande && <AddCommandeModal meds={meds} onClose={() => setShowAddCommande(false)} onSuccess={() => { setShowAddCommande(false); fetchCommandes() }} />}

      {confirmArchive && (
        <ModalWrapper title="Archiver le médicament" onClose={() => setConfirmArchive(null)}>
          <p className="text-slate-600 text-sm">Archiver <strong>{confirmArchive.nom}</strong> le retirera de l'inventaire actif. Cette action est réversible.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setConfirmArchive(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
            <button onClick={() => archiver(confirmArchive)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">Archiver</button>
          </div>
        </ModalWrapper>
      )}
    </div>
  )
}

// ── Helpers UI ────────────────────────────────────────────────────────────────

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        {icon}{title} <span className="text-slate-400 font-normal">({count})</span>
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
function EmptyAlert({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 text-${color}-700 text-sm bg-${color}-50 border border-${color}-200 rounded-xl px-4 py-3`}>
      {icon}{text}
    </div>
  )
}

// ── Modals ────────────────────────────────────────────────────────────────────

function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-slate-900 font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-slate-600 text-xs font-medium mb-1.5">{label}</label>{children}</div>
}
const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400'

function MedicamentModal({ med, onClose, onSuccess }: { med?: Medicament; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    nom: med?.nom || '', dci: med?.dci || '', categorie: med?.categorie || '',
    forme: med?.forme || '', dosageForme: med?.dosageForme || '',
    unite: med?.unite || 'comprimé', seuilAlerte: String(med?.seuilAlerte ?? 10),
    prixUnitaire: med?.prixUnitaire != null ? String(med.prixUnitaire) : '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      if (med) await api.patch(`/pharmacie/medicaments/${med.id}`, { ...form, seuilAlerte: Number(form.seuilAlerte), prixUnitaire: form.prixUnitaire ? Number(form.prixUnitaire) : null })
      else     await api.post('/pharmacie/medicaments', { ...form, seuilAlerte: Number(form.seuilAlerte), prixUnitaire: form.prixUnitaire ? Number(form.prixUnitaire) : null })
      onSuccess()
    } catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }

  return (
    <ModalWrapper title={med ? 'Modifier le médicament' : 'Nouveau médicament'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nom commercial *"><input className={inp} value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="ex: Amoxicilline 500mg" /></Field>
        <Field label="DCI (principe actif)"><input className={inp} value={form.dci} onChange={e => set('dci', e.target.value)} placeholder="ex: Amoxicilline" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Forme"><input className={inp} value={form.forme} onChange={e => set('forme', e.target.value)} placeholder="ex: Comprimé" /></Field>
          <Field label="Dosage"><input className={inp} value={form.dosageForme} onChange={e => set('dosageForme', e.target.value)} placeholder="ex: 500mg" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unité"><input className={inp} value={form.unite} onChange={e => set('unite', e.target.value)} /></Field>
          <Field label="Seuil d'alerte"><input className={inp} type="number" min="0" value={form.seuilAlerte} onChange={e => set('seuilAlerte', e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Catégorie"><input className={inp} value={form.categorie} onChange={e => set('categorie', e.target.value)} /></Field>
          <Field label="Prix unitaire (HTG)"><input className={inp} type="number" min="0" step="0.01" value={form.prixUnitaire} onChange={e => set('prixUnitaire', e.target.value)} /></Field>
        </div>
        {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || !form.nom} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Enregistrement...' : med ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function AddLotModal({ med, onClose, onSuccess }: { med: Medicament; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ numero: '', quantite: '', datePeremption: '', fournisseur: '' })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try { await api.post(`/pharmacie/medicaments/${med.id}/lots`, { ...form, quantite: Number(form.quantite) }); onSuccess() }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }
  return (
    <ModalWrapper title={`Ajouter un lot — ${med.nom}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Numéro de lot *"><input className={inp} value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="ex: LOT-2026-001" /></Field>
        <Field label={`Quantité (${med.unite}) *`}><input className={inp} type="number" min="1" value={form.quantite} onChange={e => set('quantite', e.target.value)} /></Field>
        <Field label="Date de péremption"><input className={inp} type="date" value={form.datePeremption} onChange={e => set('datePeremption', e.target.value)} /></Field>
        <Field label="Fournisseur"><input className={inp} value={form.fournisseur} onChange={e => set('fournisseur', e.target.value)} /></Field>
        {err && <p className="text-red-500 text-xs">{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || !form.numero || !form.quantite} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Enregistrement...' : 'Ajouter le lot'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function MouvementModal({ med, onClose, onSuccess }: { med: Medicament; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ type: 'SORTIE', quantite: '', raison: '' })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try { await api.post('/pharmacie/mouvements', { medicamentId: med.id, ...form, quantite: Number(form.quantite) }); onSuccess() }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }
  return (
    <ModalWrapper title={`Mouvement de stock — ${med.nom}`} onClose={onClose}>
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
        Stock actuel : <span className="font-semibold text-slate-900">{med.stockActuel} {med.unite}</span>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Type de mouvement">
          <Combobox options={[{ value: 'SORTIE', label: 'Sortie' }, { value: 'AJUSTEMENT', label: 'Ajustement' }, { value: 'PEREMPTION', label: 'Retrait péremption' }]}
            value={form.type} onChange={v => set('type', v || 'SORTIE')} />
        </Field>
        <Field label={`Quantité (${med.unite}) *`}><input className={inp} type="number" min="1" value={form.quantite} onChange={e => set('quantite', e.target.value)} /></Field>
        <Field label="Raison"><input className={inp} value={form.raison} onChange={e => set('raison', e.target.value)} placeholder="ex: Casse, correction inventaire..." /></Field>
        {err && <p className="text-red-500 text-xs">{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || !form.quantite} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Enregistrement...' : 'Confirmer'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function DispenserModal({ prescription, meds, onClose, onSuccess }: { prescription: PrescriptionActive; meds: Medicament[]; onClose: () => void; onSuccess: () => void }) {
  const [medicamentId, setMedicamentId] = useState('')
  const [quantite, setQuantite] = useState('')
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  const selectedMed = meds.find(m => m.id === medicamentId)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try { await api.post(`/pharmacie/dispenser/${prescription.id}`, { medicamentId, quantite: Number(quantite) }); onSuccess() }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }
  return (
    <ModalWrapper title="Dispenser un médicament" onClose={onClose}>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
        <div className="text-slate-900 font-medium text-sm">{prescription.medicament} — {prescription.dosage}</div>
        <div className="text-slate-500 text-xs">{prescription.frequence} · {prescription.voie}</div>
        <div className="text-slate-500 text-xs">{prescription.patient.prenom} {prescription.patient.nom} #{prescription.patient.numero}</div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Médicament en stock *">
          <Combobox options={meds.map(m => ({ value: m.id, label: m.nom, sub: `${m.stockActuel} ${m.unite}${m.dci ? ' · ' + m.dci : ''}` }))}
            value={medicamentId} onChange={v => setMedicamentId(v || '')} placeholder="Sélectionner..." />
        </Field>
        {selectedMed && (
          <div className={`text-xs px-3 py-2 rounded-lg border ${selectedMed.stockActuel <= selectedMed.seuilAlerte ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            Stock disponible : {selectedMed.stockActuel} {selectedMed.unite}
          </div>
        )}
        <Field label="Quantité *"><input className={inp} type="number" min="1" max={selectedMed?.stockActuel} value={quantite} onChange={e => setQuantite(e.target.value)} /></Field>
        {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || !medicamentId || !quantite} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Dispensation...' : 'Confirmer'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function AddCommandeModal({ meds, onClose, onSuccess }: { meds: Medicament[]; onClose: () => void; onSuccess: () => void }) {
  const [fournisseur, setFournisseur] = useState('')
  const [dateLivraison, setDateLivraison] = useState('')
  const [lignes, setLignes] = useState([{ medicamentId: '', quantiteCommandee: '', prixUnitaire: '' }])
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  function addLigne() { setLignes(l => [...l, { medicamentId: '', quantiteCommandee: '', prixUnitaire: '' }]) }
  function removeLigne(i: number) { setLignes(l => l.filter((_, idx) => idx !== i)) }
  function setLigne(i: number, k: string, v: string) { setLignes(l => l.map((line, idx) => idx === i ? { ...line, [k]: v } : line)) }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      await api.post('/pharmacie/commandes', { fournisseur, dateLivraisonPrevue: dateLivraison || null,
        lignes: lignes.filter(l => l.medicamentId && l.quantiteCommandee).map(l => ({ medicamentId: l.medicamentId, quantiteCommandee: Number(l.quantiteCommandee), prixUnitaire: l.prixUnitaire ? Number(l.prixUnitaire) : null })) })
      onSuccess()
    } catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }
  return (
    <ModalWrapper title="Nouvelle commande fournisseur" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Fournisseur *"><input className={inp} value={fournisseur} onChange={e => setFournisseur(e.target.value)} /></Field>
        <Field label="Date de livraison prévue"><input className={inp} type="date" value={dateLivraison} onChange={e => setDateLivraison(e.target.value)} /></Field>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-600 text-xs font-medium">Lignes de commande</label>
            <button type="button" onClick={addLigne} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" />Ajouter</button>
          </div>
          <div className="space-y-2">
            {lignes.map((l, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Ligne {i + 1}</span>
                  {lignes.length > 1 && <button type="button" onClick={() => removeLigne(i)} className="text-red-500 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>}
                </div>
                <Combobox options={meds.map(m => ({ value: m.id, label: m.nom, sub: `${m.stockActuel} ${m.unite} en stock` }))}
                  value={l.medicamentId} onChange={v => setLigne(i, 'medicamentId', v || '')} placeholder="Médicament..." />
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} type="number" min="1" placeholder="Quantité" value={l.quantiteCommandee} onChange={e => setLigne(i, 'quantiteCommandee', e.target.value)} />
                  <input className={inp} type="number" min="0" step="0.01" placeholder="Prix unit. (HTG)" value={l.prixUnitaire} onChange={e => setLigne(i, 'prixUnitaire', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {err && <p className="text-red-500 text-xs">{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || !fournisseur || lignes.every(l => !l.medicamentId)}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Création...' : 'Créer la commande'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function DispenserDirectModal({ meds, onClose, onSuccess }: { meds: Medicament[]; onClose: () => void; onSuccess: () => void }) {
  const [medicamentId, setMedicamentId] = useState('')
  const [quantite, setQuantite]         = useState('')
  const [patientLabel, setPatientLabel] = useState('')
  const [raison, setRaison]             = useState('')
  const [patients, setPatients]         = useState<{ value: string; label: string }[]>([])
  const [saving, setSaving]             = useState(false)
  const [err, setErr]                   = useState('')

  useEffect(() => {
    api.get('/patients', { params: { limit: 200, actif: true } })
      .then(r => setPatients((r.data.data ?? []).map((p: any) => ({ value: p.id, label: `${p.prenom} ${p.nom} — ${p.numero}` }))))
      .catch(() => {})
  }, [])

  const selectedMed = meds.find(m => m.id === medicamentId)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      const note = raison.trim() || (patientLabel ? `Patient : ${patientLabel}` : 'Dispensation directe')
      await api.post('/pharmacie/dispenser-direct', { medicamentId, quantite: Number(quantite), raison: note })
      onSuccess()
    } catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }

  return (
    <ModalWrapper title="Dispensation ambulatoire" onClose={onClose}>
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 shrink-0" />
        Pour les patients externes, ordonnances libres ou vente directe
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Patient (optionnel)">
          <Combobox
            options={patients}
            value=""
            onChange={v => setPatientLabel(patients.find(p => p.value === v)?.label ?? '')}
            placeholder="Rechercher un patient..."
          />
          {patientLabel && <p className="text-xs text-slate-500 mt-1">Sélectionné : {patientLabel}</p>}
        </Field>
        <Field label="Médicament *">
          <Combobox
            options={meds.filter(m => m.actif && m.stockActuel > 0).map(m => ({ value: m.id, label: m.nom, sub: `${m.stockActuel} ${m.unite}${m.dci ? ' · ' + m.dci : ''}` }))}
            value={medicamentId}
            onChange={v => setMedicamentId(v || '')}
            placeholder="Sélectionner..."
          />
        </Field>
        {selectedMed && (
          <div className={`text-xs px-3 py-2 rounded-lg border ${selectedMed.stockActuel <= selectedMed.seuilAlerte ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            Stock disponible : {selectedMed.stockActuel} {selectedMed.unite}
          </div>
        )}
        <Field label={`Quantité${selectedMed ? ` (${selectedMed.unite})` : ''} *`}>
          <input className={inp} type="number" min="1" max={selectedMed?.stockActuel} value={quantite} onChange={e => setQuantite(e.target.value)} />
        </Field>
        <Field label="Note / motif">
          <input className={inp} value={raison} onChange={e => setRaison(e.target.value)} placeholder={patientLabel ? `Patient : ${patientLabel}` : 'ex: Ordonnance externe, vente...'} />
        </Field>
        {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm">Annuler</button>
          <button type="submit" disabled={saving || !medicamentId || !quantite}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
            {saving ? 'Dispensation...' : 'Confirmer'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function ReceptionCommandeBtn({ cmd, onDone }: { cmd: CommandeFournisseur; onDone: () => void }) {
  const [open, setOpen]     = useState(false)
  const [recues, setRecues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function confirmer(statut: string) {
    setSaving(true)
    try {
      await api.patch(`/pharmacie/commandes/${cmd.id}`, {
        statut,
        lignesRecues: cmd.lignes.map(l => ({ id: l.id, medicamentId: l.medicamentId, quantiteRecue: Number(recues[l.id] || 0) })),
      })
      setOpen(false); onDone()
    } catch {}
    finally { setSaving(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
      Réceptionner
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-slate-900 font-semibold">Réception — {cmd.numero}</h2>
          <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-3">
          {cmd.lignes.map(l => (
            <div key={l.id} className="flex items-center gap-3">
              <div className="flex-1 text-sm text-slate-700">{l.medicament.nom}</div>
              <div className="text-xs text-slate-400">/{l.quantiteCommandee}</div>
              <input type="number" min="0" max={l.quantiteCommandee} placeholder="0"
                value={recues[l.id] || ''} onChange={e => setRecues(r => ({ ...r, [l.id]: e.target.value }))}
                className="w-24 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          ))}
          <div className="flex gap-2 pt-3">
            <button onClick={() => confirmer('RECU_PARTIEL')} disabled={saving} className="flex-1 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-sm font-medium">Partielle</button>
            <button onClick={() => confirmer('RECU')} disabled={saving} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">{saving ? '...' : 'Complète'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
