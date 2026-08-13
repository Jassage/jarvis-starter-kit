import { Heart, Users, Briefcase, Quote, ArrowRight } from "lucide-react";

const axes = [
  { icon: Heart, titre: "Dons & contributions", desc: "Soutenez des projets concrets : écoles, centres de santé, infrastructures communautaires." },
  { icon: Users, titre: "Associations de la diaspora", desc: "Rejoignez ou créez une association pour organiser l'entraide et les initiatives collectives." },
  { icon: Briefcase, titre: "Opportunités", desc: "Investissement, mentorat, transfert de compétences : votre expertise compte pour Gros-Morne." },
];

const temoignages = [
  { nom: "Marie-Claude, Miami", texte: "Je reste connectée à Gros-Morne grâce à ce portail. C'est précieux de suivre ce qui s'y passe au quotidien." },
  { nom: "Jean-Robert, Montréal", texte: "Nous avons financé la réhabilitation d'une école avec notre association. Voir le résultat en photos m'a beaucoup touché." },
];

export default function DiasporaSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {axes.map(({ icon: Icon, titre, desc }) => (
            <div key={titre} className="bg-gray-50 rounded-3xl p-7 card-hover">
              <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-6">Témoignages de la diaspora</h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {temoignages.map((t) => (
            <div key={t.nom} className="bg-green-950 text-white rounded-3xl p-8 relative overflow-hidden">
              <Quote className="w-8 h-8 text-green-500/40 mb-4" />
              <p className="text-white/80 text-sm leading-relaxed mb-4">&ldquo;{t.texte}&rdquo;</p>
              <p className="text-green-400 text-sm font-bold">— {t.nom}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h3 className="text-xl font-black mb-1">Envie de contribuer ?</h3>
            <p className="text-green-100 text-sm">Rejoignez la communauté et participez aux projets en cours.</p>
          </div>
          <a href="/communaute" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-green-800 font-bold text-sm hover:bg-green-50 transition-colors shrink-0">
            Rejoindre <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
