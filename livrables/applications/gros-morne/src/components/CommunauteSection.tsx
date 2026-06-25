"use client";

import { useState } from "react";
import { Users, MessageSquare, CalendarDays, ImageIcon, Check, Send, Building2, Phone, Globe, Plus } from "lucide-react";
import Link from "next/link";

const avantages = [
  "Compte gratuit pour toujours",
  "Connexion sécurisée par email",
  "Modération bienveillante",
  "Accessible depuis mobile",
  "Communauté diaspora incluse",
  "Notifications des événements",
];

const TABS = [
  { id: "forum", label: "Forum", icon: MessageSquare },
  { id: "evenements", label: "Événements", icon: CalendarDays },
  { id: "galerie", label: "Galerie", icon: ImageIcon },
  { id: "annuaire", label: "Annuaire", icon: Building2 },
];

const discussions = [
  { titre: "Quelle est la meilleure saison pour visiter Gros-Morne ?", auteur: "Jean-Pierre D.", replies: 12, time: "Il y a 2h", tag: "Tourisme", color: "bg-green-100 text-green-700" },
  { titre: "Quelqu'un connaît de bons médecins en ville ?", auteur: "Marie A.", replies: 8, time: "Il y a 4h", tag: "Santé", color: "bg-red-100 text-red-700" },
  { titre: "Histoire : le rôle de Gros-Morne en 1804", auteur: "Prof. Louis", replies: 23, time: "Il y a 1j", tag: "Histoire", color: "bg-amber-100 text-amber-700" },
  { titre: "Projet collectif : planter des arbres en ville", auteur: "Asso. Verte", replies: 6, time: "Il y a 2j", tag: "Environnement", color: "bg-teal-100 text-teal-700" },
];

const evenements = [
  { titre: "Festival de la Mangue Francisque 2025", date: "15 Jul 2025", lieu: "Place centrale", categorie: "Festival", emoji: "🥭", color: "bg-amber-100 text-amber-700" },
  { titre: "Fête patronale de Gros-Morne", date: "29 Jun 2025", lieu: "Église principale", categorie: "Religieux", emoji: "⛪", color: "bg-blue-100 text-blue-700" },
  { titre: "Tournoi de football communal", date: "6 Jul 2025", lieu: "Terrain municipal", categorie: "Sport", emoji: "⚽", color: "bg-green-100 text-green-700" },
  { titre: "Exposition artisanale — Vannerie & Poterie", date: "20 Jul 2025", lieu: "Marché communal", categorie: "Culture", emoji: "🎨", color: "bg-purple-100 text-purple-700" },
];

const commerces = [
  { nom: "Pharmacie Centrale Gros-Morne", type: "Santé", tel: "+509 3xxx xxxx", emoji: "💊" },
  { nom: "Banque Populaire Haïtienne", type: "Finance", tel: "+509 3xxx xxxx", emoji: "🏦" },
  { nom: "École Nationale de Gros-Morne", type: "Éducation", tel: "+509 3xxx xxxx", emoji: "🎓" },
  { nom: "Francisque FM 98.9", type: "Médias", tel: "+509 3xxx xxxx", emoji: "📻" },
  { nom: "Hôtel Les Mornes", type: "Hébergement", tel: "+509 3xxx xxxx", emoji: "🏨" },
  { nom: "Restaurant Saveur Créole", type: "Restauration", tel: "+509 3xxx xxxx", emoji: "🍽️" },
];

