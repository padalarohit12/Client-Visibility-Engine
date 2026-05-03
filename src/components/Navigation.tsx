"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Shield, Layout, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className="w-full p-4 border-b border-white/10 flex justify-between items-center z-50 glass-panel sticky top-0">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-accent">
          <Activity className="w-6 h-6" />
          <span className="font-bold tracking-widest uppercase text-xs text-white hidden sm:inline">Visibility Engine</span>
        </Link>
        
        <div className="h-6 w-px bg-white/10 hidden sm:block" />
        
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
          <Link 
            href="/"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isAdmin ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-muted hover:text-white'}`}
          >
            <Layout className="w-3.5 h-3.5" /> Client Portal
          </Link>
          <Link 
            href="/admin"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isAdmin ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-muted hover:text-white'}`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin Portal
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin ? (
          <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] border border-accent/30 px-2 py-1 rounded">
            Auth Level: Admin
          </span>
        ) : (
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">
            Public View
          </span>
        )}
      </div>
    </nav>
  );
}
