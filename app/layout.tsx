import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import our custom wrapper that decides whether to show the Sidebar/Header
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

// Setup the fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next.js metadata for SEO and PWA support
export const metadata: Metadata = {
  title: "Vouch | Verified Skills. Real Income.",
  description: "Turn informal hustle into verified skills and paid work for young people in SA and Namibia.",
  manifest: "/manifest.json", // Links to the PWA manifest your teammate added
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
        {/* 
          DARK MODE FIX: 
          This inline script runs BEFORE the page renders. 
          It checks local storage or the user's OS settings to see if they prefer dark mode.
          By doing this instantly, it prevents the "white flash" when loading a dark page.
        */}
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
        The body applies the background and text colors globally.
        It also handles the smooth transition when switching between light/dark mode.
      */}
      <body className="min-h-full bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* 
          AppLayoutWrapper is the gatekeeper.
          It looks at the URL. If you are on /login, it renders just the page.
          If you are on /dashboard, it renders the Sidebar + Header + page.
        */}
        <AppLayoutWrapper>
          {children}
        </AppLayoutWrapper>
        
      </body>
    </html>
  );
}