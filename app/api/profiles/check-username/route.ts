import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace this with a real database
// This should match the same storage as /api/profiles/route.ts
const profiles: Map<string, any> = new Map();

// Helper function to add CORS headers
function addCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// OPTIONS endpoint for CORS preflight requests
export async function OPTIONS() {
  const response = NextResponse.json({});
  return addCORSHeaders(response);
}

// GET /api/profiles/check-username?username=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      const badRequestResponse = NextResponse.json(
        { error: 'Username is required', available: false },
        { status: 400 }
      );
      return addCORSHeaders(badRequestResponse);
    }

    const normalizedUsername = username.toLowerCase();
    const isAvailable = !profiles.has(normalizedUsername);

    const response = NextResponse.json({
      available: isAvailable,
      username: normalizedUsername,
    });
    return addCORSHeaders(response);

  } catch (error) {
    console.error('Error checking username:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to check username', available: false },
      { status: 500 }
    );
    return addCORSHeaders(errorResponse);
  }
}
