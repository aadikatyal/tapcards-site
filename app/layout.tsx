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

export const metadata: Metadata = {
  title: "tap profile",
  description: "share your professional profile with a beautiful digital business card. built by tap to make networking seamless.",
  openGraph: {
    title: "tap profile",
    description: "share your professional profile with a beautiful digital business card. built by tap to make networking seamless.",
    type: "website",
    siteName: "tap",
    url: "https://tapcards.us",
    images: [
      {
        url: "/tap.png",
        width: 1200,
        height: 630,
        alt: "tap logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tap profile",
    description: "share your professional profile with a beautiful digital business card. built by tap to make networking seamless.",
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
