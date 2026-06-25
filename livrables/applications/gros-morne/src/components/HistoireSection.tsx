"use client";

import { BookOpen, Calendar, Star } from "lucide-react";

const timeline = [
  {
    year: "Pré-1804",
    title: "Période coloniale",
    desc: "Durant la période coloniale française, la région de Gros-Morne était habitée par des esclaves africains travaillant les terres fertiles. La géographie montagneuse de la zone offrait des refuges naturels aux résistants.",
    color: "from-amber-500 to-orange-600",
  },
  {
    year: "1804",
    title: "Indépendance d'Haïti",
    desc: "Après la Révolution haïtienne, Gros-Morne devient une commune officielle. Les habitants, anciens esclaves libérés, s'établissent sur ces terres montagneuses et fondent une communauté forte.",
    color: "from-green-600 to-green-700",
  },
  {
    year: "XIXe siècle",
    title: "Développement agricole",
    desc: "Gros-Morne se distingue comme une zone agricole importante. Le café, la canne à sucre et les cultures vivrières font la prospérité de la région. La ville devient un centre commercial régional.",
    color: "from-blue-600 to-blue-700",
  },
  {
    year: "XXe siècle",
    title: "Croissance urbaine",
    desc: "La ville connaît une croissance démographique et urbaine significative. Des infrastructures scolaires, religieuses et administratives se développent. La culture locale s'affirme.",
    color: "from-purple-600 to-purple-700",
  },
  {
    year: "Aujourd'hui",
    title: "Ville en plein essor",
    desc: "Gros-Morne est aujourd'hui une commune dynamique de 155 692 habitants répartis sur 397 km². Elle conserve son identité culturelle profonde tout en se modernisant pour ses enfants.",
    color: "from-green-500 to-teal-600",
  },
];

export default function HistoireSection() {
  return (
    <section id="histoire" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Histoire &amp; Patrimoine
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Notre <span className="gradient-text">Histoire</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            De la période coloniale à nos jours, Gros-Morne a forgé une
            identité unique, marquée par la résistance, la fierté et la
            richesse culturelle.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-green-400 to-green-700 hidden md:block" />

          <div className="flex flex-col gap-12">
            {timeline.map((item, i) => (
              <div
                key={item.year}
                className={`flex flex-col md:flex-row items-center gap-6 md:gap-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Content */}
                <div className="md:w-5/12 card-hover">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-xs font-bold mb-3`}>
                      <Calendar className="w-3 h-3" />
                      {item.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg z-10`}>
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Spacer */}
                <div className="hidden md:block md:w-5/12" />
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-20 bg-gradient-to-r from-green-700 to-green-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 text-9xl font-black">&ldquo;</div>
          </div>
          <p className="text-xl sm:text-2xl font-medium italic relative z-10 max-w-3xl mx-auto">
            &ldquo;Gros-Morne est plus qu&apos;une ville. C&apos;est une âme collective,
            un héritage vivant que chaque habitant porte avec fierté.&rdquo;
          </p>
          <p className="mt-4 text-green-300 font-semibold">— La voix du peuple</p>
        </div>
      </div>
    </section>
  );
}
