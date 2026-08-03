import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";
import { education, experience, type TimelineItem } from "@/lib/data";

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-10 border-l border-border pl-8">
      {items.map((item) => (
        <li key={item.title} className="relative">
          <span className="absolute -left-[2.05rem] top-1 h-3 w-3 rounded-full border-2 border-accent bg-background" />
          <p className="font-nav text-xs font-semibold tracking-wide text-accent uppercase">
            {item.period}
          </p>
          <h4 className="mt-1 font-heading text-base font-bold text-foreground">
            {item.title}
          </h4>
          <p className="text-sm text-muted">{item.place}</p>
          {item.points.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {item.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default function Journey() {
  return (
    <section id="parcours" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Parcours"
          title="Experience et formation"
        />

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <ScrollReveal>
            <h3 className="mb-8 font-heading text-lg font-bold text-foreground">
              Experience professionnelle
            </h3>
            <Timeline items={experience} />
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <h3 className="mb-8 font-heading text-lg font-bold text-foreground">
              Formation
            </h3>
            <Timeline items={education} />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
