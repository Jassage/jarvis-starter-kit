'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import { formatMoney } from '@/lib/format';

interface Boutique { id: string; name: string; slug: string; logoUrl?: string | null; themeColor?: string }
interface Order { id: string; orderNumber: string; total: string; currency: string }

const DEPARTMENTS = ['OUEST', 'NORD', 'NORD_EST', 'NORD_OUEST', 'ARTIBONITE', 'CENTRE', 'SUD', 'SUD_EST', 'NIPPES', 'GRANDE_ANSE'];

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const { cart, fetchCart } = useCartStore();
  const [form, setForm] = useState({ buyerName: '', buyerEmail: '', buyerPhone: '', department: '', commune: '', landmark: '', shippingFee: '0' });
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [proofRef, setProofRef] = useState('');
  const [proofSent, setProofSent] = useState(false);

  useEffect(() => {
    api.get(`/storefront/${slug}`).then((r) => setBoutique(r.data.data.boutique));
    fetchCart(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/storefront/${slug}/checkout`, { ...form, shippingFee: Number(form.shippingFee), department: form.department || undefined });
      setOrder(data.data.order);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Impossible de créer la commande');
    }
  };

  const payWithStripe = async () => {
    setError('');
    try {
      const { data } = await api.post('/payments/stripe/checkout-session', { orderId: order!.id });
      window.location.href = data.data.url;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Paiement par carte indisponible pour l’instant');
    }
  };

  const payWithMoncash = async () => {
    setError('');
    try {
      const { data } = await api.post('/payments/moncash/initiate', { orderId: order!.id });
      window.location.href = data.data.redirectUrl;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'MonCash indisponible pour l’instant');
    }
  };

  const submitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      fd.append('orderId', order!.id);
      fd.append('transactionRef', proofRef);
      await api.post('/payments/submit-proof', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProofSent(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Impossible de soumettre la preuve');
    }
  };

  if (!boutique) return <p className="p-8 text-center" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <StorefrontHeader boutique={boutique} />

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {!order ? (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight mb-6">Finaliser la commande</h1>
            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Nom complet</label>
                <input required value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} className="input" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Email</label>
                  <input type="email" required value={form.buyerEmail} onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Téléphone</label>
                  <input required value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Département</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input">
                    <option value="">—</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Commune</label>
                  <input value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Point de repère (livraison)</label>
                <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Près de..." className="input" />
              </div>

              {error && <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Sous-total : {cart ? formatMoney(cart.subtotal) : '—'}</span>
                <button type="submit" className="btn btn-primary">Continuer vers le paiement</button>
              </div>
            </form>
          </>
        ) : (
          <div className="card p-6 space-y-5">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Commande {order.orderNumber} créée</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>Total à payer : {formatMoney(order.total, order.currency)}</p>
            </div>

            {error && <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

            {!proofSent ? (
              <div className="space-y-3">
                <button onClick={payWithStripe} className="btn btn-primary w-full py-3">Payer par carte (Stripe)</button>
                <button onClick={payWithMoncash} className="btn btn-secondary w-full py-3">Payer par MonCash</button>

                <form onSubmit={submitProof} className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--color-line)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Déjà transféré l&apos;argent ? Soumettez votre référence :</p>
                  <input required value={proofRef} onChange={(e) => setProofRef(e.target.value)} placeholder="Référence de transaction" className="input" />
                  <button type="submit" className="btn btn-secondary w-full">Envoyer la preuve de paiement</button>
                </form>
              </div>
            ) : (
              <div className="text-sm p-4 rounded-xl font-medium" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
                Preuve reçue. Votre commande sera validée après vérification (sous 24h). Conservez votre numéro de commande <strong>{order.orderNumber}</strong> pour le suivi.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
