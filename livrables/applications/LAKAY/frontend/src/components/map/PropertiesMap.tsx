'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPrice } from '../../lib/utils';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Centre par défaut : Haïti (même valeur que MapPicker, pour cohérence)
const HAITI_CENTER: [number, number] = [18.54, -72.33];

export interface MapListing {
  id: string;
  title: string;
  price: number | string;
  currency: 'HTG' | 'USD';
  latitude: number | string | null;
  longitude: number | string | null;
  images?: Array<{ url: string; alt?: string }>;
}

interface PropertiesMapProps {
  listings: MapListing[];
}

export default function PropertiesMap({ listings }: PropertiesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // API Leaflet impérative plutôt que <MapContainer> déclaratif : le callback
  // ref interne de react-leaflet 4.x relit un `context` figé par closure et
  // peut appeler `new L.Map(node)` deux fois sur le même nœud sous le mode
  // "reappear" de Next.js 15 dev, avant qu'un effet de nettoyage ne s'exécute
  // ("Map container is already initialized"). Une garde `useRef` (mutation
  // synchrone, jamais réinitialisée entre deux appels rapprochés) contourne
  // le problème de façon fiable.
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const unlocatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView(HAITI_CENTER, 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const located = listings
      .map((l) => ({ listing: l, lat: l.latitude != null ? Number(l.latitude) : null, lng: l.longitude != null ? Number(l.longitude) : null }))
      .filter((l): l is { listing: MapListing; lat: number; lng: number } => l.lat != null && l.lng != null && !Number.isNaN(l.lat) && !Number.isNaN(l.lng));

    for (const { listing, lat, lng } of located) {
      const image = listing.images?.[0]?.url;
      const popupHtml = `
        <a href="/properties/${listing.id}" style="display:block;text-decoration:none;color:inherit;">
          ${image ? `<img src="${image}" alt="" style="width:100%;height:96px;object-fit:cover;border-radius:4px;margin-bottom:6px;" />` : ''}
          <p style="font-size:12px;font-weight:600;color:#111827;line-height:1.2;margin:0 0 2px;">${escapeHtml(listing.title)}</p>
          <p style="font-size:12px;font-weight:700;color:var(--color-primary-600,#EA580C);margin:0;">${formatPrice(listing.price, listing.currency)}</p>
        </a>
      `;
      const marker = L.marker([lat, lng]).addTo(map).bindPopup(popupHtml, { minWidth: 180 });
      markersRef.current.push(marker);
    }

    if (located.length === 1) {
      map.setView([located[0].lat, located[0].lng], 14);
    } else if (located.length > 1) {
      map.fitBounds(located.map((l) => [l.lat, l.lng] as [number, number]), { padding: [40, 40], maxZoom: 15 });
    }

    const unlocatedCount = listings.length - located.length;
    if (unlocatedRef.current) {
      unlocatedRef.current.textContent = unlocatedCount > 0
        ? `${unlocatedCount} annonce${unlocatedCount > 1 ? 's' : ''} sans localisation non affichée${unlocatedCount > 1 ? 's' : ''}`
        : '';
      unlocatedRef.current.style.display = unlocatedCount > 0 ? 'block' : 'none';
    }
  }, [listings]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[560px] w-full rounded-xl z-0" />
      <div
        ref={unlocatedRef}
        className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-gray-500 shadow-sm border border-gray-200"
        style={{ display: 'none' }}
      />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
