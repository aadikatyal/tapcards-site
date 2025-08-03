"use client";

import { useParams } from "next/navigation";
import { FaInstagram, FaLinkedin, FaPhone, FaEnvelope } from "react-icons/fa";

const profiles: Record<
  string,
  {
    name: string;
    title: string;
    image: string;
    bio: string;
    phone?: string;
    email?: string;
    instagram?: string;
    linkedin?: string;
  }
> = {
  aadikatyal: {
    name: "Aadi Katyal",
    title: "Founder at Tap",
    image: "/profile-aadi.jpg",
    bio: "I'm building Tap to make digital networking seamless. Let’s connect!",
    phone: "+1 (555) 123-4567",
    email: "aadi@tapcards.us",
    instagram: "aadikatyal",
    linkedin: "aadikatyal",
  },
  joey: {
    name: "Joey Garcia",
    title: "Broker at American Life",
    image: "/profile-joey.jpg",
    bio: "Helping families find financial security. Licensed in 10 states.",
    phone: "+1 (555) 987-6543",
    email: "joey@americanlife.com",
    instagram: "joeygarcia",
    linkedin: "joey-garcia",
  },
};

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const profile = profiles[username] || {
    name: "Unknown User",
    title: "No details available",
    image: "/default-profile.jpg",
    bio: "",
  };

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

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {profile.phone && (
          <a
            href={`tel:${profile.phone}`}
            style={buttonStyle}
          >
            <FaPhone /> Call
          </a>
        )}
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            style={buttonStyle}
          >
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