"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Histoire", href: "/histoire" },
  { label: "Géographie", href: "/geographie" },
  { label: "Tourisme", href: "/tourisme" },
  { label: "Culture", href: "/culture" },
  { label: "Personnalités", href: "/personnalites" },
  { label: "Actualités", href: "/actualites" },
  { label: "Galerie", href: "/galerie" },
  { label: "Don", href: "/#don" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span
                className={cn(
                  "font-bold text-lg tracking-tight transition-colors",
                  scrolled ? "text-green-800" : "text-white"
                )}
              >
                Gros-Morne
              </span>
              <p
                className={cn(
                  "text-xs transition-colors",
                  scrolled ? "text-green-600" : "text-green-200"
                )}
              >
                Vil Mwen
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  scrolled
                    ? "text-gray-700 hover:text-green-700 hover:bg-green-50"
                    : "text-white/90 hover:text-white hover:bg-white/15"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/communaute"
              className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-700 to-green-500 text-white text-sm font-semibold shadow-md hover:shadow-green-500/30 hover:scale-105 transition-all duration-200"
            >
              Rejoindre
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              scrolled ? "text-green-800" : "text-white"
            )}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-green-100 shadow-xl">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/communaute"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 rounded-full bg-gradient-to-r from-green-700 to-green-500 text-white font-semibold text-center hover:opacity-90 transition-opacity"
            >
              Rejoindre la communauté
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
