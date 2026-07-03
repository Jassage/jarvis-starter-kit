'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  // API Leaflet impérative plutôt que <MapContainer> (react-leaflet) : le
  // callback ref interne de MapContainer relit un state figé par closure et
  // peut appeler `new L.Map(node)` deux fois sur le même nœud sous le mode
  // "reappear" de Next.js 15 dev, avant qu'un effet de nettoyage ne s'exécute
  // ("Map container is already initialized", reproductible dès le premier
  // montage). Une garde useRef sur l'instance L.Map contourne le problème.
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup(title);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- création unique ; les changements sont suivis ci-dessous
  }, []);

  // Recentre / déplace le marker si les coordonnées ou le titre changent sans recréer la carte.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([lat, lng], 15);
    markerRef.current?.setLatLng([lat, lng]).setPopupContent(title);
  }, [lat, lng, title]);

  return <div ref={containerRef} className="h-64 w-full rounded-lg z-0" style={{ height: '256px' }} />;
}
