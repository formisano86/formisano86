import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'E-Commerce - Il tuo negozio online',
  description: 'Scopri i migliori prodotti nel nostro e-commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
