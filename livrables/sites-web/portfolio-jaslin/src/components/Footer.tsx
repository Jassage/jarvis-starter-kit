import { siteConfig } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-muted sm:flex-row sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Tous droits
          reserves.
        </p>
        <p>Concu avec Next.js & Tailwind CSS.</p>
      </div>
    </footer>
  );
}
