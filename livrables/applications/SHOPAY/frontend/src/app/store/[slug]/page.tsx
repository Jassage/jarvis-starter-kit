'use client';
import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import { formatMoney } from '@/lib/format';

interface Boutique { id: string; name: string; slug: string; logoUrl?: string | null; themeColor?: string; description?: string | null }
interface Product { id: string; name: string; slug: string; basePrice: string; currency: string; images: { url: string }[] }

export default function StorefrontHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    api.get(`/storefront/${slug}`).then((r) => setBoutique(r.data.data.boutique)).catch(() => setNotFoundFlag(true));
    api.get(`/storefront/${slug}/products`).then((r) => setProducts(r.data.data.products));
    fetchCart(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (notFoundFlag) return notFound();
  if (!boutique) return <p className="p-8 text-center" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <StorefrontHeader boutique={boutique} cartCount={cartCount} />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{boutique.name}</h1>
        {boutique.description && <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--color-ink-2)' }}>{boutique.description}</p>}
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <Link key={p.id} href={`/store/${slug}/product/${p.slug}`} className="card card-hover overflow-hidden">
              <div className="aspect-square" style={{ background: 'var(--color-line-2)' }}>
                {p.images[0] && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1">{p.name}</h3>
                <p className="font-semibold" style={{ color: 'var(--color-primary-2)' }}>{formatMoney(p.basePrice, p.currency)}</p>
              </div>
            </Link>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center py-16 text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun produit disponible pour l&apos;instant</p>
          )}
        </div>
      </section>
    </div>
  );
}
