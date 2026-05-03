import { format } from 'date-fns';
import { Activity, Clock, CheckCircle, Code } from 'lucide-react';
import { Commit } from '@/types/database.types';


import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Disable static rendering for this page to always fetch latest

export default async function DashboardPage() {
  const { data, error } = await supabase
    .from('Commits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commits:', error);
  }

  const commits = data || [];

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-24 selection:bg-accent selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3 text-accent mb-2">
            <Activity className="w-6 h-6" />
            <span className="font-semibold tracking-widest uppercase text-sm">Live System</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-glow">
            Project Updates
          </h1>
          <p className="text-xl text-muted max-w-2xl">
            Real-time, plain-English progress tracking for your application. We push code, you see results.
          </p>
        </header>

        {/* Timeline */}
        <div className="relative pt-8">
          {/* Vertical Line */}
          <div className="absolute left-6 top-10 bottom-0 w-px bg-slab-border" />

          <div className="space-y-8">
            {commits.length === 0 ? (
              <div className="text-center py-12 text-muted border border-dashed border-slab-border rounded-xl">
                <p>No project updates found yet.</p>
                <p className="text-sm mt-2">Waiting for the first code push...</p>
              </div>
            ) : (
              commits.map((commit) => (
                <div key={commit.id} className="relative flex gap-8 group">
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-none w-12 h-12 rounded-full glass-panel flex items-center justify-center border border-white/20 group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                    <CheckCircle className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 slab-card group-hover:border-white/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <h3 className="text-xl font-medium text-foreground">
                        {commit.translated_message || 'System update processed.'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted shrink-0">
                        <Clock className="w-4 h-4" />
                        <time dateTime={commit.created_at}>
                          {format(new Date(commit.created_at), 'MMM d, h:mm a')}
                        </time>
                      </div>
                    </div>
                    
                    {/* Technical details accordion (optional/expandable in future, showing raw here for demo) */}
                    <div className="mt-4 pt-4 border-t border-slab-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted/70 font-mono">
                        <Code className="w-3 h-3" />
                        <span>{commit.hash.substring(0, 7)}</span>
                        <span>•</span>
                        <span>{commit.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
