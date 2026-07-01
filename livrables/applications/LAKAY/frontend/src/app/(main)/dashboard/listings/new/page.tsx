'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { HAITI_COMMUNES, DEPARTMENT_OPTIONS } from '@/lib/haiti-communes';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[220px] bg-gray-100 rounded-xl animate-pulse" />,
});

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

const formSchema = z.object({
  title: z.string().min(10, 'Minimum 10 caractères').max(150),
  description: z.string().min(50, 'Minimum 50 caractères').max(3000),
  propertyType: z.string().min(1, 'Sélectionnez un type'),
  listingType: z.enum(['RENT', 'SALE']),
  price: z.number().positive('Le prix doit être positif'),
  currency: z.enum(['HTG', 'USD']),
  priceNegotiable: z.boolean().optional(),
  department: z.string().min(1, 'Sélectionnez un département'),
  commune: z.string().min(2, 'Commune requise'),
  city: z.string().min(2, 'Ville requise'),
  neighborhood: z.string().optional(),
  landmark: z.string().min(10, 'Le point de repère est requis (minimum 10 caractères)'),
  bedrooms: z.preprocess(v => (typeof v === 'number' && isNaN(v) ? undefined : v), z.number().int().min(0).optional()),
  bathrooms: z.preprocess(v => (typeof v === 'number' && isNaN(v) ? undefined : v), z.number().int().min(0).optional()),
  area: z.preprocess(v => (typeof v === 'number' && isNaN(v) ? undefined : v), z.number().positive().optional()),
  floor: z.preprocess(v => (typeof v === 'number' && isNaN(v) ? undefined : v), z.number().int().min(0).optional()),
  hasWater: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasCistern: z.boolean().optional(),
  hasGenerator: z.boolean().optional(),
  hasSolarPanel: z.boolean().optional(),
  hasInternet: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasAC: z.boolean().optional(),
  isFurnished: z.boolean().optional(),
  hasSecurity: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasMountainView: z.boolean().optional(),
  hasSeaView: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  isAvailableNow: z.boolean().optional(),
  latitude: z.preprocess(v => (typeof v === 'number' && isNaN(v) ? undefined : v), z.number().min(-90).max(90).optional()),
  longitude: z.preprocess(v => (typeof v === 'number' && isNaN(v) ? undefined : v), z.number().min(-180).max(180).optional()),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = ['Informations générales', 'Localisation', 'Caractéristiques', 'Photos'];

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listingType: 'RENT',
      currency: 'HTG',
      isAvailableNow: true,
    },
    mode: 'onChange',
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await listingsApi.createListing(data);
      const listingId = response.data.data.listing.id;

      if (images.length > 0) {
        setUploadingImages(true);
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        await listingsApi.uploadImages(listingId, formData);
        setUploadingImages(false);
      }

      return response;
    },
    onSuccess: (response) => {
      router.push(`/dashboard/listings?created=${response.data.data.listing.id}`);
    },
  });

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 20) {
      alert('Maximum 20 photos');
      return;
    }
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [images]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const onError = (errs: FieldErrors<FormData>) => {
    const stepFields: (keyof FormData)[][] = [
      ['title', 'description', 'propertyType', 'listingType', 'price', 'currency'],
      ['department', 'commune', 'city', 'landmark'],
      ['bedrooms', 'bathrooms', 'area'],
    ];
    for (let i = 0; i < stepFields.length; i++) {
      if (stepFields[i].some(f => f in errs)) { setStep(i); return; }
    }
  };

  const isLastStep = step === STEPS.length - 1;

  const amenities = [
    { key: 'hasWater', label: 'Eau courante' },
    { key: 'hasElectricity', label: 'Électricité' },
    { key: 'hasCistern', label: 'Citerne' },
    { key: 'hasGenerator', label: 'Groupe électrogène' },
    { key: 'hasSolarPanel', label: 'Panneau solaire' },
    { key: 'hasInternet', label: 'Internet' },
    { key: 'hasParking', label: 'Parking' },
    { key: 'hasPool', label: 'Piscine' },
    { key: 'hasAC', label: 'Climatisation' },
    { key: 'isFurnished', label: 'Meublé' },
    { key: 'hasSecurity', label: 'Sécurité / Gardien' },
    { key: 'hasGarden', label: 'Jardin' },
    { key: 'hasMountainView', label: 'Vue montagne' },
    { key: 'hasSeaView', label: 'Vue mer' },
    { key: 'petsAllowed', label: 'Animaux acceptés' },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <Link href="/dashboard/listings" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mes annonces
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle annonce</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              i < step ? 'bg-green-500 text-white' :
              i === step ? 'bg-primary text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* Step 0: Informations générales */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'annonce *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['RENT', 'SALE'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('listingType', type as 'RENT' | 'SALE')}
                      className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                        watch('listingType') === type
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type === 'RENT' ? 'Location' : 'Vente'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien *</label>
                <select
                  {...register('propertyType')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">Sélectionner...</option>
                  {PROPERTY_TYPES.map(pt => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
                {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce *</label>
              <input
                {...register('title')}
                placeholder="Ex: Belle villa 4 chambres avec piscine à Pétion-Ville"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Décrivez le bien en détail : état, équipements, accès, avantages..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise *</label>
                <select
                  {...register('currency')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
          </div>
        )}

        {/* Step 1: Localisation */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Département *</label>
                <select
                  {...register('department')}
                  onChange={(e) => {
                    setValue('department', e.target.value, { shouldValidate: true });
                    setValue('commune', '', { shouldValidate: false });
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">Sélectionner un département...</option>
                  {DEPARTMENT_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commune *</label>
                {watch('department') ? (
                  <select
                    {...register('commune')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">Sélectionner une commune...</option>
                    {HAITI_COMMUNES[watch('department')]?.communes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400">
                    Choisissez d'abord un département
                  </div>
                )}
                {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input
                  {...register('city')}
                  placeholder="Ex: Port-au-Prince"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier / Zone</label>
                <input
                  {...register('neighborhood')}
                  placeholder="Ex: Laboule 12"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point de repère *
                <span className="text-gray-400 font-normal ml-2 text-xs">(Indispensable en Haïti)</span>
              </label>
              <textarea
                {...register('landmark')}
                rows={3}
                placeholder="Ex: En face de la station Total Laboule, 200m vers la montagne, portail rouge"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
              {errors.landmark && <p className="text-red-500 text-xs mt-1">{errors.landmark.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Soyez précis : les adresses numériques n'existent souvent pas en Haïti.</p>
            </div>

            {/* Coordonnées GPS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Coordonnées GPS
                  <span className="text-gray-400 font-normal ml-2 text-xs">(optionnel — active la carte sur la page annonce)</span>
                </label>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-500 hover:underline"
                >
                  Ouvrir Google Maps →
                </a>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Cliquez sur la carte pour placer le marqueur, ou saisissez les coordonnées manuellement.
                Sur Google Maps : clic droit sur le lieu → "C'est ici" → copier lat, lng.
              </p>
              <MapPicker
                lat={watch('latitude')}
                lng={watch('longitude')}
                onChange={(lat, lng) => {
                  setValue('latitude', lat, { shouldValidate: true });
                  setValue('longitude', lng, { shouldValidate: true });
                }}
              />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    {...register('latitude', { valueAsNumber: true })}
                    placeholder="Ex: 18.543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    {...register('longitude', { valueAsNumber: true })}
                    placeholder="Ex: -72.338900"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              {(watch('latitude') || watch('longitude')) && (
                <button
                  type="button"
                  onClick={() => { setValue('latitude', undefined); setValue('longitude', undefined); }}
                  className="mt-2 text-xs text-red-400 hover:text-red-600"
                >
                  Effacer les coordonnées
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Caractéristiques */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                <input
                  type="number"
                  min={0}
                  {...register('bedrooms', { valueAsNumber: true })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                <input
                  type="number"
                  min={0}
                  {...register('bathrooms', { valueAsNumber: true })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                <input
                  type="number"
                  min={0}
                  {...register('area', { valueAsNumber: true })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Équipements et commodités</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      {...register(key as keyof FormData)}
                      className="rounded border-gray-300 text-primary"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isAvailableNow')} className="rounded border-gray-300 text-primary" />
              <span className="text-sm text-gray-700">Disponible immédiatement</span>
            </label>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Photos de l'annonce</h3>
              <p className="text-xs text-gray-500 mb-4">
                Ajoutez jusqu'à 20 photos. Les annonces avec photos reçoivent 5x plus de contacts.
              </p>

              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <div className="flex flex-col items-center">
                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">Cliquez pour ajouter des photos</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10 MB chacune</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{imagePreviews.length} photo(s) sélectionnée(s)</p>
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-lg font-medium">
                          Principale
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Info :</strong> L'annonce sera sauvegardée comme brouillon. Vous pourrez la soumettre pour révision depuis votre tableau de bord.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {isLastStep ? (
            <button
              type="submit"
              disabled={createMutation.isPending || uploadingImages}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createMutation.isPending || uploadingImages ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {uploadingImages ? 'Upload photos...' : 'Enregistrement...'}
                </>
              ) : 'Enregistrer l\'annonce'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Suivant
            </button>
          )}
        </div>

        {createMutation.isError && (
          <p className="text-red-600 text-sm mt-3 text-center">
            Une erreur s'est produite. Vérifiez vos informations et réessayez.
          </p>
        )}
      </form>
    </div>
  );
}
