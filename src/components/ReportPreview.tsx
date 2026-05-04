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
  Check,
  Activity
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
  const commitDetails = report.metrics?.commit_details || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 bg-black/90 backdrop-blur-sm overflow-y-auto no-scrollbar print-root-container">
      <div className="bg-white text-black w-full max-w-4xl rounded-none md:rounded-2xl shadow-2xl relative flex flex-col my-0 md:my-8 min-h-screen md:min-h-0 print:shadow-none print:m-0 print:w-full print:max-w-none print-report-content">
        
        {/* Header / Actions - FIXED POSITION OUTSIDE SCROLL */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 bg-white/95 backdrop-blur-md z-[60] rounded-t-2xl no-print shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm md:text-xl font-bold tracking-tight text-slate-900">Executive Strategy</h2>
            <span className="hidden md:block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {report.type} Report
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={handleCopyLink}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all text-slate-600"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => handleSend('email')}
              className="hidden md:block p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all text-slate-600"
              title="Email PDF"
            >
              <Mail className="w-4 h-4" />
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-black text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export Strategic PDF</span><span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT CONTENT - INDEPENDENT SCROLL */}
        <div className="flex-1 overflow-y-auto p-6 md:p-24 space-y-16 relative bg-white no-scrollbar scroll-smooth">
          
          {/* Subtle Watermark for PDF only */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none rotate-[-45deg] overflow-hidden">
            <h1 className="text-[15rem] font-black uppercase tracking-[0.5em]">ACCELRY</h1>
          </div>

          {/* Page 1: Executive Cover & Summary Block */}
          <div className="print-cover-page space-y-16">
            <header className="space-y-12 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-black">
                  <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic block leading-none text-black">ACCELRY</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Intelligence Engine</span>
                  </div>
                </div>
                <div className="h-px w-24 bg-black/10" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-1">Confidential Strategy Report</p>
                <p className="text-sm font-bold">{format(new Date(report.created_at), 'MMMM do, yyyy')}</p>
              </div>
            </div>

            <div className="space-y-6 pt-12">
              <h1 className="text-6xl font-bold tracking-tighter leading-tight italic max-w-2xl">
                {report.Projects?.name} <br />
                <span className="text-slate-400 not-italic font-medium">{report.type === 'weekly' ? 'Weekly' : 'Monthly'} Impact Report</span>
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100">
              {roiHighlights.map((item: any, i: number) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold italic tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </header>

            {/* Strategic Narrative - Wrapped in no-split for print integrity */}
            <section className="space-y-8 relative z-10 print-no-split">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Executive Summary</h3>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <p className="text-3xl leading-relaxed font-serif italic text-slate-900 pr-12">
                &quot;{report.summary}&quot;
              </p>
            </section>

          {/* AI Strategist Recommendations */}
          {advice.length > 0 && (
            <section className="space-y-8 relative z-10 p-12 bg-slate-50 border-l-8 border-black rounded-r-3xl">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-[0.3em]">Strategist Recommendations</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {advice.map((item: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-2xl font-black italic text-slate-200">0{i+1}</span>
                    <p className="text-sm font-bold leading-relaxed pt-1 text-slate-800">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

            {/* PAGE BREAK FOR PRINT IS NOW HANDLED BY print-cover-page CONTAINER */}
          </div>

          {/* Page 2: Proof of Work Log - Wrapped in log-page for print flow */}
          <section className="space-y-8 relative z-10 pt-12 print:pt-0 print-log-page">
            <div className="flex justify-between items-end border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6" />
                <h4 className="text-sm font-black uppercase tracking-[0.3em]">Tactical Intelligence Log</h4>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                VERIFIED BY ACCELRY INFRASTRUCTURE
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {commitDetails.length > 0 ? (
                commitDetails.map((c: any, i: number) => (
                  <div key={i} className="py-6 flex justify-between items-start group print-log-item">
                    <div className="space-y-2 flex-1 pr-12">
                      <p className="text-lg font-bold leading-tight group-hover:text-accent transition-colors">{c.message}</p>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>{c.author}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span>{c.date ? format(new Date(c.date), 'MMM d, h:mm a') : ''}</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 bg-slate-50 px-2 py-1 rounded shrink-0">
                      {c.hash?.substring(0, 7)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center italic text-slate-400">
                  Detailed technical logs recorded on-chain and verified.
                </div>
              )}
            </div>
          </section>

          {/* Final Footer Branding */}
          <footer className="pt-20 border-t border-slate-100 flex justify-between items-center relative z-10 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
            <div className="flex items-center gap-4">
              <span>AC-LV-ENG v2.1.0</span>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <span>Real-Time ROI Protocol</span>
            </div>
            <div className="flex items-center gap-2 italic text-slate-900">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> ACCELRY SYSTEM VERIFIED
            </div>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* 1. Nuke everything in the DOM from the print view */
          body > *:not(.print-root-container) {
            display: none !important;
          }

          /* 2. Reset Body for printing */
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* 3. Force the Report to be the ONLY thing existing */
          .print-root-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: visible !important;
          }

          /* 4. Selectively show report children */
          .print-report-content {
            display: block !important;
            visibility: visible !important;
            padding: 1.5cm !important; 
            width: 210mm !important; /* Fixed A4 Width */
            margin: 0 auto !important;
            background: white !important;
          }

          /* 5. Hide the Modal Actions (Download/X buttons) */
          .no-print {
            display: none !important;
          }

          /* 6. Fix Page 1 & 2 Integrity */
          .print-cover-page {
            page-break-after: always;
            break-after: page;
            min-height: 280mm; /* Force full page height */
          }

          /* 7. Fix Page 2 Overlap & Flow */
          .print-log-page {
            display: block !important;
            position: static !important;
            padding-top: 1cm !important;
          }

          /* 8. Ensure logs don't split mid-sentence */
          .print-log-item {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 0.5cm !important;
          }

          /* 9. Prevent Summary from Splitting */
          .print-no-split {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* 10. Modernist Typography Overrides for Print */
          h1, h2, h3, h4, p, span {
            color: black !important;
            text-shadow: none !important;
          }
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
