"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaLink } from "react-icons/fa";

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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Profile Not Found</h1>
          <p>Sorry, the profile for @{username} doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <img
        src={profile.image}
        alt={profile.name}
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: "20px",
          border: "2px solid #fff",
        }}
      />
      <h1 style={{ fontSize: "28px", margin: "0" }}>{profile.name}</h1>
      <p style={{ fontSize: "18px", margin: "5px 0 20px 0", color: "#aaa" }}>
        {profile.title}
      </p>
      <p
        style={{
          maxWidth: "600px",
          textAlign: "center",
          fontSize: "16px",
          marginBottom: "30px",
          color: "#ccc",
        }}
      >
        {profile.bio}
      </p>

      {/* Custom Links */}
      {profile.links && profile.links.length > 0 && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
          {profile.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={buttonStyle}
            >
              {link.icon && <span>{link.icon}</span>}
              {link.title}
            </a>
          ))}
        </div>
      )}

      {/* Social Links */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {profile.phone && (
          <a href={`tel:${profile.phone}`} style={buttonStyle}>
            <FaPhone /> Call
          </a>
        )}
        {profile.email && (
          <a href={`mailto:${profile.email}`} style={buttonStyle}>
            <FaEnvelope /> Email
          </a>
        )}
        {profile.instagram && (
          <a
            href={`https://instagram.com/${profile.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
          >
            <FaInstagram /> Instagram
          </a>
        )}
        {profile.linkedin && (
          <a
            href={`https://linkedin.com/in/${profile.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
          >
            <FaLinkedin /> LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "#fff",
  border: "1px solid #333",
  padding: "12px 18px",
  borderRadius: "8px",
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  textDecoration: "none",
};