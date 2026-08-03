"use client";

import { useState, type FormEvent } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";
import { siteConfig } from "@/lib/data";

const infoItems = [
  { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  {
    label: "Telephone / WhatsApp",
    value: siteConfig.phone,
    href: `https://wa.me/${siteConfig.whatsapp}`,
  },
  { label: "Localisation", value: siteConfig.location, href: undefined },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Contact portfolio - ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Discutons de ton projet"
          description="Une idee de plateforme, un besoin de formation, ou simplement envie d'echanger : ecris-moi."
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <ScrollReveal className="space-y-6">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <p className="font-nav text-xs font-bold tracking-wide text-accent uppercase">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="mt-2 block font-heading text-base font-medium text-foreground hover:text-accent"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 font-heading text-base font-medium text-foreground">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-border bg-surface p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Ton nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />
                <input
                  required
                  type="email"
                  placeholder="Ton email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <textarea
                required
                rows={5}
                placeholder="Ton message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-7 py-3 font-nav text-sm font-bold text-background transition-transform duration-150 ease-snappy hover:-translate-y-0.5 hover:bg-accent-strong active:scale-[0.97]"
              >
                Envoyer le message
              </button>
              <p className="text-xs text-muted">
                Ouvre ton client mail avec le message pre-rempli (aucun serveur
                de reception configure).
              </p>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
