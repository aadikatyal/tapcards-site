import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Helper function to add CORS headers
function addCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// OPTIONS endpoint for CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCORSHeaders(response);
}

// POST endpoint to create a payment intent
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Payment intent request received');
    console.log('🔍 DEBUG: Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    console.log('🔍 DEBUG: Request body:', body);
    
    const { amount, currency = 'usd' } = body;

    // Validate the request
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.log('❌ DEBUG: Invalid amount received:', amount);
      const errorResponse = NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    console.log('🔍 DEBUG: Valid request - amount:', amount, 'currency:', currency);
    console.log('🔍 DEBUG: Calling Stripe API to create payment intent...');
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'tap-app',
        timestamp: new Date().toISOString(),
      },
    });

    console.log('✅ DEBUG: Payment intent created successfully');
    console.log('✅ DEBUG: Payment intent ID:', paymentIntent.id);
    console.log('✅ DEBUG: Client secret length:', paymentIntent.client_secret?.length || 0);

    const successResponse = NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

    return addCORSHeaders(successResponse);

  } catch (error) {
    console.error('❌ ERROR: Failed to create payment intent');
    console.error('❌ ERROR Type:', typeof error);
    
    // Safe error message extraction
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('❌ ERROR Message:', errorMessage);
    console.error('❌ ERROR Stack:', errorStack);
    
    // Check if environment variables are set
    console.log('🔍 DEBUG: STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔍 DEBUG: STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length || 0);
    console.log('🔍 DEBUG: STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'undefined');
    
    let errorResponseMessage = 'Failed to create payment intent';
    let statusCode = 500;

    if (error instanceof Stripe.errors.StripeError) {
      errorResponseMessage = error.message;
      statusCode = 400;
      console.error('❌ STRIPE ERROR:', error.type, error.code, error.message);
    }

    const errorResponse = NextResponse.json(
      { 
        error: errorResponseMessage,
        debug: {
          hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
          stripeKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
          errorType: typeof error,
          errorMessage: errorMessage
        }
      },
      { status: statusCode }
    );
    
    return addCORSHeaders(errorResponse);
  }
}