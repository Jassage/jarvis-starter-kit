"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import TopBar from "./TopBar";
import Logo from "./Logo";
import SearchBox from "./SearchBox";

const decouvrir = [
  { label: "Histoire", href: "/histoire" },
  { label: "Culture", href: "/culture" },
  { label: "Personnalités", href: "/personnalites" },
  { label: "Géographie", href: "/geographie" },
  { label: "Vie associative", href: "/vie-associative" },
  { label: "Communauté", href: "/communaute" },
];

const tourisme = [
  { label: "Lieux incontournables", href: "/tourisme" },
  { label: "Galerie", href: "/galerie" },
  { label: "Agenda", href: "/agenda" },
];

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Actualités", href: "/actualites" },
  { label: "Annuaire", href: "/annuaire" },
  { label: "Investir", href: "/investir" },
  { label: "Diaspora", href: "/diaspora" },
  { label: "Contact", href: "/contact" },
];

function Dropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all duration-200">
        {label}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 pt-2 w-56 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("FR");

  return (
    <>
      <TopBar />
      <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Logo size={38} className="group-hover:scale-105 transition-transform" />
              <div className="leading-tight">
                <span className="font-bold text-lg tracking-tight text-green-800">Smart Gros-Morne</span>
                <p className="text-[11px] text-green-600">Terre d&apos;accueil et d&apos;opportunités</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-0.5">
              <Link href="/" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all duration-200">
                Accueil
              </Link>
              <Dropdown label="Découvrir Gros-Morne" items={decouvrir} />
              <Dropdown label="Tourisme" items={tourisme} />
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right controls */}
            <div className="hidden xl:flex items-center gap-2">
              <SearchBox />
              <div className="relative" onMouseEnter={() => setLangOpen(true)} onMouseLeave={() => setLangOpen(false)}>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                  {lang}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 pt-2 w-32 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-1.5">
                      {["FR", "HT"].map((l) => (
                        <button
                          key={l}
                          onClick={() => setLang(l)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          {l === "FR" ? "Français" : "Kreyòl"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/admin/login"
                className="ml-1 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-green-700 to-green-500 text-white text-sm font-semibold shadow-md hover:shadow-green-500/30 hover:scale-105 transition-all duration-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Espace admin
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(!open)}
              className="xl:hidden p-2 rounded-lg text-green-800"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="xl:hidden bg-white border-t border-green-100 shadow-xl max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col px-4 py-3 gap-1">
              <Link href="/" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50">
                Accueil
              </Link>
              <p className="px-4 pt-2 text-xs font-bold uppercase tracking-wider text-gray-400">Découvrir Gros-Morne</p>
              {decouvrir.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-gray-700 text-sm hover:bg-green-50">
                  {item.label}
                </Link>
              ))}
              <p className="px-4 pt-2 text-xs font-bold uppercase tracking-wider text-gray-400">Tourisme</p>
              {tourisme.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-gray-700 text-sm hover:bg-green-50">
                  {item.label}
                </Link>
              ))}
              <p className="px-4 pt-2 text-xs font-bold uppercase tracking-wider text-gray-400">Plus</p>
              {navLinks.slice(1).map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-gray-700 text-sm hover:bg-green-50">
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-gradient-to-r from-green-700 to-green-500 text-white font-semibold text-center hover:opacity-90 transition-opacity"
              >
                <ShieldCheck className="w-4 h-4" />
                Espace admin
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
