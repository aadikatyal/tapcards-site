// app/api/create-location/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { businessName, address } = await request.json();
    
    // Create location in Stripe
    const location = await stripe.terminal.locations.create({
      display_name: businessName || 'Business Location',
      address: {
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        state: address.state,
        country: 'US', // Tap to Pay is US only
        postal_code: address.postalCode,
      },
    });
    
    return Response.json({
      location_id: location.id,
      success: true
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return Response.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}