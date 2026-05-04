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
  title: "Accelry — Client Visibility Engine",
  description:
    "Real-time project transparency for agencies. Bridge the gap between technical engineering and business value with AI-powered client reports, live dashboards, and proof-of-work tracking.",
  keywords: [
    "client visibility",
    "agency reporting",
    "proof of work",
    "project dashboard",
    "AI reports",
  ],
};

import Navigation from "@/components/Navigation";
import { Toaster } from "sonner";

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
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Navigation />
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
