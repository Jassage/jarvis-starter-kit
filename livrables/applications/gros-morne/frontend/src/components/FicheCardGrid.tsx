import type { LucideIcon } from "lucide-react";
import { Phone, MapPin, Clock } from "lucide-react";

export interface Fiche {
  icon: LucideIcon;
  titre: string;
  sousTitre?: string;
  description: string;
  adresse?: string;
  telephone?: string;
  horaires?: string;
}

export default function FicheCardGrid({ fiches, accent = "green" }: { fiches: Fiche[]; accent?: "green" | "amber" | "sky" | "rose" }) {
  const accentClasses: Record<string, string> = {
    green: "bg-green-700",
    amber: "bg-amber-600",
    sky: "bg-sky-700",
    rose: "bg-rose-600",
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fiches.map(({ icon: Icon, titre, sousTitre, description, adresse, telephone, horaires }) => (
            <div key={titre} className="bg-gray-50 rounded-3xl p-7 card-hover">
              <div className={`w-12 h-12 rounded-2xl ${accentClasses[accent]} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {sousTitre && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{sousTitre}</span>
              )}
              <h3 className="font-bold text-gray-900 mb-2 mt-0.5">{titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{description}</p>
              <div className="flex flex-col gap-1.5">
                {adresse && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin className="w-3 h-3 shrink-0" /> {adresse}
                  </div>
                )}
                {telephone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Phone className="w-3 h-3 shrink-0" /> {telephone}
                  </div>
                )}
                {horaires && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3 shrink-0" /> {horaires}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
