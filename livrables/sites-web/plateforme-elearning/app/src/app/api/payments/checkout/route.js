import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe non configuré sur ce serveur.' }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) return NextResponse.json({ error: 'courseId requis' }, { status: 400 });

  const course = await prisma.course.findFirst({
    where: { id: courseId, status: 'PUBLISHED', price: { gt: 0 } },
  });
  if (!course) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 });

  const stripe = new Stripe(stripeKey);
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: course.title,
            ...(course.description && { description: course.description }),
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      userId: session.user.id,
    },
    success_url: `${baseUrl}/course?id=${courseId}&payment=success`,
    cancel_url: `${baseUrl}/course?id=${courseId}`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
