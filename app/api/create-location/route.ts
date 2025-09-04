// tapcards-site/app/api/create-location/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { businessName, address, connectedAccountId } = await request.json();
    
    console.log('Creating location for connected account:', connectedAccountId);
    console.log('Location data:', { businessName, address });
    
    // Create location in Stripe (platform account)
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
    
    console.log('Location created successfully:', location.id);
    
    return Response.json({
      location_id: location.id,
      success: true
    });
  } catch (error) {
    console.error('Error creating location:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      decline_code: error.decline_code
    });
    return Response.json(
      { 
        error: `Failed to create location: ${error.message}`,
        details: error.type || 'unknown_error',
        code: error.code || 'unknown_code'
      },
      { status: 500 }
    );
  }
}