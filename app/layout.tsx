import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import the layout wrapper that handles conditional rendering
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vouch | Verified Skills. Real Income.",
  description: "Turn informal hustle into verified skills and paid work for young people in SA and Namibia.",
  manifest: "/manifest.json", 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Inline script to prevent dark mode flickering on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      
      {/* 
        Removed the 'flex' class from the body. 
        The AppLayoutWrapper now handles all flex layouts, sidebars, and headers.
      */}
      <body className="min-h-full bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* 
          AppLayoutWrapper decides whether to show the Sidebar/Top Header 
          based on the current URL path.
        */}
        <AppLayoutWrapper>
          {children}
        </AppLayoutWrapper>
        
      </body>
    </html>
  );
}