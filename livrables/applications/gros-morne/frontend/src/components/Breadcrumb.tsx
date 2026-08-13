import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-500">
          <Link href="/" className="flex items-center gap-1 hover:text-green-700 transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              {item.href ? (
                <Link href={item.href} className="hover:text-green-700 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
