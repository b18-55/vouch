import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import our new components
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import HeaderActions from "@/components/HeaderActions";

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
      <body className="min-h-full flex bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800">
          <Sidebar />
        </div>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col md:pl-64 h-screen overflow-hidden">
          
          {/* TOP HEADER (Visible everywhere, handles notifications/profile) */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
              Your experience counts.
            </span>
            <div className="flex items-center gap-4 ml-auto">
              <HeaderActions />
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
        
        {/* MOBILE BOTTOM NAV (Hidden on Desktop) */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <BottomNav />
        </div>
        
      </body>
    </html>
  );
}