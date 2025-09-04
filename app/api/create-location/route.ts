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
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorType = (error as any)?.type || 'unknown_error';
    const errorCode = (error as any)?.code || 'unknown_code';
    const declineCode = (error as any)?.decline_code;
    
    console.error('Error details:', {
      message: errorMessage,
      type: errorType,
      code: errorCode,
      decline_code: declineCode
    });
    
    return Response.json(
      { 
        error: `Failed to create location: ${errorMessage}`,
        details: errorType,
        code: errorCode
      },
      { status: 500 }
    );
  }
}