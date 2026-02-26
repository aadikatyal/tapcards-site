import type { Metadata } from "next";
import ProfileContent from "./ProfileContent";

const BASE_URL = "https://tapcards.us";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const title = `${username}'s tap profile`;
  const url = `${BASE_URL}/${username}`;

  return {
    title,
    description: `Connect with ${username} on tap`,
    openGraph: {
      title,
      description: `Connect with ${username} on tap`,
      type: "website",
      siteName: "tap",
      url,
      images: [
        {
          url: `${BASE_URL}/tap.png`,
          width: 1200,
          height: 630,
          alt: "tap",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Connect with ${username} on tap`,
      images: [`${BASE_URL}/tap.png`],
    },
  };
}

export default function ProfilePage() {
  return <ProfileContent />;
}
