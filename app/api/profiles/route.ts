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
  avatarURL?: string; // Add this for iOS app compatibility
  bio: string;
  phone?: string;
  email?: string;
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
    // Return default profiles if none exist
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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    console.log('GET request for username:', username);
    
    if (!username) {
      const errorResponse = NextResponse.json(
        { error: 'Username is required' }, 
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    console.log('Loading profiles...');
    const profiles = await loadProfiles();
    console.log('Available profiles:', Object.keys(profiles));
    
    const profile = profiles[username];
    console.log('Found profile:', profile ? 'yes' : 'no');
    
    if (!profile) {
      const errorResponse = NextResponse.json(
        { error: 'Profile not found' }, 
        { status: 404 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    const successResponse = NextResponse.json(profile);
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
    
    const { username, displayName, bio, links, theme, isPublic, avatarURL } = body;
    
    if (!username || !displayName) {
      const errorResponse = NextResponse.json(
        { error: 'Username and displayName are required' }, 
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    const profiles = await loadProfiles();
    const existingProfile = profiles[username];
    const isUpdate = existingProfile !== undefined;
    
    // Create or update profile
    const now = new Date().toISOString();
    const profileData: ProfileData = {
      username: username.toLowerCase(),
      name: displayName,
      title: bio ? bio.substring(0, 100) : (existingProfile?.title || "Tap User"),
      image: existingProfile?.image || "/default-profile.jpg",
      avatarURL: avatarURL || existingProfile?.avatarURL,
      bio: bio || existingProfile?.bio || "",
      phone: existingProfile?.phone,
      email: existingProfile?.email,
      links: links || existingProfile?.links || [],
      theme: theme || existingProfile?.theme || "default",
      isPublic: isPublic !== undefined ? isPublic : (existingProfile?.isPublic ?? true),
      createdAt: existingProfile?.createdAt || now,
      updatedAt: now,
    };
    
    profiles[username] = profileData;
    await saveProfiles(profiles);
    
    console.log('Profile saved successfully:', profileData);
    
    const successResponse = NextResponse.json({ 
      success: true, 
      profile: profileData,
      url: `https://tapcards.us/${username}`,
      action: isUpdate ? 'updated' : 'created'
    });
    
    return addCORSHeaders(successResponse);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to save profile' }, 
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
    const existingProfile = profiles[username];
    
    if (!existingProfile) {
      const errorResponse = NextResponse.json(
        { error: 'Profile not found' }, 
        { status: 400 }
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
    
    profiles[username] = updatedProfile;
    await saveProfiles(profiles);
    
    const successResponse = NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
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