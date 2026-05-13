import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '📡 Megaphone Analytics — Inception Point AI',
  description: 'Podcast network analytics dashboard for Megaphone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f1117]">{children}</body>
    </html>
  );
}
