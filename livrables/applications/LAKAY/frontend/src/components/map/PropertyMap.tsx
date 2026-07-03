'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  // On récupère l'instance Leaflet via ref et on la détruit proprement au démontage.
  // Corrige "Map container is already initialized" causé par le double-mount de
  // React StrictMode (dev) : sans remove(), le nœud DOM garde son _leaflet_id.
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (!map) return;
    return () => { map.remove(); };
  }, [map]);

  return (
    <MapContainer
      // key par coordonnées : une nouvelle carte est créée à chaque annonce
      key={`${lat},${lng}`}
      ref={setMap}
      center={[lat, lng]}
      zoom={15}
      className="h-64 w-full rounded-lg z-0"
      scrollWheelZoom={false}
      style={{ height: '256px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <RecenterMap lat={lat} lng={lng} />
      <Marker position={[lat, lng]}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  );
}
