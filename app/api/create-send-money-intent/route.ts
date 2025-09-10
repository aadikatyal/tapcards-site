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

// POST endpoint to create a send money payment intent
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Send money intent request received');
    
    const body = await request.json();
    console.log('🔍 DEBUG: Request body:', body);
    
    const { amount, currency = 'usd', recipient_email, note } = body;

    // Validate the request
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.log('❌ DEBUG: Invalid amount received:', amount);
      const errorResponse = NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }

    if (!recipient_email || !recipient_email.includes('@')) {
      console.log('❌ DEBUG: Invalid recipient email:', recipient_email);
      const errorResponse = NextResponse.json(
        { error: 'Valid recipient email is required' },
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    console.log('🔍 DEBUG: Valid request - amount:', amount, 'recipient:', recipient_email);

    // Create a PaymentIntent for sending money
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      return_url: 'https://tapcards.us/payment-return',
      metadata: {
        source: 'tap-app-send-money',
        recipient_email,
        note: note || '',
        timestamp: new Date().toISOString(),
      },
      description: `Send money to ${recipient_email}${note ? ` - ${note}` : ''}`,
    });

    console.log('✅ DEBUG: Send money payment intent created successfully');
    console.log('✅ DEBUG: Payment intent ID:', paymentIntent.id);

    const successResponse = NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

    return addCORSHeaders(successResponse);

  } catch (error) {
    console.error('❌ ERROR: Failed to create send money payment intent');
    console.error('❌ ERROR:', error);
    
    let errorMessage = 'Failed to create send money payment intent';
    let statusCode = 500;

    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message;
      statusCode = 400;
      console.error('❌ STRIPE ERROR:', error.type, error.code, error.message);
    }

    const errorResponse = NextResponse.json(
      { 
        error: errorMessage,
        debug: {
          hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
          errorType: typeof error,
          errorMessage: error.message
        }
      },
      { status: statusCode }
    );
    
    return addCORSHeaders(errorResponse);
  }
}
