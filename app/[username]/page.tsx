"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaLink, FaSun, FaMoon } from "react-icons/fa";

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

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await fetch(`/api/profiles?username=${username}`);
        
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        
        const profileData = await response.json();
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path 
                fill={isDarkMode ? "#fff" : "#000"} 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p>Sorry, the profile for @{username} doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'bg-white text-black hover:bg-gray-100' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>

      {/* Tap Logo */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8">
            <img 
              src={isDarkMode ? "/tap.png" : "/tap-white.png"}
              alt="tap logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
            tap
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Profile Picture */}
        <div className="relative mb-8">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-32 h-32 rounded-full object-cover border-4 transition-all duration-300 hover:scale-105"
            style={{
              borderColor: isDarkMode ? '#fff' : '#000'
            }}
          />
        </div>

        {/* Name */}
        <h1 className="text-3xl font-bold mb-6 text-center">
          {profile.name}
        </h1>

        {/* Bio */}
        {profile.bio && (
          <p className="text-lg text-center max-w-md mb-12 leading-relaxed opacity-90">
            {profile.bio}
          </p>
        )}

        {/* Custom Links */}
        {profile.links && profile.links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-8 max-w-md">
            {profile.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-gray-100' 
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.title}
              </a>
            ))}
          </div>
        )}

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-4 max-w-md">
          {profile.phone && (
            <a 
              href={`tel:${profile.phone}`} 
              className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FaPhone size={20} />
            </a>
          )}
          {profile.email && (
            <a 
              href={`mailto:${profile.email}`} 
              className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FaEnvelope size={20} />
            </a>
          )}
          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FaInstagram size={20} />
            </a>
          )}
          {profile.linkedin && (
            <a
              href={`https://linkedin.com/in/${profile.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FaLinkedin size={20} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}