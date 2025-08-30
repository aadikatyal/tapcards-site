import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Helper function to add CORS headers
function addCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// OPTIONS endpoint for CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCORSHeaders(response);
}

// GET endpoint to handle OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return redirectToApp('error', errorDescription || 'OAuth failed');
    }

    // Check if we have the authorization code
    if (!code) {
      console.error('No authorization code received');
      return redirectToApp('error', 'No authorization code received');
    }

    console.log('Received OAuth code:', code);

    // Exchange the authorization code for access token
    const tokenResponse = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code,
    });

    console.log('OAuth token exchange successful');

    // Extract the connected account ID
    const connectedAccountId = tokenResponse.stripe_user_id;
    
    if (!connectedAccountId) {
      console.error('No connected account ID received');
      return redirectToApp('error', 'No connected account ID received');
    }

    console.log('Connected account ID:', connectedAccountId);

    // Store the connected account info (you might want to save this to a database)
    const accountInfo = {
      connectedAccountId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      scope: tokenResponse.scope,
      timestamp: new Date().toISOString(),
    };

    console.log('Account info:', accountInfo);

    // Redirect back to the iOS app with success
    return redirectToApp('success', connectedAccountId);

  } catch (error) {
    console.error('Error processing OAuth callback:', error);
    
    let errorMessage = 'Failed to process OAuth callback';
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message;
    }

    return redirectToApp('error', errorMessage);
  }
}

// Helper function to redirect back to the iOS app
function redirectToApp(status: 'success' | 'error', message: string) {
  // Use your app's custom URL scheme
  const appScheme = 'com.aadikatyal.tap';
  
  let redirectUrl: string;
  
  if (status === 'success') {
    // Success: redirect with connected account ID
    redirectUrl = `${appScheme}://stripe-oauth-success?accountId=${message}`;
  } else {
    // Error: redirect with error message
    redirectUrl = `${appScheme}://stripe-oauth-error?error=${encodeURIComponent(message)}`;
  }

  // Create HTML page that redirects to the app
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Complete</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .message {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }
        .button {
          background: white;
          color: #667eea;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }
        .redirecting {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">${status === 'success' ? '✅' : '❌'}</div>
        <div class="title">${status === 'success' ? 'Connection Successful!' : 'Connection Failed'}</div>
        <div class="message">
          ${status === 'success' 
            ? 'Your Stripe account has been connected successfully. You can now accept payments in the tap app.' 
            : `Error: ${message}`
          }
        </div>
        <a href="${redirectUrl}" class="button">
          ${status === 'success' ? 'Return to App' : 'Try Again'}
        </a>
        <div class="redirecting">
          Redirecting to app in 3 seconds...
        </div>
      </div>
      
      <script>
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '${redirectUrl}';
        }, 3000);
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}