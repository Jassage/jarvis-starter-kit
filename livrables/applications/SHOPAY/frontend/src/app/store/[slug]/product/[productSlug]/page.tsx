'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import { formatMoney } from '@/lib/format';

interface Variant { id: string; optionsJson: Record<string, string>; priceOverride?: string | null; stockQty: number }
interface Product {
  id: string; name: string; slug: string; description?: string | null; basePrice: string; currency: string;
  stockQty: number; trackStock: boolean; images: { url: string }[]; variants: Variant[];
}
interface Boutique { id: string; name: string; slug: string; logoUrl?: string | null; themeColor?: string }

export default function ProductPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const router = useRouter();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [added, setAdded] = useState(false);
  const { cart, addItem, fetchCart } = useCartStore();

  useEffect(() => {
    api.get(`/storefront/${slug}`).then((r) => setBoutique(r.data.data.boutique)).catch(() => setNotFoundFlag(true));
    api.get(`/storefront/${slug}/products/${productSlug}`).then((r) => setProduct(r.data.data.product)).catch(() => setNotFoundFlag(true));
    fetchCart(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, productSlug]);

  if (notFoundFlag) return notFound();
  if (!boutique || !product) return <p className="p-8 text-center" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;

  const selectedVariant = product.variants.find((v) => v.id === variantId);
  const price = selectedVariant?.priceOverride ?? product.basePrice;
  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const handleAdd = async () => {
    await addItem(slug, product.id, variantId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <StorefrontHeader boutique={boutique} cartCount={cartCount} />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: 'var(--color-line-2)' }}>
          {product.images[0] && <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />}
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">{product.name}</h1>
          <p className="text-xl font-bold mb-4" style={{ color: 'var(--color-primary-2)' }}>{formatMoney(price, product.currency)}</p>
          {product.description && <p className="text-sm mb-6" style={{ color: 'var(--color-ink-2)' }}>{product.description}</p>}

          {product.variants.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5">Option</label>
              <select value={variantId ?? ''} onChange={(e) => setVariantId(e.target.value || undefined)} className="input">
                <option value="">Standard</option>
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stockQty <= 0}>
                    {Object.values(v.optionsJson).join(' / ')} {v.stockQty <= 0 ? '(rupture)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <label className="text-xs font-semibold">Quantité</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="input" style={{ width: 80 }} />
          </div>

          <button onClick={handleAdd} className="btn btn-primary w-full py-3">Ajouter au panier</button>
          {added && (
            <div className="mt-3 flex items-center justify-between text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
              Ajouté au panier
              <button onClick={() => router.push(`/store/${slug}/cart`)} className="font-bold underline">Voir le panier</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
