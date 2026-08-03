"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { siteConfig, stats } from "@/lib/data";

const TYPING_SPEED = 65;
const DELETING_SPEED = 35;
const PAUSE_AFTER_TYPED = 1700;
const PAUSE_AFTER_DELETED = 300;

function useTypewriter(words: string[]) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    "typing",
  );

  useEffect(() => {
    const current = words[wordIndex];

    if (phase === "typing") {
      if (text.length < current.length) {
        const timeout = setTimeout(() => {
          setText(current.slice(0, text.length + 1));
        }, TYPING_SPEED);
        return () => clearTimeout(timeout);
      }
      const timeout = setTimeout(() => setPhase("pausing"), PAUSE_AFTER_TYPED);
      return () => clearTimeout(timeout);
    }

    if (phase === "pausing") {
      const timeout = setTimeout(() => setPhase("deleting"), 0);
      return () => clearTimeout(timeout);
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        const timeout = setTimeout(() => {
          setText(current.slice(0, text.length - 1));
        }, DELETING_SPEED);
        return () => clearTimeout(timeout);
      }
      const timeout = setTimeout(() => {
        setWordIndex((i) => (i + 1) % words.length);
        setPhase("typing");
      }, PAUSE_AFTER_DELETED);
      return () => clearTimeout(timeout);
    }
  }, [text, phase, wordIndex, words]);

  return text;
}

export default function Hero() {
  const typedRole = useTypewriter(siteConfig.rotatingRoles);

  return (
    <section
      id="accueil"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20"
    >
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-nav text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Bienvenue
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mt-4 font-heading text-xl font-medium text-accent sm:text-2xl">
            Je suis{" "}
            <span className="relative inline-block min-h-[1.5em] min-w-[1ch] align-bottom">
              {typedRole}
              <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-foreground align-[-0.1em]">
                &nbsp;
              </span>
            </span>
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
            {siteConfig.heroBio}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projets"
              className="group flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-nav text-sm font-bold text-background transition-transform duration-150 ease-snappy hover:-translate-y-0.5 hover:bg-accent-strong active:scale-[0.97]"
            >
              Voir mes projets
              <span className="transition-transform duration-200 ease-snappy group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
            <a
              href="#contact"
              className="rounded-full border border-foreground/30 px-7 py-3 font-nav text-sm font-bold text-foreground transition-all duration-150 ease-snappy hover:border-accent hover:text-accent active:scale-[0.97]"
            >
              Me contacter
            </a>
          </div>

          <div className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-2xl font-bold text-accent sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[2rem] border border-accent/40" />
          <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-2xl">
            <Image
              src={siteConfig.photo}
              alt={siteConfig.name}
              width={480}
              height={580}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
