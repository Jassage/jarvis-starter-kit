'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function StorefrontHeader({
  boutique,
  cartCount = 0,
}: {
  boutique: { name: string; slug: string; logoUrl?: string | null; themeColor?: string };
  cartCount?: number;
}) {
  return (
    <header className="border-b" style={{ borderColor: 'var(--color-line)', background: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href={`/store/${boutique.slug}`} className="flex items-center gap-2.5">
          {boutique.logoUrl ? (
            <img src={boutique.logoUrl} alt={boutique.name} className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: boutique.themeColor || 'var(--color-primary-2)' }}>
              {boutique.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-extrabold text-lg tracking-tight">{boutique.name}</span>
        </Link>
        <Link href={`/store/${boutique.slug}/cart`} className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--color-danger)' }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
