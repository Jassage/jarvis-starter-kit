"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";
import { skillGroups } from "@/lib/data";

function SkillBar({
  name,
  level,
  note,
  active,
}: {
  name: string;
  level: number;
  note: string;
  active: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-heading text-sm font-bold text-foreground">
          {name}
        </p>
        <p className="font-nav text-sm font-semibold text-accent">{level}%</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-all duration-1000 ease-snappy"
          style={{ width: active ? `${level}%` : "0%" }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">{note}</p>
    </div>
  );
}

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="competences" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Competences"
          title="Ce que je maitrise"
          description="Une double expertise technique et pedagogique, construite en batissant des plateformes reelles et en les enseignant."
        />

        <div ref={ref} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {skillGroups.map((group, groupIndex) => (
            <ScrollReveal key={group.title} delay={groupIndex * 120}>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {group.title}
              </h3>
              <div className="mt-6 space-y-6">
                {group.skills.map((skill) => (
                  <SkillBar key={skill.name} {...skill} active={active} />
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
