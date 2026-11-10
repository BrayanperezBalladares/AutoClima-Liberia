import type { Metadata } from 'next';
import { Barlow } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-barlow',
});

export const metadata: Metadata = {
  title: 'Auto Clima Liberia — Gestión de Pedidos y Entregas',
  description: 'Sistema Digital de Gestión y Seguimiento de Pedidos y Entregas para Auto Clima Sucursal Liberia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={barlow.variable}>
      <body className={`${barlow.className} antialiased min-h-screen bg-slate-50 text-slate-900`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
