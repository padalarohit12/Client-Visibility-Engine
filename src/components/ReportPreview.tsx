"use client";

import { useState } from 'react';
import { 
  X, 
  Download, 
  Mail, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Code,
  Target,
  Clock,
  BarChart3,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { sendReport } from '@/app/admin/actions';
import { toast } from 'sonner';

interface ReportPreviewProps {
  report: any;
  onClose: () => void;
}

export const ReportPreview = ({ report, onClose }: ReportPreviewProps) => {
  const [isSending, setIsSending] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSend = async (channel: string) => {
    setIsSending(channel);
    try {
      await sendReport(report.id, channel);
      toast.success(`Report shared via ${channel}!`);
    } catch (error) {
      toast.error('Failed to share report');
    } finally {
      setIsSending(null);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/report/${report.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const advice = report.metrics?.ai_strategist_advice || [];
  const roiHighlights = report.metrics?.roi_highlights || [];
  const billing = report.metrics?.billing_summary;
  const commitDetails = report.metrics?.commit_details || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-black border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl relative flex flex-col my-auto">
        
        {/* Header / Actions */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-black z-10 rounded-t-2xl no-print">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Executive Report Preview</h2>
            <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
              {report.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyLink}
              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-muted hover:text-white"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => handleSend('email')}
              disabled={isSending !== null}
              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-muted hover:text-white"
              title="Email PDF"
            >
              <Mail className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleSend('whatsapp')}
              disabled={isSending !== null}
              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-muted hover:text-white"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent hover:text-white transition-all"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 hover:text-red-500 transition-all rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div id="printable-report" className="p-12 md:p-16 space-y-12 bg-white text-black min-h-[800px] relative overflow-hidden">
          
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none rotate-[-45deg]">
            <h1 className="text-[12rem] font-black uppercase tracking-[0.5em]">ACCELRY</h1>
          </div>

          {/* Report Branding Header */}
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="w-8 h-8" />
                <span className="text-2xl font-black tracking-tighter uppercase italic">ACCELRY</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Client Work Visibility Engine</p>
            </div>
            <div className="text-right space-y-1">
              <h3 className="text-lg font-bold uppercase tracking-tighter">{report.Projects?.name}</h3>
              <p className="text-sm text-slate-400">{format(new Date(report.created_at), 'MMMM d, yyyy')}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Confidential Executive Update</p>
            </div>
          </div>

          {/* ROI Highlights Grid */}
          {roiHighlights.length > 0 && (
            <section className="relative z-10 grid grid-cols-3 gap-4">
              {roiHighlights.map((item: any, i: number) => (
                <div key={i} className="text-center p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{item.label}</p>
                  {item.change && (
                    <p className="text-xs text-green-600 font-bold mt-1">{item.change}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Executive Summary */}
          <section className="space-y-6 relative z-10">
            <div className="flex items-center gap-3 border-b-2 border-black pb-2">
              <TrendingUp className="w-5 h-5" />
              <h4 className="text-sm font-black uppercase tracking-[0.2em]">Strategic Executive Summary</h4>
            </div>
            <p className="text-xl leading-relaxed font-serif italic text-slate-800">
              &quot;{report.summary}&quot;
            </p>
          </section>

          {/* AI Strategist Recommendations */}
          {advice.length > 0 && (
            <section className="space-y-6 relative z-10 p-8 bg-slate-50 border-l-4 border-black">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-[0.2em]">AI Strategist: Optimization Opportunities</h4>
              </div>
              <ul className="space-y-4">
                {advice.map((item: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="font-bold">{i+1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}



          {/* Work Intelligence Log — Real Proof of Work */}
          <section className="space-y-8 relative z-10">
            <div className="flex justify-between items-end border-b-2 border-black pb-2">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-[0.2em]">Intelligence & Proof of Work</h4>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {report.metrics?.update_count} Strategic Updates Shipped
              </div>
            </div>

            <div className="space-y-3">
              {commitDetails.length > 0 ? (
                commitDetails.map((c: any, i: number) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-900">{c.message}</p>
                      <p className="text-[10px] text-slate-400">
                        {c.author} • {c.date ? format(new Date(c.date), 'MMM d, h:mm a') : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0 ml-4">
                      <Code className="w-3 h-3" /> {c.hash?.substring(0, 7)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <p className="text-xs text-slate-400 italic">Detailed technical verification logs available in your live dashboard.</p>
                </div>
              )}


            </div>
          </section>

          {/* Footer Branding */}
          <footer className="pt-20 border-t border-slate-200 flex justify-between items-center relative z-10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Generated by Accelry Visibility Engine • Real-Time ROI Tracking
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase italic tracking-tighter text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> SYSTEM SECURE & ON-TRACK
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
