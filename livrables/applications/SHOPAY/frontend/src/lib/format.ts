export function formatMoney(amount: string | number, currency = 'HTG'): string {
  const value = Number(amount);
  return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'En attente de paiement',
  PAID: 'Payée',
  PROCESSING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

export const ORDER_STATUS_TONE: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'brand' | 'neutral'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'brand',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'danger',
};
