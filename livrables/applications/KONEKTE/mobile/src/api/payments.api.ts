import api from "./client";

export interface PaymentStatus {
  subscriptionPlan: string;
  subscriptionExpiry: string | null;
}

export const fetchPaymentStatus = async () => {
  const { data } = await api.get<{ success: boolean; data: PaymentStatus }>("/payments/status");
  return data.data;
};

export const createStripeCheckout = async (planId: string) => {
  const { data } = await api.post<{ success: boolean; data: { url: string; sessionId: string } }>(
    "/payments/stripe/create-checkout",
    { planId }
  );
  return data.data;
};

export const createMoncashPayment = async (planId: string) => {
  const { data } = await api.post<{ success: boolean; data: { redirectUrl: string; orderId: string } }>(
    "/payments/moncash/create",
    { planId }
  );
  return data.data;
};
