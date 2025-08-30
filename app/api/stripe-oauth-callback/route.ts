// DISABLED: Stripe OAuth callback route
// This route has been temporarily disabled to prevent build failures
// To re-enable, rename this file back to route.ts and install the stripe package

import { NextRequest, NextResponse } from 'next/server';

// OPTIONS endpoint for CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// GET endpoint - disabled
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Stripe OAuth callback is temporarily disabled' },
    { status: 503 }
  );
}
