// app/api/confirm-apple-pay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId, amount, currency = 'usd' } = await request.json();

    // Create and confirm payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: 'https://tapcards.us/success',
    });

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Apple Pay confirmation failed:', error);
    return NextResponse.json(
      { error: 'Payment failed' },
      { status: 500 }
    );
  }
}