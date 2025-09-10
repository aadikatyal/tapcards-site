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

// POST endpoint to create an invoice
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Create invoice request received');
    
    const body = await request.json();
    console.log('🔍 DEBUG: Request body:', body);
    
    const { 
      amount, 
      currency = 'usd', 
      customer_email, 
      customer_name, 
      description, 
      due_date 
    } = body;

    // Validate the request
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.log('❌ DEBUG: Invalid amount received:', amount);
      const errorResponse = NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }

    if (!customer_email || !customer_email.includes('@')) {
      console.log('❌ DEBUG: Invalid customer email:', customer_email);
      const errorResponse = NextResponse.json(
        { error: 'Valid customer email is required' },
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }

    if (!customer_name || customer_name.trim().length === 0) {
      console.log('❌ DEBUG: Invalid customer name:', customer_name);
      const errorResponse = NextResponse.json(
        { error: 'Valid customer name is required' },
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }

    if (!description || description.trim().length === 0) {
      console.log('❌ DEBUG: Invalid description:', description);
      const errorResponse = NextResponse.json(
        { error: 'Valid description is required' },
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    console.log('🔍 DEBUG: Valid request - amount:', amount, 'customer:', customer_email);

    // First, create or retrieve a customer
    let customer;
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customer_email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('✅ DEBUG: Found existing customer:', customer.id);
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customer_email,
          name: customer_name,
          metadata: {
            source: 'tap-app-invoice',
            created_at: new Date().toISOString(),
          },
        });
        console.log('✅ DEBUG: Created new customer:', customer.id);
      }
    } catch (customerError) {
      console.error('❌ ERROR: Failed to create/find customer:', customerError);
      throw new Error('Failed to create customer');
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 30, // Default to 30 days if no due date specified
      metadata: {
        source: 'tap-app-invoice',
        created_at: new Date().toISOString(),
      },
      description: description,
    });

    // Add line item to the invoice
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: amount,
      currency: currency,
      description: description,
    });

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // Send the invoice
    const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

    console.log('✅ DEBUG: Invoice created and sent successfully');
    console.log('✅ DEBUG: Invoice ID:', sentInvoice.id);

    const successResponse = NextResponse.json({
      invoice_id: sentInvoice.id,
      customer_id: customer.id,
      amount: amount,
      currency: currency,
      status: sentInvoice.status,
      hosted_invoice_url: sentInvoice.hosted_invoice_url,
    });

    return addCORSHeaders(successResponse);

  } catch (error) {
    console.error('❌ ERROR: Failed to create invoice');
    console.error('❌ ERROR:', error);
    
    let errorMessage = 'Failed to create invoice';
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
