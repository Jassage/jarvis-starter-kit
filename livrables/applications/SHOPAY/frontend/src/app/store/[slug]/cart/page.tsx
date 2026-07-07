'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import { formatMoney } from '@/lib/format';

interface Boutique { id: string; name: string; slug: string; logoUrl?: string | null; themeColor?: string }

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const { cart, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    api.get(`/storefront/${slug}`).then((r) => setBoutique(r.data.data.boutique));
    fetchCart(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!boutique) return <p className="p-8 text-center" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <StorefrontHeader boutique={boutique} cartCount={cartCount} />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">Votre panier</h1>

        {(!cart || cart.items.length === 0) ? (
          <div className="card p-10 text-center">
            <p style={{ color: 'var(--color-ink-3)' }}>Votre panier est vide</p>
            <Link href={`/store/${slug}`} className="btn btn-primary mt-4 inline-flex">Continuer mes achats</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card divide-y" style={{ borderColor: 'var(--color-line-2)' }}>
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4" style={{ borderColor: 'var(--color-line-2)' }}>
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--color-line-2)' }}>
                    {item.product.images[0] && <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    {item.variant && <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{Object.values(item.variant.optionsJson).join(' / ')}</p>}
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-primary-2)' }}>{formatMoney(item.unitPrice)}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(slug, item.id, Math.max(1, Number(e.target.value)))}
                    className="input"
                    style={{ width: 70 }}
                  />
                  <button onClick={() => removeItem(slug, item.id)}><Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger)' }} /></button>
                </div>
              ))}
            </div>

            <div className="card p-5 flex items-center justify-between">
              <span className="font-bold text-lg">Sous-total</span>
              <span className="font-extrabold text-lg">{formatMoney(cart.subtotal)}</span>
            </div>

            <Link href={`/store/${slug}/checkout`} className="btn btn-primary w-full py-3.5">Passer commande</Link>
          </div>
        )}
      </section>
    </div>
  );
}
