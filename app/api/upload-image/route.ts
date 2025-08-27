import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // Ensure profiles directory exists
    const profilesDir = path.join(process.cwd(), 'public', 'profiles');
    if (!existsSync(profilesDir)) {
      await mkdir(profilesDir, { recursive: true });
    }

    // Save file to profiles directory
    const filePath = path.join(profilesDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/profiles/${filename}`;

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
          uploadedAt: new Date().toISOString()
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
