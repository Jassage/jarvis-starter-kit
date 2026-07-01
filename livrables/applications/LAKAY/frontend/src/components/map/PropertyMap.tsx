'use client';
import { useEffect, useRef } from 'react';
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Supprime _leaflet_id au cleanup pour éviter "Map container is already initialized"
      // causé par le double-mount de React StrictMode en développement
      const el = wrapperRef.current?.querySelector('.leaflet-container') as (HTMLElement & { _leaflet_id?: unknown }) | null;
      if (el) delete el._leaflet_id;
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <MapContainer
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
    </div>
  );
}
