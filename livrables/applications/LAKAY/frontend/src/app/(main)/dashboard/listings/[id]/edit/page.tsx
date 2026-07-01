'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { listingsApi } from '@/lib/api';
import { HAITI_COMMUNES, DEPARTMENT_OPTIONS } from '@/lib/haiti-communes';
import { ArrowLeft, Save, Trash2, Upload, Star } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'ROOM', label: 'Chambre' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Local commercial' },
  { value: 'OFFICE', label: 'Bureau' },
  { value: 'WAREHOUSE', label: 'Entrepôt' },
];

interface ExistingImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['listing-edit', id],
    queryFn: () => listingsApi.getById(id).then(r => r.data.data.listing),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<Record<string, unknown>>();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const selectedDept = watch('department') as string | undefined;

  const updateMutation = useMutation({
    mutationFn: async (formData: Record<string, unknown>) => {
      const ALLOWED = [
        'title', 'description', 'propertyType', 'listingType', 'price', 'currency',
        'priceNegotiable', 'monthlyCharges', 'department', 'commune', 'city',
        'neighborhood', 'address', 'landmark', 'latitude', 'longitude', 'googleMapsUrl',
        'bedrooms', 'bathrooms', 'area', 'floor', 'totalFloors', 'yearBuilt',
        'parkingSpaces', 'hasWater', 'hasElectricity', 'hasGenerator', 'hasSolarPanel',
        'hasCistern', 'hasInternet', 'hasParking', 'hasPool', 'hasAC', 'isFurnished',
        'petsAllowed', 'hasSecurity', 'hasSeaView', 'hasMountainView', 'isAvailableNow',
        'hasBalcony', 'hasGarden', 'virtualTourUrl', 'agencyId',
      ];
      const payload: Record<string, unknown> = {};
      for (const key of ALLOWED) {
        const val = formData[key];
        if (val !== null && val !== undefined && val !== '') payload[key] = val;
      }
      await listingsApi.update(id, payload);

      if (newFiles.length > 0) {
        setUploadingImages(true);
        const fd = new FormData();
        newFiles.forEach(f => fd.append('images', f));
        await listingsApi.uploadImages(id, fd);
        setUploadingImages(false);
        setNewFiles([]);
        setNewPreviews([]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-edit', id] });
      router.push('/dashboard/listings');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => {
      setDeletingImageId(imageId);
      return listingsApi.deleteImage(id, imageId);
    },
    onSuccess: () => {
      setDeletingImageId(null);
      queryClient.invalidateQueries({ queryKey: ['listing-edit', id] });
    },
    onError: () => setDeletingImageId(null),
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingCount = data?.images?.length ?? 0;
    if (files.length + newFiles.length + existingCount > 20) {
      alert('Maximum 20 photos par annonce');
      return;
    }
    setNewFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, [newFiles, data?.images]);

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-3">Annonce introuvable ou accès refusé.</p>
        <Link href="/dashboard/listings" className="text-primary hover:underline">← Retour</Link>
      </div>
    );
  }
  if (data.status !== 'DRAFT') {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <p className="text-gray-700 font-medium mb-2">Modification impossible</p>
        <p className="text-gray-500 text-sm mb-4">
          Seules les annonces en brouillon peuvent être modifiées.<br />
          Statut actuel : <strong>{data.status}</strong>
        </p>
        <Link href="/dashboard/listings" className="text-primary hover:underline">← Retour à mes annonces</Link>
      </div>
    );
  }

  const existingImages: ExistingImage[] = data.images ?? [];
  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard/listings" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour à mes annonces
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'annonce</h1>
        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">Brouillon</span>
      </div>

      <form onSubmit={handleSubmit(d => updateMutation.mutate(d as Record<string, unknown>))} className="space-y-6">

        {/* Informations générales */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Informations générales</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
            <input
              {...register('title', { required: 'Titre requis' })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de bien</label>
              <select
                {...register('propertyType')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type d'annonce</label>
              <select
                {...register('listingType')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="RENT">Location</option>
                <option value="SALE">Vente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix *</label>
              <input
                type="number"
                min={0}
                {...register('price', { valueAsNumber: true, required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Devise</label>
              <select
                {...register('currency')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="HTG">HTG</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('priceNegotiable')} className="rounded border-gray-300 text-primary" />
            <span className="text-sm text-gray-700">Prix négociable</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea
              {...register('description', { required: 'Description requise' })}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Localisation</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Département *</label>
              <select
                {...register('department')}
                onChange={(e) => {
                  setValue('department', e.target.value, { shouldValidate: true, shouldDirty: true });
                  setValue('commune', '', { shouldDirty: true });
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Sélectionner...</option>
                {DEPARTMENT_OPTIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Commune *</label>
              {selectedDept && HAITI_COMMUNES[selectedDept] ? (
                <select
                  {...register('commune', { required: 'Commune requise' })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Sélectionner une commune...</option>
                  {HAITI_COMMUNES[selectedDept].communes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400">
                  Choisissez d'abord un département
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville *</label>
              <input
                {...register('city', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quartier / Zone</label>
              <input
                {...register('neighborhood')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Point de repère *
              <span className="text-gray-400 font-normal ml-2 text-xs">(Indispensable en Haïti)</span>
            </label>
            <textarea
              {...register('landmark', { required: 'Point de repère requis' })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Détails */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Caractéristiques</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chambres</label>
              <input type="number" min="0" {...register('bedrooms', { valueAsNumber: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Salles de bain</label>
              <input type="number" min="0" {...register('bathrooms', { valueAsNumber: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Surface (m²)</label>
              <input type="number" min="0" {...register('area', { valueAsNumber: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Photos</h2>
            <span className="text-xs text-gray-500">{totalImages} / 20</span>
          </div>

          {/* Photos existantes */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Photos actuelles</p>
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-primary text-white text-xs px-1.5 py-0.5 rounded-lg font-medium">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Principale</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImageMutation.mutate(img.id)}
                      disabled={deletingImageId === img.id}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-60"
                      title="Supprimer"
                    >
                      {deletingImageId === img.id ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouvelles photos à ajouter */}
          {newPreviews.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Nouvelles photos ({newPreviews.length}) — seront uploadées à la sauvegarde
              </p>
              <div className="grid grid-cols-4 gap-2">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl ring-2 ring-primary/40" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zone d'ajout */}
          {totalImages < 20 && (
            <label className="flex items-center justify-center gap-3 w-full py-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Ajouter des photos</p>
                <p className="text-xs text-gray-400">JPG, PNG, WebP — max 10 MB chacune</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}

          {existingImages.length === 0 && newFiles.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Au moins une photo est requise pour soumettre l'annonce à la révision.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard/listings"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={(!isDirty && newFiles.length === 0) || updateMutation.isPending || uploadingImages}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {uploadingImages ? 'Upload photos...' : updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        {updateMutation.isError && (
          <p className="text-red-600 text-sm text-center">
            Une erreur s'est produite. Vérifiez vos informations et réessayez.
          </p>
        )}
      </form>
    </div>
  );
}
