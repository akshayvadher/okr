import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/app-providers';
import Link from 'next/link';
import NetworkStatus from '@/components/NetworkStatus';

const openSans = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OKR App',
  description: 'Track your objectives and key results',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://cdn.jsdelivr.net/npm/@electric-sql/pglite-repl/dist-webcomponent/Repl.js"
          type="module"
          defer
        ></script>
        <title>OKR App</title>
      </head>
      <body className={openSans.className}>
        <AppProviders>
          <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 bg-white border-b z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center justify-between w-full">
                    <Link
                      href="/"
                      className="text-xl font-semibold text-indigo-600"
                    >
                      OKR App
                    </Link>
                    <NetworkStatus />
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
