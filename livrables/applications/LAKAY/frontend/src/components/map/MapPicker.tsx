'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6)),
      );
    },
  });
  return null;
}

interface MapPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

// Centre par défaut : Haïti
const HAITI_CENTER: [number, number] = [18.54, -72.33];

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      const el = wrapperRef.current?.querySelector('.leaflet-container') as (HTMLElement & { _leaflet_id?: unknown }) | null;
      if (el) delete el._leaflet_id;
    };
  }, []);

  const hasMarker = typeof lat === 'number' && typeof lng === 'number';
  const markerPos: [number, number] | null = hasMarker ? [lat!, lng!] : null;
  const center: [number, number] = markerPos ?? HAITI_CENTER;
  const zoom = markerPos ? 14 : 8;

  return (
    <div ref={wrapperRef} className="rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full"
        scrollWheelZoom={false}
        style={{ height: '220px', cursor: 'crosshair' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onChange={onChange} />
        {markerPos && <Marker position={markerPos} />}
      </MapContainer>
    </div>
  );
}
