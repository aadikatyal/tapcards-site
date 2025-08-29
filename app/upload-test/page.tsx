'use client';

import { useState } from 'react';

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !username.trim()) {
      setError('Please select a file and enter a username');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('username', username);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Profile Image Upload Test
          </h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max size: 5MB. Supported: JPEG, PNG, WebP, GIF
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !file || !username.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <h3 className="text-green-800 font-medium mb-2">Upload Successful!</h3>
                <div className="text-green-700 text-sm space-y-1">
                  <p><strong>Filename:</strong> {result.data.filename}</p>
                  <p><strong>URL:</strong> {result.data.url}</p>
                  <p><strong>Size:</strong> {(result.data.size / 1024).toFixed(2)} KB</p>
                  <p><strong>Type:</strong> {result.data.type}</p>
                  <p><strong>Username:</strong> {result.data.username}</p>
                  <p><strong>Profile Updated:</strong> {result.data.profileUpdated ? '✅ Yes' : '❌ No profile found'}</p>
                </div>
                {result.data.url && (
                  <div className="mt-3">
                    <img 
                      src={result.data.url} 
                      alt="Uploaded profile" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    {result.data.profileUpdated && (
                      <div className="mt-3">
                        <a
                          href={`/api/profiles?username=${result.data.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View Updated Profile API
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
