import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. IMPORT THE BOTTOM NAV COMPONENT
// We import it here so it can be rendered globally on every page.
import BottomNav from "@/components/BottomNav";

// Next.js uses these font loaders to optimize font loading.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ==========================================
// METADATA CONFIGURATION
// ==========================================
// This object controls the <head> tags of your app. 
// It tells search engines, social media, and mobile phones what your app is.
export const metadata: Metadata = {
  title: "Vouch | Verified Skills. Real Income.",
  description: "Turn informal hustle into verified skills and paid work for young people in SA and Namibia.",
  
  // THIS IS THE CRITICAL LINE: It tells the browser where to find the PWA manifest file
  // we just created. Without this, the "Add to Home Screen" button won't appear on phones.
  manifest: "/manifest.json", 
};

// ==========================================
// ROOT LAYOUT
// ==========================================
// This component wraps EVERY page in your application. 
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 
        The `body` tag wraps all page content. 
        `min-h-full flex flex-col` ensures the page stretches to the bottom of the screen.
      */}
      <body className="min-h-full flex flex-col">
        {children}
        
        {/* 2. RENDER THE BOTTOM NAV COMPONENT */}
        {/* It sits below {children}, meaning it appears on top of all page content at the bottom of the screen. */}
        <BottomNav />
      </body>
    </html>
  );
}