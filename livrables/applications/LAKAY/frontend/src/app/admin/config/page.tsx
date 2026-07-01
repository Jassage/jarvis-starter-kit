'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

export default function AdminConfigPage() {
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => adminApi.getConfig(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateConfig(key, value),
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

  const configs = data?.data?.configs || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuration</h1>
        <p className="text-sm text-gray-500">Paramètres de la plateforme</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {configs.map((config: { key: string; value: string; label: string }) => {
            const currentValue = editValues[config.key] ?? config.value;
            const isDirty = currentValue !== config.value;

            return (
              <div key={config.key} className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{config.label}</p>
                  <p className="text-xs text-gray-400 font-mono">{config.key}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    value={currentValue}
                    onChange={e => setEditValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  {savedKeys.has(config.key) ? (
                    <span className="text-xs text-green-600 font-medium w-20 text-center">✓ Sauvegardé</span>
                  ) : (
                    <button
                      onClick={() => updateMutation.mutate({ key: config.key, value: currentValue })}
                      disabled={!isDirty || updateMutation.isPending}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors w-20"
                    >
                      Sauvegarder
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
