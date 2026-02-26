"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPhone, FaEnvelope, FaLink, FaSun, FaMoon } from "react-icons/fa";
import Head from 'next/head';

interface ProfileData {
  username: string;
  name: string;
  title: string;
  image?: string;
  avatarURL?: string;
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
        
        // Update page title and metadata
        document.title = `${username}'s tap profile`;
        
        // Update Open Graph meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', `${username}'s tap profile`);
        
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', profileData.bio || `Connect with ${username} on tap`);
        
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `https://tapcards.us/${username}`);
        
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

  // Function to render brand logos based on icon names from the app
  const renderBrandIcon = (iconName: string, linkTitle?: string) => {
    const iconSize = 20;
    const normalizedIconName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedTitle = linkTitle?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    
    // Handle phone icons
    if (iconName === '📞' || iconName === '📱' || iconName === '☎️' || normalizedTitle === 'phone') {
      return <FaPhone size={20} />;
    }
    
    // Handle email icons
    if (iconName === '✉️' || iconName === '📧' || iconName === '📮' || normalizedTitle === 'email' || normalizedTitle === 'mail') {
      return <FaEnvelope size={20} />;
    }
    
    // Handle message/messaging icons
    if (iconName === '💬' || iconName === '💭' || iconName === '📱' || iconName === '📲' || normalizedTitle === 'message' || normalizedTitle === 'messages' || normalizedTitle === 'chat' || normalizedTitle === 'sms') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      );
    }
    
    // Handle emoji icons by mapping them to brand logos based on title
    if (iconName === '📸' || iconName === '📷' || normalizedTitle === 'instagram') {
      return (
        <svg className={`w-5 h-5`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    }
    
    if (iconName === '🔗' || iconName === '💼' || normalizedTitle === 'linkedin') {
      return (
        <svg className={`w-5 h-5`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    }
    
    // Handle other emoji icons
    if (iconName === '🐦' || normalizedTitle === 'twitter') {
      return (
        <svg className={`w-5 h-5`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    }
    
    if (iconName === '📺' || normalizedTitle === 'youtube') {
      return (
        <svg className={`w-5 h-5`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    }
    
    if (iconName === '🎵' || normalizedTitle === 'tiktok') {
      return (
        <svg className={`w-5 h-5`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    }
    
    if (iconName === '💻' || normalizedTitle === 'github') {
      return (
        <svg className={`w-5 h-5`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    }
    
    if (iconName === '🌐' || normalizedTitle === 'website') {
      return (
        <svg className={`w-5 h-5`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      );
    }
    
    // Fallback to generic link icon
    return <FaLink size={20} />;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}>
        <img
          src={isDarkMode ? "/tap.png" : "/tap-white.png"}
          alt="tap"
          className="w-20 h-20 object-contain animate-pulse"
        />
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
    <>
      <Head>
        <title>{`${username}'s tap profile`}</title>
        <meta property="og:title" content={`${username}'s tap profile`} />
        <meta property="og:description" content={profile.bio || `Connect with ${username} on tap`} />
        <meta property="og:url" content={`https://tapcards.us/${username}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="tap" />
        <meta property="og:image" content="/tap.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:title" content={`${username}'s tap profile`} />
        <meta name="twitter:description" content={profile.bio || `Connect with ${username} on tap`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/tap.png" />
      </Head>
      
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
              src={profile.avatarURL || profile.image || '/default-profile.jpg'}
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

          {/* Contact & Links Section */}
          <div className="flex flex-col items-center gap-3 max-w-sm">
            {/* Custom Links */}
            {profile.links && profile.links.map((link, index) => {
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full px-6 py-4 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 ${
                    isDarkMode 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  title={link.title}
                >
                  {link.icon ? (
                    renderBrandIcon(link.icon, link.title)
                  ) : (
                    <FaLink size={20} />
                  )}
                  <span className="font-medium">{link.title.toLowerCase()}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}