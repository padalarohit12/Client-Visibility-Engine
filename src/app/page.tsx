"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectId.trim()) {
      setIsLoading(true);
      router.push(`/dashboard/${encodeURIComponent(projectId.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col selection:bg-accent selection:text-white">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 relative overflow-hidden">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl w-full mx-auto text-center space-y-8 z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <span>Client Visibility Engine by <span className="text-white">Accelry</span></span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-glow leading-tight">
            See What We're <br className="hidden md:block" /> Building For You.
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            No more wondering about project status. Enter your unique Project ID below to view a real-time, plain-English timeline of exactly what our engineering team is delivering today.
          </p>

          {/* Client Access Portal Form */}
          <div className="pt-12">
            <form onSubmit={handleAccess} className="max-w-md mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 slab-card !p-2 !rounded-xl">
                <div className="flex-1 flex items-center px-4 bg-black/50 rounded-lg border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-muted mr-3" />
                  <input 
                    type="text" 
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter your Project ID..." 
                    className="w-full bg-transparent border-none py-3 text-white placeholder-muted focus:outline-none focus:ring-0"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading || !projectId.trim()}
                  className="bg-white text-black px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'View Project'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
            <p className="text-sm text-muted/50 mt-4">
              Authorized access only. Contact your project manager if you lost your ID.
            </p>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full p-8 border-t border-white/10 text-center">
        <a 
          href="/admin" 
          className="text-xs text-muted/30 hover:text-accent transition-colors font-mono tracking-widest uppercase"
        >
          System Admin Access
        </a>
      </footer>
    </main>
  );
}
