"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Next.js/webpack cassent la résolution des icônes par défaut de Leaflet (chemins relatifs
// vers des fichiers jamais bundlés) — correctif standard, réinjecter les URLs manuellement.
function corrigerIconesLeaflet() {
  // @ts-expect-error propriété interne supprimée par le correctif lui-même
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export interface PointCarte {
  id: string;
  nom: string;
  categorie?: string;
  latitude: number;
  longitude: number;
}

export default function CarteInteractive({ points }: { points: PointCarte[] }) {
  useEffect(() => {
    corrigerIconesLeaflet();
  }, []);

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 h-80 flex items-center justify-center text-gray-400 text-sm">
        Aucun lieu géolocalisé pour le moment.
      </div>
    );
  }

  const centre: [number, number] = [
    points.reduce((s, p) => s + p.latitude, 0) / points.length,
    points.reduce((s, p) => s + p.longitude, 0) / points.length,
  ];

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white h-80 sm:h-96">
      <MapContainer center={centre} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]}>
            <Popup>
              <strong>{p.nom}</strong>
              {p.categorie && <div className="text-xs text-gray-500">{p.categorie}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
