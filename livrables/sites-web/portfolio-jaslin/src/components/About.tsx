import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";
import { facts, siteConfig, strengths } from "@/lib/data";

export default function About() {
  return (
    <section id="a-propos" className="bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="A propos de moi"
          title="Passionne par la technologie et la transmission du savoir"
        />

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <ScrollReveal>
            <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-border lg:mx-0">
              <Image
                src={siteConfig.photo}
                alt={siteConfig.name}
                width={400}
                height={480}
                className="h-full w-full object-cover"
              />
            </div>
          </ScrollReveal>

          <div>
            <ScrollReveal delay={100}>
              <div className="space-y-4 text-muted">
                {siteConfig.aboutBio.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <dl className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-xl border border-border bg-surface p-5"
                  >
                    <dt className="font-nav text-xs font-bold tracking-wide text-accent uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 font-heading text-base font-medium text-foreground">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {strengths.map((item) => (
                  <div key={item.title} className="border-l-2 border-accent pl-4">
                    <p className="font-heading text-sm font-bold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
