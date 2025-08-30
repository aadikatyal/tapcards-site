// app/api/create-payment-method/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { type, card } = await request.json();
    
    // Create payment method from Apple Pay token
    const paymentMethod = await stripe.paymentMethods.create({
      type: type,
      card: {
        token: card.token,
      },
    });

    return NextResponse.json({ id: paymentMethod.id });
  } catch (error) {
    console.error('Failed to create payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}