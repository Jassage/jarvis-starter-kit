"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { documentsApi, mediaUrl } from "@/lib/api";

interface Media {
  url: string;
  nomOriginal: string;
  tailleOctets: number;
  mimeType: string;
}

interface DocumentFichier {
  id: string;
  titre: string;
  description: string | null;
  media: Media;
}

function formaterTaille(octets: number) {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsSection() {
  const [documents, setDocuments] = useState<DocumentFichier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentsApi
      .list()
      .then(({ data }) => setDocuments(data.data.documents))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">Chargement...</div>
      </section>
    );
  }

  if (documents.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          Aucun document disponible pour le moment.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-3">
          {documents.map((d) => (
            <a
              key={d.id}
              href={mediaUrl(d.media.url)}
              target="_blank"
              rel="noopener noreferrer"
              download={d.media.nomOriginal}
              className="flex items-center gap-4 bg-gray-50 hover:bg-green-50 rounded-2xl p-5 border border-gray-100 hover:border-green-200 transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm">{d.titre}</h3>
                {d.description && <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>}
                <p className="text-[11px] text-gray-400 mt-1">{formaterTaille(d.media.tailleOctets)}</p>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
