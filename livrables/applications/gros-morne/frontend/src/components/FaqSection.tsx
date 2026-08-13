"use client";

import { useEffect, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { faqApi } from "@/lib/api";

const LABELS_CATEGORIE: Record<string, string> = {
  TOURISME: "Tourisme",
  SERVICES: "Services",
  INVESTISSEMENT: "Investissements",
  DEMARCHES: "Démarches administratives",
  FONCTIONNEMENT_SITE: "Fonctionnement du site",
};

interface FaqTraduction {
  locale: string;
  question: string;
  reponse: string;
}

interface Faq {
  id: string;
  categorie: string;
  traductions: FaqTraduction[];
}

export default function FaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faqApi
      .list()
      .then(({ data }) => setFaqs(data.data.faqs))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">Chargement...</div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          Aucune question fréquente publiée pour le moment.
        </div>
      </section>
    );
  }

  const categories = Object.keys(LABELS_CATEGORIE).filter((cle) => faqs.some((f) => f.categorie === cle));

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {categories.map((categorie) => {
          const questions = faqs.filter((f) => f.categorie === categorie);
          return (
            <div key={categorie} className="mb-10">
              <h2 className="text-lg font-black text-gray-900 mb-4">{LABELS_CATEGORIE[categorie]}</h2>
              <Accordion.Root type="single" collapsible className="flex flex-col gap-2">
                {questions.map((faq) => {
                  const t = faq.traductions.find((tr) => tr.locale === "FR") ?? faq.traductions[0];
                  if (!t) return null;
                  return (
                    <Accordion.Item
                      key={faq.id}
                      value={faq.id}
                      className="bg-gray-50 rounded-2xl overflow-hidden data-[state=open]:bg-green-50"
                    >
                      <Accordion.Trigger className="group flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800">
                        {t.question}
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                      <Accordion.Content className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                        {t.reponse}
                      </Accordion.Content>
                    </Accordion.Item>
                  );
                })}
              </Accordion.Root>
            </div>
          );
        })}
      </div>
    </section>
  );
}
