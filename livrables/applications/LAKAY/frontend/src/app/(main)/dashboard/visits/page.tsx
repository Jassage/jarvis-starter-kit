'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsApi } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle2, XCircle, Home } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Confirmée',  color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  CANCELLED: { label: 'Annulée',    color: 'bg-red-100 text-red-700',       icon: XCircle },
  COMPLETED: { label: 'Effectuée',  color: 'bg-blue-100 text-blue-700',     icon: CheckCircle2 },
  NO_SHOW:   { label: 'Non présenté', color: 'bg-gray-100 text-gray-600',   icon: XCircle },
};

export default function VisitsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');

  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ['visits-sent'],
    queryFn: () => visitsApi.getMy(),
  });

  const { data: receivedData, isLoading: receivedLoading } = useQuery({
    queryKey: ['visits-received'],
    queryFn: () => visitsApi.getReceived(),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'CONFIRMED' | 'CANCELLED' }) => {
      const note = status === 'CANCELLED' ? prompt('Motif (optionnel) :') || undefined : undefined;
      return visitsApi.respond(id, status, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits-received'] });
    },
  });

  const sentVisits  = sentData?.data?.visits || [];
  const receivedVisits = receivedData?.data?.visits || [];
  const isLoading = tab === 'sent' ? sentLoading : receivedLoading;
  const visits    = tab === 'sent' ? sentVisits : receivedVisits;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visites</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos demandes de visite</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {([
          { key: 'sent',     label: `Envoyées (${sentVisits.length})` },
          { key: 'received', label: `Reçues (${receivedVisits.length})` },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-14 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Aucune visite {tab === 'sent' ? 'envoyée' : 'reçue'}</p>
          {tab === 'sent' && (
            <Link href="/properties" className="mt-3 inline-block text-primary-500 text-sm hover:underline">
              Parcourir les annonces →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit: {
            id: string;
            status: keyof typeof STATUS_CONFIG;
            proposedDate: string;
            message?: string;
            ownerNote?: string;
            listing?: { id: string; title: string; city: string; images?: Array<{ url: string }> };
            requester?: { firstName: string; lastName: string; phone?: string; email: string };
          }) => {
            const cfg = STATUS_CONFIG[visit.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            return (
              <div key={visit.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  {/* Image du bien */}
                  {visit.listing && (
                    <Link href={`/properties/${visit.listing.id}`} className="w-16 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {visit.listing.images?.[0] ? (
                        <img src={visit.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Home className="w-6 h-6" />
                        </div>
                      )}
                    </Link>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {visit.listing && (
                          <Link href={`/properties/${visit.listing.id}`} className="font-semibold text-gray-900 text-sm hover:text-primary-500 transition-colors line-clamp-1">
                            {visit.listing.title}
                          </Link>
                        )}
                        {tab === 'received' && visit.requester && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Demandé par {visit.requester.firstName} {visit.requester.lastName}
                            {visit.requester.phone && ` · ${visit.requester.phone}`}
                          </p>
                        )}
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(visit.proposedDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>

                    {visit.message && (
                      <p className="text-xs text-gray-500 mt-1.5 italic">"{visit.message}"</p>
                    )}
                    {visit.ownerNote && (
                      <p className="text-xs text-gray-600 mt-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        Note : {visit.ownerNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions (pour les visites reçues en attente) */}
                {tab === 'received' && visit.status === 'PENDING' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => respondMutation.mutate({ id: visit.id, status: 'CONFIRMED' })}
                      disabled={respondMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmer
                    </button>
                    <button
                      onClick={() => respondMutation.mutate({ id: visit.id, status: 'CANCELLED' })}
                      disabled={respondMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
