import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppLayoutWrapper from '@/components/AppLayoutWrapper'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vouch - Turn your hustle into your next opportunity',
  description: 'Vouch turns real-world experience into trusted skills and better matches.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#f7f9fc] dark:bg-slate-950 transition-colors duration-200`}>
        
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        
        <AppLayoutWrapper>
          {children}
        </AppLayoutWrapper>
        
      </body>
    </html>
  )
}