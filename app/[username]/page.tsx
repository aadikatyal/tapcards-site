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
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to bottom right, #ff4b2b, #ff416c)",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "30px 20px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          maxWidth: "320px",
          width: "100%",
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
            border: "3px solid #eee",
          }}
        />
        <h1 style={{ fontSize: "22px", margin: "0 0 10px 0", color: "#333" }}>
          {profile.name}
        </h1>
        <p style={{ fontSize: "16px", margin: "0 0 20px 0", color: "#777" }}>
          {profile.title}
        </p>
        <button
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "#ff4b2b",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ff1e00")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ff4b2b")}
        >
          View Contact
        </button>
      </div>
    </div>
  );
}