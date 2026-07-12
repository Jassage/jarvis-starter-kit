'use client';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  PIECE_IDENTITE: "Pièce d'identité",
  JUSTIFICATIF_DOMICILE: 'Justificatif de domicile',
  CONTRAT: 'Contrat',
  AUTRE: 'Autre',
};

const STATUT_META: Record<string, { label: string; color: string; bg: string }> = {
  ACTIF:   { label: 'Actif',   color: '#047857', bg: '#ecfdf5' },
  EXPIRE:  { label: 'Expiré',  color: '#b91c1c', bg: '#fef2f2' },
  ARCHIVE: { label: 'Archivé', color: '#6b7280', bg: '#f3f4f6' },
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001').replace(/\/api\/?$/, '');

interface DocumentItem {
  id: string;
  type: string;
  nomFichier: string;
  cheminFichier: string;
  dateExpiration?: string | null;
  statut: string;
  createdAt: string;
  creePar: { nom: string; prenom: string };
}

export default function ClientDocuments({ clientId }: { clientId: string }) {
  const { utilisateur } = useAuthStore();
  const canDelete = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'].includes(utilisateur?.role || '');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('PIECE_IDENTITE');
  const [dateExpiration, setDateExpiration] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/clients/${clientId}/documents`);
      setDocuments(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [clientId]);

  const resetForm = () => {
    setType('PIECE_IDENTITE'); setDateExpiration(''); setFile(null); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) { setError('Sélectionnez un fichier'); return; }
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('fichier', file);
      form.append('type', type);
      if (dateExpiration) form.append('dateExpiration', new Date(dateExpiration).toISOString());
      await api.post(`/clients/${clientId}/documents`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      resetForm();
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await api.delete(`/clients/documents/${id}`);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold" style={{ color: '#0b1733' }}>Documents ({documents.length})</h3>
        <button onClick={() => { setShowForm(true); resetForm(); }} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors" style={{ background: '#eef2ff', color: '#2563eb' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          Ajouter
        </button>
      </div>

      {loading ? (
        <p className="text-xs" style={{ color: '#8b94b0' }}>Chargement...</p>
      ) : documents.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: '#8b94b0' }}>Aucun document</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const meta = STATUT_META[doc.statut] || STATUT_META.ACTIF;
            return (
              <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: '#f7f8fc', border: '1px solid #f0f2f9' }}>
                <a href={`${API_BASE}${doc.cheminFichier}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 min-w-0 flex-1">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#4a5578' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: '#0b1733' }}>{TYPE_LABELS[doc.type] || doc.type}</p>
                    <p className="text-[10px] truncate" style={{ color: '#8b94b0' }}>
                      {doc.nomFichier}
                      {doc.dateExpiration && ` · expire le ${formatDate(doc.dateExpiration)}`}
                    </p>
                  </div>
                </a>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  {canDelete && (
                    <button onClick={() => handleDelete(doc.id)} style={{ color: '#b91c1c' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ color: '#0b1733' }}>Ajouter un document</h3>
              <button onClick={() => setShowForm(false)} style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Type de document</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="input w-full">
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Fichier (JPEG, PNG, WebP ou PDF, 10 Mo max)</label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input w-full" />
              </div>
              <div>
                <label className="label">Date d'expiration (optionnel)</label>
                <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} className="input w-full" min={new Date().toISOString().split('T')[0]} />
              </div>
              {error && <div className="p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#b91c1c' }}>{error}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f7f8fc', color: '#4a5578' }}>Annuler</button>
                <button onClick={handleUpload} disabled={uploading} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {uploading && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
