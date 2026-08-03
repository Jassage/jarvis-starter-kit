import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section id="services" className="bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Services"
          title="Comment je peux t'aider"
          description="Developpement, architecture SaaS et transmission du savoir : une offre technique et pedagogique."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <ScrollReveal key={service.title} delay={index * 100}>
              <div className="h-full rounded-2xl border border-border bg-surface p-6 transition-all duration-300 ease-snappy hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_16px_40px_-20px_rgba(155,128,90,0.55)]">
                <span className="font-heading text-2xl font-bold text-accent">
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
