import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/app-providers';
import Logo from './components/Logo';
import NetworkStatus from '@/components/NetworkStatus';
import { Github } from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OKR',
  description: 'A modern OKR management application',
  icons: {
    icon: [
      { url: '/app/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/app/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/app/favicon-64.png', sizes: '64x64', type: 'image/png' }
    ],
    shortcut: '/app/favicon.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*Uncomment for checking re-rendering*/}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        {/*<script*/}
        {/*    crossOrigin="anonymous"*/}
        {/*    src="//unpkg.com/react-scan/dist/auto.global.js"*/}
        {/*/>*/}
        <script
          src="https://cdn.jsdelivr.net/npm/@electric-sql/pglite-repl/dist-webcomponent/Repl.js"
          type="module"
          defer
        ></script>
        <title>OKR</title>
      </head>
      <body className={inter.className}>
        <AppProviders>
          <div className="min-h-screen bg-white">
            <header className="fixed top-0 left-0 right-0 h-20 border-b bg-white/80 backdrop-blur-sm z-40">
              <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4">
                  <Link
                    href="https://github.com/akshayvadher/okr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <NetworkStatus />
                </div>
              </div>
            </header>
            <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
