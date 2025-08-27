# Image Upload API Documentation

## Overview
The Image Upload API endpoint allows iOS apps to upload profile pictures for users in the tapcards-site project.

## Endpoint
```
POST /api/upload-image
```

## Features
- ✅ Accepts profile images from iOS apps
- ✅ Saves images to `public/profiles/` directory
- ✅ Generates unique filenames with username and timestamp
- ✅ Returns public URLs for uploaded images
- ✅ Includes CORS headers for cross-origin requests
- ✅ Validates file types (JPEG, PNG, WebP, GIF only)
- ✅ Enforces maximum file size (5MB)
- ✅ Handles errors gracefully with proper HTTP status codes

## Request Format

### Headers
```
Content-Type: multipart/form-data
```

### Form Data
- `image` (required): The image file to upload
- `username` (required): The username associated with the profile

### Example Request (iOS/Swift)
```swift
import Foundation

func uploadProfileImage(image: UIImage, username: String) async throws -> String {
    guard let imageData = image.jpegData(compressionQuality: 0.8) else {
        throw UploadError.invalidImage
    }
    
    let url = URL(string: "https://yourdomain.com/api/upload-image")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    
    let boundary = UUID().uuidString
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    
    var body = Data()
    
    // Add image data
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"image\"; filename=\"profile.jpg\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
    body.append(imageData)
    body.append("\r\n".data(using: .utf8)!)
    
    // Add username
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"username\"\r\n\r\n".data(using: .utf8)!)
    body.append(username.data(using: .utf8)!)
    body.append("\r\n".data(using: .utf8)!)
    
    body.append("--\(boundary)--\r\n".data(using: .utf8)!)
    
    request.httpBody = body
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw UploadError.serverError
    }
    
    let result = try JSONDecoder().decode(UploadResponse.self, from: data)
    return result.data.url
}

struct UploadResponse: Codable {
    let success: Bool
    let message: String
    let data: UploadData
}

struct UploadData: Codable {
    let filename: String
    let url: String
    let size: Int
    let type: String
    let username: String
    let uploadedAt: String
}

enum UploadError: Error {
    case invalidImage
    case serverError
}
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "username-1703123456789.jpg",
    "url": "/profiles/username-1703123456789.jpg",
    "size": 245760,
    "type": "image/jpeg",
    "username": "username",
    "uploadedAt": "2023-12-21T10:30:56.789Z"
  }
}
```

### Error Responses

#### Bad Request (400)
```json
{
  "error": "No image file provided"
}
```

```json
{
  "error": "Username is required"
}
```

```json
{
  "error": "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed"
}
```

```json
{
  "error": "File size too large. Maximum size is 5MB"
}
```

#### Internal Server Error (500)
```json
{
  "error": "Internal server error",
  "message": "Failed to upload image"
}
```

## File Storage

### Directory Structure
```
public/
  profiles/
    username-1703123456789.jpg
    username-1703123456790.png
    anotheruser-1703123456791.webp
```

### Naming Convention
Files are saved with the format: `{username}-{timestamp}.{extension}`

- `username`: The user's username
- `timestamp`: Unix timestamp in milliseconds
- `extension`: Original file extension (jpg, png, webp, gif)

### Public Access
Uploaded images are immediately accessible via their public URLs:
```
https://yourdomain.com/profiles/username-1703123456789.jpg
```

## CORS Support
The API includes CORS headers to allow cross-origin requests from iOS apps:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Testing
Visit `/upload-test` to test the upload functionality in a web browser.

## Security Considerations
- File type validation prevents malicious file uploads
- File size limits prevent abuse
- Unique filenames prevent conflicts
- Images are stored in public directory for immediate access

## Integration with Profiles API
After uploading an image, update the user's profile in the profiles API:
```typescript
// Update profile with new image URL
const profileData = {
  ...existingProfile,
  image: uploadedImageUrl,
  updatedAt: new Date().toISOString()
};

await updateProfile(username, profileData);
```
