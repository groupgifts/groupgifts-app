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
  title: "GroupGifts.me — Group gifting made easy",
  description: "Pool money with friends and family to give the perfect gift together.",
  metadataBase: new URL("https://groupgifts.me"),
  openGraph: {
    title: "GroupGifts.me — Group gifting made easy",
    description: "Pool money with friends and family. Pick the perfect gift, keep it a surprise.",
    url: "https://groupgifts.me",
    siteName: "GroupGifts.me",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GroupGifts.me",
    description: "Pool money with friends and family. Pick the perfect gift, keep it a surprise.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
