'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      toast.success('Admin Identity Verified');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Access Denied');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Accelry Cinematic Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <ShieldCheck className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-glow uppercase italic">
            Accelry
          </h1>
          <p className="text-muted text-[10px] uppercase tracking-[0.4em] font-black">
            Governance Portal
          </p>
        </div>

        <div className="slab-card p-10 space-y-8 backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Secure Access</h2>
            <p className="text-xs text-muted">Client Visibility Engine Admin Panel</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest ml-1">
                Admin Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teamaccelry@gmail.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest ml-1">
                Access Key
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-accent/10 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Identity 
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[9px] text-muted/30 font-medium uppercase tracking-[0.5em]">
          Strategic Partnership Infrastructure
        </p>
      </div>
    </main>
  );
}
