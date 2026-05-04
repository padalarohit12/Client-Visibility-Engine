import { format } from 'date-fns';
import { 
  Activity, 
  Clock, 
  Code, 
  ExternalLink, 
  TrendingUp, 
  Zap, 
  Target,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Bell,
  Share2,
  Copy,
  Users,
  FileText,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { LatestReportSection } from '@/components/LatestReportSection';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import { getProjectAlerts } from '@/app/admin/actions';

export const revalidate = 0;

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params;

  // 1. Get the Project details
  const { data: project } = await supabaseAdmin
    .from('Projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) {
    notFound();
  }


  // 2. Fetch commits
  const { data: commitsData } = await supabaseAdmin
    .from('Commits')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false });

  const commits = commitsData || [];

  // 3. Fetch latest reports
  const { data: reportsData } = await supabaseAdmin
    .from('Reports')
    .select('*')
    .eq('project_id', project.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  const reports = reportsData || [];

  // 4. Fetch pulses
  let pulses: any[] = [];
  try {
    const { data: pulsesData, error: pulseError } = await supabaseAdmin
      .from('Pulses')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!pulseError) {
      pulses = pulsesData || [];
    }
  } catch (e) {
    console.error('Pulses fetch failed', e);
  }

  // 5. Get alerts
  let alerts: { type: string; message: string; timestamp: string }[] = [];
  try {
    alerts = await getProjectAlerts(project.id);
  } catch (e) {
    // Alerts are non-critical
  }

  // Helper to build GitHub URL
  const getCommitUrl = (repoUrl: string | null, hash: string) => {
    if (!repoUrl) return null;
    const cleanRepoUrl = repoUrl.replace(/\.git$/, '');
    return `${cleanRepoUrl}/commit/${hash}`;
  };

  // Calculate stats
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const weeklyCommits = commits.filter(c => new Date(c.created_at) >= sevenDaysAgo);
  const uniqueAuthors = new Set(commits.map(c => c.author)).size;

  const statusConfig = {
    on_track: { color: 'bg-green-500', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]', label: 'On Track', icon: CheckCircle2 },
    at_risk: { color: 'bg-yellow-500', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]', label: 'At Risk', icon: AlertTriangle },
    blocked: { color: 'bg-red-500', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]', label: 'Blocked', icon: XCircle },
  };

  const currentStatus = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.on_track;
  const StatusIcon = currentStatus.icon;

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-12 lg:p-24 selection:bg-accent selection:text-white">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div className="space-y-3 animate-fade-in-up">
            {alerts.map((alert, i) => (
              <div 
                key={i}
                className={`flex items-center gap-3 p-4 rounded-xl border ${
                  alert.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                  'bg-green-500/10 border-green-500/20 text-green-400'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* SaaS Header / Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <header className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 text-accent mb-2">
              <div className="relative">
                <Activity className="w-6 h-6 animate-pulse" />
                <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
              </div>
              <span className="font-bold tracking-[0.3em] uppercase text-[10px]">Client Visibility Engine by <span className="text-white italic">Accelry</span></span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-glow leading-tight">
              {project.name}
            </h1>
            <p className="text-xl text-muted max-w-2xl leading-relaxed">
              Real-time, high-fidelity progress tracking. We bridge the gap between technical engineering and business value.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                <StatusIcon className="w-3.5 h-3.5" />
                <span className={`w-2 h-2 rounded-full ${currentStatus.color} ${currentStatus.glow}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{currentStatus.label}</span>
              </div>

            </div>
          </header>
          {/* Executive Word from Agency */}
          {project.agency_note && (
            <div className="slab-card space-y-4 border-accent/40 bg-accent/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-12 h-12 text-accent" />
              </div>
              <div className="flex items-center gap-2 text-accent">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Message from Rohit (Accelry)</span>
              </div>
              <p className="text-lg font-medium text-white/90 leading-relaxed italic">
                &quot;{project.agency_note}&quot;
              </p>
            </div>
          )}

          {project.impact_summary && (
            <div className="slab-card space-y-4 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 text-accent/70">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Strategic Outcome Summary</span>
              </div>
              <p className="text-sm text-muted italic leading-relaxed">
                &quot;{project.impact_summary}&quot;
              </p>
            </div>
          )}
        </div>

        {/* ROI & Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="slab-card text-center space-y-2 hover:border-accent/30 transition-colors">
            <BarChart3 className="w-6 h-6 text-accent mx-auto" />
            <p className="text-3xl font-bold">{commits.length}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Total Updates</p>
          </div>
          <div className="slab-card text-center space-y-2 hover:border-accent/30 transition-colors">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto" />
            <p className="text-3xl font-bold">{weeklyCommits.length}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">This Week</p>
          </div>
          <div className="slab-card text-center space-y-2 hover:border-accent/30 transition-colors">
            <Target className="w-6 h-6 text-purple-500 mx-auto" />
            <p className="text-3xl font-bold">{uniqueAuthors}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Contributors</p>
          </div>
          <div className="slab-card text-center space-y-2 hover:border-accent/30 transition-colors">
            <ShieldCheck className="w-6 h-6 text-blue-500 mx-auto" />
            <p className="text-3xl font-bold">{reports.length}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Reports Generated</p>
          </div>
        </div>

        {/* Latest Executive Strategy - Published from Admin */}
        <LatestReportSection reports={reports} />

        {/* Strategic Pulse Feed - Proactive Micro-Updates */}
        {pulses.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Zap className="w-6 h-6 text-accent" />
              Live Strategic Milestones
            </h2>
            <div className="space-y-4">
              {pulses.map((pulse) => (
                <div key={pulse.id} className="slab-card flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-accent/30 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 text-accent">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Live Strategic Update</span>
                      </div>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                        {format(new Date(pulse.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <p className="text-lg font-medium text-white/90 leading-relaxed">
                      &quot;{pulse.strategic_note}&quot;
                    </p>
                    <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                      <div className="px-2 py-1 bg-white/5 rounded font-mono text-[9px] text-muted">
                        {pulse.commit_hash?.substring(0, 7)}
                      </div>
                      <p className="text-[10px] text-muted italic">
                        Context: {pulse.message || 'Strategic platform refinement'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

          {/* Strategic Roadmap Section */}
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
              <div className="w-8 h-[1px] bg-white/10" />
              Executive Report Governance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(project.milestones || [
                { title: 'Foundation Phase', status: 'completed', description: 'Core architecture and security hardening.' },
                { title: 'Expansion Phase', status: 'active', description: 'Feature scaling and performance optimization.' },
                { title: 'Market Leadership', status: 'upcoming', description: 'Advanced AI integration and market dominance.' }
              ]).map((m: any, i: number) => (
                <div key={i} className={`slab-card relative overflow-hidden ${m.status === 'active' ? 'border-accent bg-accent/5' : 'opacity-60'}`}>
                  {m.status === 'active' && <div className="absolute top-0 right-0 p-2 bg-accent text-[8px] text-white font-bold uppercase">Current</div>}
                  <p className="text-xs font-bold uppercase tracking-widest mb-2">{m.title}</p>
                  <p className="text-[11px] text-muted leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* AI Strategist Advice with Interactive Buttons */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-6 h-6 text-accent" />
                Active Strategic Summary
              </h2>
            </div>
            <div className="slab-card bg-accent/5 border-accent/20 space-y-6">
              <ul className="space-y-4">
                {(reports[0]?.metrics?.ai_strategist_advice || [
                  "Leveraging latest architecture gains to prepare for mobile expansion.",
                  "Optimized backend throughput allows for a 20% increase in concurrent user load.",
                  "Strategic refactoring of core modules has reduced future technical debt by an estimated 15%."
                ]).map((advice: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-none" />
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button className="px-4 py-2 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-lg shadow-accent/20">
                  Approve for Sprint
                </button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-muted text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all">
                  Request Discussion
                </button>
              </div>
            </div>
          </section>

        {/* Live Activity Stream */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Code className="w-6 h-6 text-accent" />
              Tactical Delivery Logs
            </h2>
            <div className="hidden md:flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
                <div className="w-2 h-2 rounded-full bg-accent pulse-dot" /> Live Updates
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
                <Share2 className="w-3 h-3" /> Shareable
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent" />

            <div className="space-y-12">
              {commits.length === 0 ? (
                <div className="text-center py-20 slab-card border-dashed">
                  <Activity className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                  <p className="text-muted text-lg">Initializing intelligence feed...</p>
                  <p className="text-sm text-muted/50 mt-2">Waiting for first deployment signal.</p>
                </div>
              ) : (
                commits.map((commit, i) => (
                  <div 
                    key={commit.id} 
                    className="relative flex gap-12 group animate-fade-in-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Node */}
                    <div className="relative z-10 flex-none w-16 h-16 rounded-2xl glass-panel flex items-center justify-center border border-white/10 group-hover:border-accent group-hover:bg-accent/10 transition-all duration-500 shadow-2xl">
                      <ShieldCheck className="w-6 h-6 text-muted group-hover:text-accent transition-colors" />
                      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 blur-xl transition-all" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 slab-card group-hover:translate-x-2 transition-transform duration-500 bg-white/[0.02]">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest px-2 py-0.5 bg-accent/10 rounded border border-accent/20">Production Shipped</span>
                            <span className="text-xs text-muted flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {format(new Date(commit.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <h3 className="text-2xl font-medium leading-snug group-hover:text-glow">
                            {commit.translated_message || 'System architecture refinement deployed.'}
                          </h3>
                          {/* Show original commit for transparency */}
                          <p className="text-xs text-muted/40 font-mono">
                            Technical: {commit.original_message.substring(0, 80)}{commit.original_message.length > 80 ? '...' : ''}
                          </p>
                        </div>

                        {/* Proof of Work */}
                        <div className="flex-none flex flex-col items-end gap-3">
                          {getCommitUrl(project.repository_url, commit.hash) && (
                            <a 
                              href={getCommitUrl(project.repository_url, commit.hash)!}
                              target="_blank"
                              className="flex items-center gap-2 text-[10px] font-bold text-muted hover:text-white uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-all hover:border-accent/50"
                            >
                              Proof of Work <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <div className="text-[10px] font-mono text-muted/40 uppercase tracking-widest">
                            SHA: {commit.hash.substring(0, 7)}
                          </div>
                          <div className="text-[10px] text-muted/30">
                            by {commit.author}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
              Powered by Accelry — Client Work Visibility Engine
            </p>
            <p className="text-[10px] text-muted/30">
              Real-time ROI tracking • Proof of Work verification • AI-powered intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase italic tracking-tighter text-muted">
            <div className="w-2 h-2 rounded-full bg-accent pulse-dot" /> SYSTEM LIVE
          </div>
        </footer>
      </div>
    </main>
  );
}
