'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Smartphone, GitCompare, Bell, Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Cari HP', icon: Smartphone },
    { href: '/compare', label: 'Bandingkan', icon: GitCompare },
    { href: '/watchlist', label: 'Watchlist', icon: Bell },
  ];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-sm">
              <Smartphone size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-ink">
              Cari<span className="text-accent">HP</span>
              <span className="text-ink-3 text-sm font-normal">.id</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  pathname === href
                    ? 'bg-accent/10 text-accent'
                    : 'text-ink-2 hover:text-ink hover:bg-paper-3'
                )}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <Link href="/onboarding"
              className="ml-2 flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all duration-200 shadow-sm">
              <Sparkles size={14} />
              Rekomendasi AI
            </Link>
          </div>

          <button className="md:hidden p-2 text-ink-3 hover:text-ink" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-3 border-t border-border flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold',
                  pathname === href ? 'bg-accent/10 text-accent' : 'text-ink-2 hover:bg-paper-3'
                )}>
                <Icon size={16} />{label}
              </Link>
            ))}
            <Link href="/onboarding" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-500 text-white mt-1">
              <Sparkles size={16} />Rekomendasi AI
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
