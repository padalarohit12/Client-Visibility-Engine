import { format } from 'date-fns';
import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Code,
  Target,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reportId: string }>
}): Promise<Metadata> {
  const { reportId } = await params;
  const { data: report } = await supabaseAdmin
    .from('Reports')
    .select('*')
    .eq('id', reportId)
    .single();

  let projectName = 'Unknown';
  if (report?.project_id) {
    const { data: proj } = await supabaseAdmin
      .from('Projects')
      .select('name')
      .eq('id', report.project_id)
      .single();
    projectName = proj?.name || 'Unknown';
  }

  return {
    title: report ? `${projectName} — ${report.type} Report | Accelry` : 'Report Not Found',
    description: report?.summary?.substring(0, 160) || 'View this project report powered by Accelry Visibility Engine.',
  };
}

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>
}) {
  const { reportId } = await params;

  const { data: reportData } = await supabaseAdmin
    .from('Reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (!reportData) {
    notFound();
  }

  // Manually join project name
  const { data: proj } = await supabaseAdmin
    .from('Projects')
    .select('name')
    .eq('id', reportData.project_id)
    .single();

  const report = { ...reportData, Projects: { name: proj?.name || 'Unknown' } };

  const advice = report.metrics?.ai_strategist_advice || [];
  const roiHighlights = report.metrics?.roi_highlights || [];
  const billing = report.metrics?.billing_summary;
  const commitDetails = report.metrics?.commit_details || [];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Branded Header */}
      <div className="w-full p-6 border-b border-white/10 bg-white/5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck className="w-6 h-6 text-accent" />
            <span className="font-bold tracking-widest uppercase text-xs">Accelry Report</span>
          </div>
          <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
            {report.type} Report
          </span>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto p-8 md:p-16 space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-2xl font-black tracking-tighter uppercase italic">ACCELRY</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-glow">
            {report.Projects?.name}
          </h1>
          <p className="text-muted">
            {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Executive Report • {format(new Date(report.created_at), 'MMMM d, yyyy')}
          </p>
        </div>

        {/* ROI Highlights */}
        {roiHighlights.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {roiHighlights.map((item: any, i: number) => (
              <div key={i} className="slab-card text-center space-y-2">
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{item.label}</p>
                {item.change && (
                  <p className="text-xs text-green-400 font-bold">{item.change}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Executive Summary */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Strategic Executive Summary</h2>
          </div>
          <p className="text-xl leading-relaxed text-muted italic">
            &quot;{report.summary}&quot;
          </p>
        </section>

        {/* AI Strategist */}
        {advice.length > 0 && (
          <section className="slab-card bg-accent/5 border-accent/20 space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">AI Strategist Recommendations</h2>
            </div>
            <ul className="space-y-3">
              {advice.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-muted">
                  <span className="text-accent font-bold">{i+1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Proof of Work */}
        {commitDetails.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Proof of Work Log</h2>
              </div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
                {report.metrics?.update_count} updates
              </span>
            </div>
            <div className="space-y-3">
              {commitDetails.map((c: any, i: number) => (
                <div key={i} className="slab-card py-4 flex justify-between items-center hover:border-white/20 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{c.message}</p>
                    <p className="text-[10px] text-muted">
                      {c.author} • {c.date ? format(new Date(c.date), 'MMM d, h:mm a') : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted/40 shrink-0 ml-4">
                    <Code className="w-3 h-3" /> {c.hash?.substring(0, 7)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            Powered by Accelry — Client Work Visibility Engine
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase italic tracking-tighter text-muted">
            <div className="w-2 h-2 rounded-full bg-accent pulse-dot" /> VERIFIED REPORT
          </div>
        </footer>
      </div>
    </main>
  );
}
