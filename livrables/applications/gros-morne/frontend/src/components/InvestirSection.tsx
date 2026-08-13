import { CheckCircle2, Sprout, Building2, Mountain, Store, Factory, ArrowRight, Phone, Mail } from "lucide-react";

const opportunites = [
  { icon: Sprout, titre: "Agriculture", desc: "Terres fertiles, café, canne à sucre, mangue francisque et cultures vivrières à fort potentiel d'exportation." },
  { icon: Building2, titre: "Immobilier", desc: "Une demande croissante en logements et locaux commerciaux dans un centre-ville en expansion." },
  { icon: Mountain, titre: "Tourisme", desc: "Un potentiel touristique encore peu exploité : nature, patrimoine et culture vivante." },
  { icon: Store, titre: "Commerce", desc: "Un marché local actif et une position stratégique dans l'Artibonite." },
  { icon: Factory, titre: "Industrie", desc: "Transformation agroalimentaire et artisanat, secteurs porteurs pour la création d'emplois locaux." },
];

const raisons = [
  "Potentiel agricole exceptionnel",
  "Secteur touristique en expansion",
  "Main-d'œuvre jeune et dynamique",
  "Accompagnement des investisseurs",
  "Environnement stable et sécurisé",
];

export default function InvestirSection() {
  return (
    <section className="bg-white">
      {/* Pourquoi investir */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-20">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5">
              Investir à <span className="gradient-text">Gros-Morne</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Des opportunités uniques attendent les investisseurs sérieux dans une commune
              accueillante, dotée de ressources naturelles abondantes et d&apos;une population
              motivée à bâtir un avenir meilleur.
            </p>
            <ul className="flex flex-col gap-3">
              {raisons.map((r) => (
                <li key={r} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl overflow-hidden h-80 relative bg-gradient-to-br from-green-800 via-green-900 to-black" />
        </div>

        {/* Secteurs */}
        <h3 className="text-xl font-black text-gray-900 mb-6">Secteurs d&apos;opportunités</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-20">
          {opportunites.map(({ icon: Icon, titre, desc }) => (
            <div key={titre} className="bg-gray-50 rounded-2xl p-6 hover:bg-green-50 transition-colors card-hover">
              <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">{titre}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Procédures */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-3xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">Procédures administratives</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              L&apos;équipe de la mairie accompagne chaque investisseur dans les démarches
              d&apos;enregistrement, de permis et de mise en conformité, en lien avec les
              autorités départementales.
            </p>
          </div>
          <div className="bg-green-700 rounded-3xl p-8 text-white">
            <h3 className="font-bold mb-3">Contacts utiles</h3>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Phone className="w-4 h-4" /> +509 1234 5678
            </div>
            <div className="flex items-center gap-2 text-sm mb-4">
              <Mail className="w-4 h-4" /> investir@grosmorne.ht
            </div>
            <a href="/contact" className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
              Nous contacter <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
