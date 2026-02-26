import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://tapcards.us";

const SITE_TITLE = "tap ᯤ";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: "your digital business card. create a profile, share your link, and connect seamlessly.",
  icons: {
    icon: "/tap.png",
    apple: "/tap.png",
  },
  openGraph: {
    title: SITE_TITLE,
    description: "your digital business card. create a profile, share your link, and connect seamlessly.",
    type: "website",
    siteName: "tap",
    url: SITE_URL,
    images: [
      {
        url: "/tap.png",
        width: 1200,
        height: 630,
        alt: "tap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: "your digital business card. create a profile, share your link, and connect seamlessly.",
    images: ["/tap.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
