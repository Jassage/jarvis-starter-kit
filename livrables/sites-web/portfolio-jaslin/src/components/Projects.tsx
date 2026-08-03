"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";
import { projectCategories, projects } from "@/lib/data";

export default function Projects() {
  const [filter, setFilter] = useState<string>("Tous");

  const filtered =
    filter === "Tous"
      ? projects
      : projects.filter((project) => project.category === filter);

  return (
    <section id="projets" className="bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Portfolio"
          title="Une selection de mes projets"
          description="Plateformes SaaS et applications completes concues du modele de donnees jusqu'au deploiement."
        />

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {projectCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`rounded-full px-4 py-1.5 font-nav text-sm font-semibold transition-all duration-150 ease-snappy active:scale-[0.95] ${
                filter === category
                  ? "bg-accent text-background"
                  : "border border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <ScrollReveal key={project.title} delay={(index % 3) * 100}>
              <article className="project-card group h-full overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 ease-snappy">
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-accent/20 via-surface-2 to-surface">
                  <span className="font-heading text-4xl font-bold text-accent/70 transition-transform duration-300 group-hover:scale-110">
                    {project.initials}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-background/70 px-3 py-1 font-nav text-xs font-semibold text-accent">
                    {project.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-1 font-nav text-sm font-semibold text-accent">
                    {project.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
