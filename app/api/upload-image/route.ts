// app/api/upload-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Redis } from '@upstash/redis';

// Initialize Redis client for profile updates
let redis: Redis | null = null;

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  redis = null;
}

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Profile loading and saving functions
async function loadProfiles(): Promise<Record<string, any>> {
  try {
    if (!redis) {
      console.log('Redis not available for profile updates');
      return {};
    }
    
    const profiles = await redis.get('profiles');
    return (profiles as Record<string, any>) || {};
  } catch (error) {
    console.error('Error loading profiles:', error);
    return {};
  }
}

async function saveProfiles(profiles: Record<string, any>) {
  try {
    if (redis) {
      await redis.set('profiles', profiles);
    }
  } catch (error) {
    console.error('Error saving profiles:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Check if the request has a body
    if (!request.body) {
      return NextResponse.json(
        { error: 'No file data provided' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const username = formData.get('username') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.type.split('/')[1];
    const filename = `${username}-${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob Storage instead of local filesystem
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Use the blob URL
    const publicUrl = blob.url;

    // Update the user's profile with the new image URL (keys are lowercase in Redis)
    const normalizedUsername = username.trim().toLowerCase();
    let existingProfile: any = null;
    try {
      const profiles = await loadProfiles();
      existingProfile = profiles[normalizedUsername];
      
      if (existingProfile) {
        // Update the profile with new image URL
        const updatedProfile = {
          ...existingProfile,
          image: publicUrl,
          avatarURL: publicUrl, // Also update avatarURL for iOS compatibility
          updatedAt: new Date().toISOString(),
        };
        
        profiles[normalizedUsername] = updatedProfile;
        await saveProfiles(profiles);
        console.log(`Profile updated for ${normalizedUsername} with new image: ${publicUrl}`);
      } else {
        console.log(`No existing profile found for ${username}, image uploaded but profile not updated`);
      }
    } catch (profileError) {
      console.error('Error updating profile with new image:', profileError);
      // Don't fail the upload if profile update fails
    }

    // Return success response with CORS headers
    return NextResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename,
          url: publicUrl,
          size: file.size,
          type: file.type,
          username,
          uploadedAt: new Date().toISOString(),
          profileUpdated: existingProfile ? true : false
        }
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

  } catch (error) {
    console.error('Error uploading image:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to upload image'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
