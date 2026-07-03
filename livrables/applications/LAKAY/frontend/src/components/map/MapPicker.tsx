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

interface MapPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

// Centre par défaut : Haïti
const HAITI_CENTER: [number, number] = [18.54, -72.33];

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  // API Leaflet impérative plutôt que <MapContainer> (react-leaflet) : le
  // callback ref interne de MapContainer relit un state figé par closure et
  // peut appeler `new L.Map(node)` deux fois sur le même nœud sous le mode
  // "reappear" de Next.js 15 dev, avant qu'un effet de nettoyage ne s'exécute
  // ("Map container is already initialized", reproductible dès le premier
  // montage). Une garde useRef sur l'instance L.Map contourne le problème.
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const hasMarker = typeof lat === 'number' && typeof lng === 'number';
    const center: [number, number] = hasMarker ? [lat!, lng!] : HAITI_CENTER;

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(center, hasMarker ? 14 : 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => {
      onChangeRef.current(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)));
    });
    if (hasMarker) markerRef.current = L.marker(center).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- création unique ; lat/lng suivis par l'effet ci-dessous
  }, []);

  // Suit les changements externes de lat/lng (reset du formulaire, etc.) sans recréer la carte.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const hasMarker = typeof lat === 'number' && typeof lng === 'number';
    if (!hasMarker) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const pos: [number, number] = [lat!, lng!];
    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      markerRef.current = L.marker(pos).addTo(map);
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-gray-200 w-full"
      style={{ height: '220px', cursor: 'crosshair' }}
    />
  );
}
