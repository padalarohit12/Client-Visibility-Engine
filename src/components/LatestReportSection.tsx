"use client";

import { useState } from 'react';
import { FileText, Activity, Zap, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ReportPreview } from '@/components/ReportPreview';
import { Portal } from '@/components/Portal';

export function LatestReportSection({ reports }: { reports: any[] }) {
  const [selectedReport, setSelectedReport] = useState<any>(null);

  if (!reports || reports.length === 0) return null;

  const latest = reports[0];
  const history = reports.slice(1);

  return (
    <>
      <section className="space-y-12 animate-fade-in">
        {/* Spotlight: Latest Report */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              Latest Executive Strategy
            </h2>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${latest.type === 'weekly' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'}`}>
                {latest.type}
              </span>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                Delivered {format(new Date(latest.created_at), 'MMMM do, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Block */}
            <div className="lg:col-span-2 slab-card bg-white/5 border-white/10 space-y-4 p-6">
              <div className="flex items-center gap-2 text-accent/50">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Executive Summary</span>
              </div>
              <p className="text-base md:text-lg font-medium leading-relaxed text-white/90">
                {latest.summary}
              </p>
            </div>

            {/* Optimization Opportunities */}
            <div className="slab-card bg-accent/5 border-accent/20 space-y-6 flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Growth Opportunities</span>
                </div>
                <ul className="space-y-3">
                  {(latest.metrics?.ai_strategist_advice || []).slice(0, 3).map((advice: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs text-muted leading-relaxed">
                      <div className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-none" />
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => setSelectedReport(latest)}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white hover:border-accent transition-all text-white flex items-center justify-center gap-2 group"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" /> View & Download Full Report
              </button>
            </div>
          </div>
        </div>

        {/* Strategic Archive: Previous Reports */}
        {history.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
              <div className="w-8 h-[1px] bg-white/10" />
              Strategic Archive
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((r) => (
                <button 
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className="slab-card group hover:border-white/20 transition-all text-left space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${r.type === 'weekly' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {r.type}
                    </span>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                      {format(new Date(r.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2 group-hover:text-white transition-colors italic">
                    &quot;{r.summary.substring(0, 80)}...&quot;
                  </p>
                  <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <FileText className="w-3 h-3" /> View Report
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedReport && (
        <Portal>
          <ReportPreview 
            report={selectedReport} 
            onClose={() => setSelectedReport(null)} 
          />
        </Portal>
      )}
    </>
  );
}
