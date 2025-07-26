"use client";
import { useParams } from "next/navigation";

const profiles: Record<string, { name: string; title: string; image: string }> = {
  aadikatyal: {
    name: "Aadi Katyal",
    title: "Founder at Tap",
    image: "/profile-aadi.jpg", // Ensure this file exists in /public
  },
  joey: {
    name: "Joey Garcia",
    title: "Broker at American Life",
    image: "/profile-joey.jpg",
  },
};

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const profile = profiles[username] || {
    name: "Unknown User",
    title: "No details available",
    image: "/default-profile.jpg",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Full height to center vertically
        backgroundColor: "#000", // Optional: Black background
        color: "#fff", // Optional: White text
      }}
    >
      <img
        src={profile.image}
        alt={profile.name}
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: "20px",
        }}
      />
      <h1 style={{ fontSize: "24px", margin: "0 0 10px 0" }}>{profile.name}</h1>
      <p style={{ fontSize: "16px", margin: "0" }}>{profile.title}</p>
    </div>
  );
}