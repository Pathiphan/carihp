import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CariHP.id - Temukan Smartphone Terbaik untuk Kamu',
  description: 'Cari, bandingkan, dan temukan smartphone terbaik sesuai kebutuhan dan budget kamu. Rekomendasi AI, spesifikasi lengkap, harga terkini.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-body antialiased min-h-screen bg-paper-2">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-border mt-20 py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="font-display text-xl font-bold text-ink">Cari<span className="text-accent">HP</span>.id</span>
              <p className="text-ink-3 text-sm mt-0.5">Temukan smartphone terbaik untuk kamu</p>
            </div>
            <div className="flex gap-6 text-sm text-ink-3">
              <a href="/" className="hover:text-ink transition-colors">Beranda</a>
              <a href="/compare" className="hover:text-ink transition-colors">Bandingkan</a>
              <a href="/watchlist" className="hover:text-ink transition-colors">Watchlist</a>
            </div>
            <p className="text-gray-400 text-sm">&copy; 2025 CariHP.id</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