export default function CommunauteSection() {
  const [activeTab, setActiveTab] = useState("forum");
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="communaute" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Espace communautaire
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Rejoignez la{" "}
            <span className="gradient-text">communauté</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Que vous viviez à Gros-Morne ou dans la diaspora, cet espace est
            fait pour rester connecté à votre ville.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === id
                  ? "bg-green-700 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="mb-14 min-h-64">

          {/* Forum */}
          {activeTab === "forum" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{discussions.length} discussions récentes</p>
                <button onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-700 text-white text-sm font-bold hover:bg-green-600 transition-colors">
                  <Plus className="w-4 h-4" /> Nouvelle discussion
                </button>
              </div>
              <div className="space-y-3">
                {discussions.map((d, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {d.auteur[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">{d.titre}</h4>
                          <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${d.color}`}>{d.tag}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                          <span>{d.auteur}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {d.replies} réponses</span>
                          <span>·</span>
                          <span>{d.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {showForm && (
                <div className="mt-4 bg-green-50 rounded-2xl p-5 border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-3">Nouvelle discussion</h4>
                  <input type="text" placeholder="Titre de votre discussion..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3 text-sm" />
                  <textarea rows={3} placeholder="Votre message..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3 text-sm resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors">Annuler</button>
                    <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-700 text-white text-sm font-bold hover:bg-green-600 transition-colors">
                      <Send className="w-3.5 h-3.5" /> Publier
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Événements */}
          {activeTab === "evenements" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Prochains événements à Gros-Morne</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-700 text-white text-sm font-bold hover:bg-green-600 transition-colors">
                  <Plus className="w-4 h-4" /> Ajouter un événement
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {evenements.map((ev, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex gap-4">
                    <div className="text-3xl shrink-0">{ev.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">{ev.titre}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CalendarDays className="w-3 h-3" />
                        <span>{ev.date}</span>
                        <span>·</span>
                        <span>{ev.lieu}</span>
                      </div>
                      <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${ev.color}`}>{ev.categorie}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Galerie */}
          {activeTab === "galerie" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Galerie collaborative</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                Partagez vos photos de Gros-Morne et contribuez à la mémoire visuelle de notre ville.
              </p>
              <Link
                href="/galerie"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md"
              >
                <ImageIcon className="w-4 h-4" />
                Voir la galerie complète
              </Link>
            </div>
          )}

          {/* Annuaire */}
          {activeTab === "annuaire" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{commerces.length} établissements référencés</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-700 text-white text-sm font-bold hover:bg-green-600 transition-colors">
                  <Plus className="w-4 h-4" /> Référencer mon commerce
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {commerces.map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm leading-snug">{c.nom}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 mb-2">{c.type}</p>
                        <div className="flex items-center gap-1 text-xs text-green-700">
                          <Phone className="w-3 h-3" />
                          <span>{c.tel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inscription */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">
              Créez votre compte<br />
              <span className="text-green-700">gratuitement</span>
            </h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Rejoignez la communauté de Gros-Morne. Participez à la vie de votre ville,
              peu importe où vous vous trouvez dans le monde.
            </p>
            <ul className="space-y-3">
              {avantages.map((av) => (
                <li key={av} className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-700" />
                  </div>
                  {av}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-3xl p-8 shadow-2xl">
            <h4 className="text-xl font-black text-white mb-6">Créer mon compte</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-green-200 text-sm font-medium mb-1.5">Prénom &amp; Nom</label>
                <input type="text" placeholder="Jean-Pierre Duval"
                  className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition" />
              </div>
              <div>
                <label className="block text-green-200 text-sm font-medium mb-1.5">Email</label>
                <input type="email" placeholder="vous@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition" />
              </div>
              <div>
                <label className="block text-green-200 text-sm font-medium mb-1.5">Mot de passe</label>
                <input type="password" placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition" />
              </div>
              <div>
                <label className="block text-green-200 text-sm font-medium mb-1.5">Où habitez-vous ?</label>
                <select className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition">
                  <option value="" className="text-gray-800">Sélectionner...</option>
                  <option value="gm" className="text-gray-800">À Gros-Morne</option>
                  <option value="haiti" className="text-gray-800">En Haïti (autre ville)</option>
                  <option value="diaspora" className="text-gray-800">Dans la diaspora</option>
                </select>
              </div>
              <button className="w-full py-4 rounded-xl bg-amber-500 text-white font-black text-lg hover:bg-amber-400 hover:scale-[1.02] transition-all duration-200 shadow-lg mt-2">
                Rejoindre maintenant
              </button>
              <p className="text-center text-green-300 text-xs">
                Déjà membre ?{" "}
                <button className="text-white font-semibold underline">Se connecter</button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
