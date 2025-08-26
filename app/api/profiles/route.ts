import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface ProfileData {
  username: string;
  name: string;
  title: string;
  image: string;
  bio: string;
  phone?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
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
    const profiles = await redis.get('profiles');
    if (profiles) {
      return profiles as Record<string, ProfileData>;
    }
    
    // Return default profiles if none exist
    const defaultProfiles = {
      aadikatyal: {
        username: "aadikatyal",
        name: "Aadi Katyal",
        title: "Founder at Tap",
        image: "/profile-aadi.jpg",
        bio: "i built tap to make digital networking seamless. let's connect!",
        phone: "+1 (732) 858-4219",
        email: "aadi@tapcards.us",
        instagram: "aadikatyal",
        linkedin: "aadikatyal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
    
    // Save default profiles to Redis
    await redis.set('profiles', defaultProfiles);
    return defaultProfiles;
    
  } catch (error) {
    console.error('Error loading profiles:', error);
    return {};
  }
}

// Save profiles to Redis
async function saveProfiles(profiles: Record<string, ProfileData>) {
  try {
    await redis.set('profiles', profiles);
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
    
    if (!username) {
      const errorResponse = NextResponse.json(
        { error: 'Username is required' }, 
        { status: 400 }
      );
      return addCORSHeaders(errorResponse);
    }
    
    const profiles = await loadProfiles();
    const profile = profiles[username];
    
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
    
    const { username, displayName, bio, links, theme, isPublic } = body;
    
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
      bio: bio || existingProfile?.bio || "",
      phone: existingProfile?.phone,
      email: existingProfile?.email,
      instagram: existingProfile?.instagram,
      linkedin: existingProfile?.linkedin,
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
    const { username, displayName, bio, links, theme, isPublic } = body;
    
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