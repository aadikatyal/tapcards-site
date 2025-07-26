"use client";
import { useParams } from "next/navigation";

const profiles: Record<string, { name: string; title: string; image: string }> = {
  aadikatyal: {
    name: "Aadi Katyal",
    title: "Founder at Tap",
    image: "/profile-aadi.jpg", // put a profile image in /public
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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <img
        src={profile.image}
        alt={profile.name}
        style={{ width: "120px", borderRadius: "50%", marginBottom: "20px" }}
      />
      <h1>{profile.name}</h1>
      <p>{profile.title}</p>
    </div>
  );
}