"use client";

import { useParams } from 'next/navigation';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Profile Page for {username}</h1>
      <p>This is where your contact card will appear.</p>
    </div>
  );
}