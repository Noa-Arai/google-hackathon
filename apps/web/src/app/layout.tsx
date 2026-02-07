import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'CIRCLE | サークル活動支援',
  description: 'サークル活動を効率的に管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-black">
        <Header />
        <main className="pt-24 pb-16 px-6 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
