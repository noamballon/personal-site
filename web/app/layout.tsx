import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = "Noam Ballon is a designer running Azou Studio. He provides design services and publishes printed objects through Azou Editions.";

export const metadata: Metadata = {
  metadataBase: new URL('https://noam-ballon.com'),
  title: "Noam Ballon",
  description,
  openGraph: {
    title: "Noam Ballon",
    description,
    url: "https://noam-ballon.com",
    siteName: "Noam Ballon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noam Ballon",
    description,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/favicon.png',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
