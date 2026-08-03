import ScrollReveal from "./ScrollReveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
      <p className="font-nav text-sm font-semibold tracking-[0.2em] text-accent uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-muted">{description}</p>
      ) : null}
    </ScrollReveal>
  );
}
