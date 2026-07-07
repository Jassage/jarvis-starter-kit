'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Store } from 'lucide-react';
import api from '@/lib/api';
import { formatMoney } from '@/lib/format';

const DEPARTMENTS = ['OUEST', 'NORD', 'NORD_EST', 'NORD_OUEST', 'ARTIBONITE', 'CENTRE', 'SUD', 'SUD_EST', 'NIPPES', 'GRANDE_ANSE'];

interface MarketplaceProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  currency: string;
  images: { url: string }[];
  boutique: { name: string; slug: string; logoUrl: string | null };
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/marketplace/products', { params: { q: q || undefined, department: department || undefined, page, limit: 24 } })
      .then((r) => {
        setProducts(r.data.data.products);
        setTotal(r.data.data.total);
        setTotalPages(r.data.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [q, department, page]);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <header className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">SHOPAY</span>
        </Link>
        <Link href="/register" className="btn btn-primary">Créer ma boutique</Link>
      </header>

      <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Découvrir les boutiques</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-ink-2)' }}>
          Parcourez les produits de tous les marchands SHOPAY en un seul endroit.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-ink-3)' }} />
            <input
              className="input pl-9 w-full"
              placeholder="Rechercher un produit..."
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </div>
          <select
            className="input sm:w-56"
            value={department}
            onChange={(e) => {
              setPage(1);
              setDepartment(e.target.value);
            }}
          >
            <option value="">Tous les départements</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center py-16 text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: 'var(--color-ink-3)' }}>{total} produit{total > 1 ? 's' : ''}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <Link key={p.id} href={`/store/${p.boutique.slug}/product/${p.slug}`} className="card card-hover overflow-hidden">
                  <div className="aspect-square" style={{ background: 'var(--color-line-2)' }}>
                    {p.images[0] && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 line-clamp-1">{p.name}</h3>
                    <p className="font-semibold mb-1.5" style={{ color: 'var(--color-primary-2)' }}>{formatMoney(p.basePrice, p.currency)}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-ink-3)' }}>
                      <Store className="w-3 h-3" /> {p.boutique.name}
                    </p>
                  </div>
                </Link>
              ))}
              {products.length === 0 && (
                <p className="col-span-full text-center py-16 text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun produit trouvé</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</button>
                <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Page {page} / {totalPages}</span>
                <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
