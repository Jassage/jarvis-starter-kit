import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  const stripe = new Stripe(stripeKey);

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide : ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { courseId, userId } = session.metadata || {};

    if (courseId && userId && session.payment_status === 'paid') {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId },
        update: {},
      });
    }
  }

  return NextResponse.json({ received: true });
}
