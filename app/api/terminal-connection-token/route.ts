import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Create a connection token for Stripe Terminal
    const connectionToken = await stripe.terminal.connectionTokens.create();
    
    return NextResponse.json({
      secret: connectionToken.secret,
    });
  } catch (error) {
    console.error('Error creating terminal connection token:', error);
    return NextResponse.json(
      { error: 'Failed to create connection token' },
      { status: 500 }
    );
  }
}
