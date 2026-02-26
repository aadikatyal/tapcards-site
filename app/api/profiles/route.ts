import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client with validation
let redis: Redis | null = null;

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!redisUrl || !redisToken) {
    console.warn('Redis environment variables not set, using fallback storage');
  } else {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('Redis client initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  redis = null;
}

interface ProfileData {
  username: string;
  name: string;
  title: string;
  image: string;
  avatarURL?: string;
  bio: string;
  phone?: string;
  email?: string;
  authProvider?: string; // 'google' or 'apple' - to link profile to auth account
  links?: Array<{
    title: string;
    url: string;
    icon?: string;
  }>;
  theme?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Load existing profiles from Redis
async function loadProfiles(): Promise<Record<string, ProfileData>> {
  try {
    if (!redis) {
      console.log('Redis not available, using fallback profiles');
      return getDefaultProfiles();
    }
    
    console.log('Attempting to load profiles from Redis...');
    const profiles = await redis.get('profiles');
    console.log('Redis response:', profiles);
    
    if (profiles) {
      console.log('Profiles found in Redis:', Object.keys(profiles));
      return profiles as Record<string, ProfileData>;
    }
    
    console.log('No profiles in Redis, creating default profiles...');
    const defaultProfiles = getDefaultProfiles();
    
    // Save default profiles to Redis
    console.log('Saving default profiles to Redis...');
    await redis.set('profiles', defaultProfiles);
    console.log('Default profiles saved successfully');
    return defaultProfiles;
    
  } catch (error) {
    console.error('Error loading profiles:', error);
    console.log('Falling back to default profiles');
    return getDefaultProfiles();
  }
}

// Helper function to get default profiles
function getDefaultProfiles() {
  return {
    aadikatyal: {
      username: "aadikatyal",
      name: "Aadi Katyal",
      title: "Founder at Tap",
      image: "/profile-aadi.jpg",
      bio: "i built tap to make digital networking seamless. let's connect!",
      phone: "+1 (732) 858-4219",
      email: "aadi@tapcards.us",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };
}

// Save profiles to Redis
async function saveProfiles(profiles: Record<string, ProfileData>) {
  try {
    await redis?.set('profiles', profiles);
  } catch (error) {
    console.error('Error saving profiles:', error);
    throw error;
  }
}

// Helper function to add CORS headers
function addCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// OPTIONS endpoint for CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCORSHeaders(response);
}

// GET endpoint to fetch a specific profile
// Supports: ?username=xxx OR ?email=xxx&authProvider=google
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const authProvider = searchParams.get('authProvider');
    
    console.log('GET request - username:', username, 'email:', email, 'authProvider:', authProvider);
    
    // Load all profiles
    console.log('Loading profiles...');
    const profiles = await loadProfiles();
    console.log('Available profiles:', Object.keys(profiles));
    
    let profile: ProfileData | undefined;
    
    // If looking up by email + authProvider (for iOS app sign-in)
    if (email && authProvider) {
      console.log(`Searching for profile with email: ${email}, authProvider: ${authProvider}`);
      
      // Search through all profiles to find matching email + authProvider
      for (const [key, p] of Object.entries(profiles)) {
        if (p.email?.toLowerCase() === email.toLowerCase() && 
            p.authProvider === authProvider) {
          profile = p;
          console.log(`Found profile by email+authProvider: ${profile.username}`);
          break;
        }
      }
      
      if (!profile) {
        const errorResponse = NextResponse.json(
          { error: 'Profile not found' }, 
          { status: 404 }
        );
        return addCORSHeaders(errorResponse);
      }
    }
    // If looking up by username (existing functionality)
    else if (username) {
      profile = profiles[username.toLowerCase()];
      console.log('Found profile by username:', profile ? 'yes' : 'no');
      
      if (!profile) {
        const errorResponse = NextResponse.json(
          { error: 'Profile not found' }, 
          { status: 404 }
        );
        return addCORSHeaders(errorResponse);
      }
    }
    // No valid query params
    else {
      const errorResponse = NextResponse.json(
        { error: 'Must provide username or email+authProvider' }, 
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    // Return profile in format expected by iOS app
    const successResponse = NextResponse.json({
      username: profile.username,
      name: profile.name,
      bio: profile.bio,
      avatarURL: profile.avatarURL,
      links: profile.links || [],
      theme: profile.theme || 'default',
      isPublic: profile.isPublic !== false,
    });
    return addCORSHeaders(successResponse);
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
    return addCORSHeaders(errorResponse);
  }
}

// POST endpoint to create/update a profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received profile data:', body);
    
    const { username, displayName, bio, links, theme, isPublic, avatarURL, email, authProvider } = body;
    
    if (!username || !displayName) {
      const errorResponse = NextResponse.json(
        { error: 'Username and displayName are required' }, 
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    const profiles = await loadProfiles();
    const normalizedUsername = username.toLowerCase();
    const existingProfile = profiles[normalizedUsername];
    const isUpdate = existingProfile !== undefined;
    
    // Check if email + authProvider already has a profile (prevent duplicate accounts)
    if (email && authProvider && !isUpdate) {
      for (const [key, p] of Object.entries(profiles)) {
        if (p.email?.toLowerCase() === email.toLowerCase() && 
            p.authProvider === authProvider &&
            key !== normalizedUsername) {
          const errorResponse = NextResponse.json(
            { error: 'Profile already exists for this account', success: false }, 
            { status: 400 }
          );
          return addCORSHeaders(errorResponse);
        }
      }
    }
    
    // Create or update profile
    const now = new Date().toISOString();
    const profileData: ProfileData = {
      username: normalizedUsername,
      name: displayName,
      title: bio ? bio.substring(0, 100) : (existingProfile?.title || "Tap User"),
      image: existingProfile?.image || "/default-profile.jpg",
      avatarURL: avatarURL || existingProfile?.avatarURL,
      bio: bio || existingProfile?.bio || "",
      phone: existingProfile?.phone,
      email: email || existingProfile?.email, // Save email from request
      authProvider: authProvider || existingProfile?.authProvider, // Save authProvider from request
      links: links || existingProfile?.links || [],
      theme: theme || existingProfile?.theme || "default",
      isPublic: isPublic !== undefined ? isPublic : (existingProfile?.isPublic ?? true),
      createdAt: existingProfile?.createdAt || now,
      updatedAt: now,
    };
    
    profiles[normalizedUsername] = profileData;
    await saveProfiles(profiles);
    
    console.log('Profile saved successfully:', profileData);
    
    const successResponse = NextResponse.json({ 
      success: true, 
      profile: {
        username: profileData.username,
        displayName: profileData.name,
        bio: profileData.bio,
        avatarURL: profileData.avatarURL,
        links: profileData.links,
        theme: profileData.theme,
        isPublic: profileData.isPublic,
      },
      url: `https://tapcards.us/${normalizedUsername}`,
      action: isUpdate ? 'updated' : 'created'
    });
    
    return addCORSHeaders(successResponse);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to save profile', success: false }, 
      { status: 500 }
    );
    return addCORSHeaders(errorResponse);
  }
}

// PUT endpoint to update an existing profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, bio, links, theme, isPublic, avatarURL } = body;
    
    if (!username) {
      const errorResponse = NextResponse.json(
        { error: 'Username is required' }, 
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    const profiles = await loadProfiles();
    const normalizedUsername = username.toLowerCase();
    const existingProfile = profiles[normalizedUsername];
    
    if (!existingProfile) {
      const errorResponse = NextResponse.json(
        { error: 'Profile not found' }, 
        { status: 404 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    // Update profile
    const updatedProfile: ProfileData = {
      ...existingProfile,
      name: displayName || existingProfile.name,
      title: bio ? bio.substring(0, 100) : existingProfile.title,
      bio: bio || existingProfile.bio,
      avatarURL: avatarURL || existingProfile.avatarURL,
      links: links || existingProfile.links,
      theme: theme || existingProfile.theme,
      isPublic: isPublic !== undefined ? isPublic : existingProfile.isPublic,
      updatedAt: new Date().toISOString(),
    };
    
    profiles[normalizedUsername] = updatedProfile;
    await saveProfiles(profiles);
    
    const successResponse = NextResponse.json({ 
      success: true, 
      profile: {
        username: updatedProfile.username,
        displayName: updatedProfile.name,
        bio: updatedProfile.bio,
        avatarURL: updatedProfile.avatarURL,
        links: updatedProfile.links,
        theme: updatedProfile.theme,
        isPublic: updatedProfile.isPublic,
      }
    });
    
    return addCORSHeaders(successResponse);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to save profile' }, 
      { status: 500 }
    );
    return addCORSHeaders(errorResponse);
  }
}
