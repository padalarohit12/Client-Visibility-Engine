'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Access Granted');
        
        // Check if admin or client to redirect
        const adminEmails = ['admin@accely.com', 'your-email@example.com'];
        if (adminEmails.includes(email)) {
          router.push('/admin');
        } else {
          // Dashboard redirect is project-specific, 
          // usually we'd redirect to a project selector or the first project.
          // For now, middleware will handle access.
          router.push('/admin'); // Admin will show they aren't authorized and redirect to dashboard
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success('Verification email sent');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-glow">
            Elite Access Portal
          </h1>
          <p className="text-muted text-sm uppercase tracking-widest font-bold">
            Client Visibility Engine
          </p>
        </div>

        <div className="slab-card p-10 space-y-8 backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest ml-1">
                Identity (Email)
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest ml-1">
                Access Key (Password)
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
                  {isLogin ? 'Grant Access' : 'Register Identity'} 
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] text-muted hover:text-white font-bold uppercase tracking-widest transition-colors"
            >
              {isLogin ? 'Request New Account' : 'Return to Secure Login'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-muted/30 font-medium uppercase tracking-[0.3em]">
          Powered by Accely Intelligence Engine
        </p>
      </div>
    </main>
  );
}
