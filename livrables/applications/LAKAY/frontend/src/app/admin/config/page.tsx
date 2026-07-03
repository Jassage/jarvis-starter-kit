'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

interface Config { key: string; value: string; label?: string }

// Champs de paiement gérés explicitement (créés s'ils n'existent pas encore)
const PAYMENT_FIELDS = [
  { key: 'PAYMENT_MONCASH_NUMBER', label: 'Numéro MonCash', placeholder: '+509 0000-0000' },
  { key: 'PAYMENT_MONCASH_NAME', label: 'Nom du compte MonCash', placeholder: 'LAKAY' },
  { key: 'PAYMENT_NATCASH_NUMBER', label: 'Numéro NatCash', placeholder: '+509 0000-0000' },
  { key: 'PAYMENT_NATCASH_NAME', label: 'Nom du compte NatCash', placeholder: 'LAKAY' },
];
const PAYMENT_KEYS = new Set(PAYMENT_FIELDS.map(f => f.key));

export default function AdminConfigPage() {
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => adminApi.getConfig().then(r => r.data.data as { configs: Config[] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value, label }: { key: string; value: string; label?: string }) =>
      adminApi.updateConfig(key, value, label),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
      setSavedKeys(prev => new Set([...prev, variables.key]));
      setTimeout(() => {
        setSavedKeys(prev => {
          const next = new Set(prev);
          next.delete(variables.key);
          return next;
        });
      }, 2000);
    },
  });

  const configs: Config[] = data?.configs || [];
  const byKey = Object.fromEntries(configs.map(c => [c.key, c]));
  // Les autres paramètres (hors numéros de paiement) restent dans la liste générique
  const otherConfigs = configs.filter(c => !PAYMENT_KEYS.has(c.key));

  const save = (key: string, label?: string) => {
    const storedValue = byKey[key]?.value ?? '';
    const value = editValues[key] ?? storedValue;
    updateMutation.mutate({ key, value, label });
  };

  const renderRow = (key: string, label: string, placeholder?: string) => {
    const storedValue = byKey[key]?.value ?? '';
    const currentValue = editValues[key] ?? storedValue;
    const isDirty = currentValue !== storedValue;
    return (
      <div key={key} className="flex items-center justify-between gap-4 p-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-400 font-mono">{key}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            value={currentValue}
            placeholder={placeholder}
            onChange={e => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
            className="w-44 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
          {savedKeys.has(key) ? (
            <span className="text-xs text-green-600 font-medium w-20 text-center">✓ Sauvegardé</span>
          ) : (
            <button
              onClick={() => save(key, label)}
              disabled={!isDirty || updateMutation.isPending}
              className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors w-20"
            >
              Sauvegarder
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuration</h1>
        <p className="text-sm text-gray-500">Paramètres de la plateforme</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <>
          {/* Numéros de paiement (toujours affichés, créés si absents) */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Numéros de paiement</h2>
            <p className="text-xs text-gray-500 mb-3">
              Ces numéros sont affichés aux utilisateurs au moment de payer un abonnement (MonCash / NatCash).
            </p>
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {PAYMENT_FIELDS.map(f => renderRow(f.key, f.label, f.placeholder))}
            </div>
          </div>

          {/* Autres paramètres système existants */}
          {otherConfigs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Autres paramètres</h2>
              <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                {otherConfigs.map(c => renderRow(c.key, c.label || c.key))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
