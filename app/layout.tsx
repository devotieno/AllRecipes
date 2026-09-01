import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AllRecipes Featured Tweaks',
  description: 'Generate modified recipes from AllRecipes Featured Tweaks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}