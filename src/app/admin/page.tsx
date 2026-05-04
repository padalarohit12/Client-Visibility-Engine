"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Settings, 
  LayoutDashboard, 
  Users, 
  Lock,
  ArrowRight,
  ExternalLink,
  FileText,
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Bell,
  Copy,
  Check,
  RefreshCw,
  X,
  History as HistoryIcon
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  getProjects, 
  createProject, 
  deleteProject, 
  getAllCommits,
  syncProjectCommits,
  getReports,
  generateProjectReport,
  updateProjectSaaSData,
  publishReport,
  sendPulse,
  deletePulse,
  getPulses
} from './actions';
import { ReportPreview } from '@/components/ReportPreview';
import { Portal } from '@/components/Portal';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminPortal() {
  const [showPreview, setShowPreview] = useState(false);
  const [pulseCommit, setPulseCommit] = useState<any>(null);
  const [strategicNote, setStrategicNote] = useState('');
  const [isSendingPulse, setIsSendingPulse] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'feed' | 'reports'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [commits, setCommits] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [pulses, setPulses] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [p, c, r, pulseData] = await Promise.all([
        getProjects().catch(e => { console.error('Projects Error:', e); return []; }),
        getAllCommits().catch(e => { console.error('Commits Error:', e); return []; }),
        getReports().catch(e => { console.error('Reports Error:', e); return []; }),
        getPulses().catch(e => { console.error('Pulses Error:', e); return []; })
      ]);
      
      setProjects(p || []);
      setCommits(c || []);
      setReports(r || []);
      setPulses(pulseData || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const repo = formData.get('repo') as string;

    const form = e.currentTarget;
    try {
      await createProject(name, repo);
      form.reset();
      loadData();
      toast.success('Project created successfully');
    } catch (error: any) {
      toast.error(`Error creating project: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteProject = (id: string) => {
    toast.error('Are you sure you want to delete this project?', {
      action: {
        label: 'Delete Project',
        onClick: async () => {
          try {
            await deleteProject(id);
            loadData();
            toast.success('Project deleted');
          } catch (error) {
            toast.error('Error deleting project');
          }
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    });
  };

  const handleSync = async (projectId: string) => {
    setSyncingId(projectId);
    try {
      const result = await syncProjectCommits(projectId);
      toast.success(`Sync complete! Found ${result.newSyncCount} new updates.`);
      loadData();
    } catch (error: any) {
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleUpdateSaaS = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
      const data = {
        status: formData.get('status') as string,
        progress_percent: parseInt(formData.get('progress') as string) || 0,
        impact_summary: formData.get('impact') as string,
        hourly_rate: parseInt(formData.get('hourly_rate') as string) || 2500,
        retainer_cost: parseInt(formData.get('retainer_cost') as string) || 80000,
        webhook_url: formData.get('webhook_url') as string,
        client_email: formData.get('client_email') as string,
        agency_note: formData.get('agency_note') as string,
        milestones: JSON.parse(formData.get('milestones') as string || '[]'),
      };

      try {
        await updateProjectSaaSData(id, data);
      setEditingProjectId(null);
      loadData();
      toast.success('SaaS metadata updated');
    } catch (error) {
      toast.error('Error updating project data');
    }
  };

  const handleGenerateReport = async (projectId: string, type: 'weekly' | 'monthly') => {
    setIsGeneratingReport(`${projectId}-${type}`);
    try {
      const report = await generateProjectReport(projectId, type);
      setSelectedReport(report);
      loadData();
      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(`Report generation failed: ${error.message}`);
    } finally {
      setIsGeneratingReport(null);
    }
  };

  const copyDashboardLink = (id: string) => {
    const url = `${window.location.origin}/dashboard/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Dashboard link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyReportLink = (id: string) => {
    const url = `${window.location.origin}/report/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Report link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendPulse = async () => {
    if (!pulseCommit || !strategicNote) return;
    setIsSendingPulse(true);
    try {
      await sendPulse(pulseCommit.project_id, pulseCommit, strategicNote);
      toast.success('Strategic pulse sent to client!');
      setPulseCommit(null);
      setStrategicNote('');
    } catch (e) {
      toast.error('Failed to send pulse');
    } finally {
      setIsSendingPulse(false);
    }
  };


  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Accelry Global Admin Header */}
      <header className="w-full py-6 px-8 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tight uppercase">Accelry</h1>
            <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold">Client Visibility Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-white font-bold tracking-widest uppercase">Admin Session</p>
            <p className="text-[9px] text-muted font-medium tracking-wider">teamaccelry@gmail.com</p>
          </div>
          <button 
            onClick={async () => { 
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all group"
            title="Secure Logout"
          >
            <Lock className="w-5 h-5 opacity-50 group-hover:opacity-100" />
          </button>
        </div>
      </header>

      {/* Pulse Modal Overlay */}
      {pulseCommit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="slab-card w-full max-w-lg space-y-6 animate-fade-in-up border-accent/30 shadow-2xl shadow-accent/10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent animate-pulse" />
                Strategic Update
              </h3>
              <button onClick={() => setPulseCommit(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-muted hover:text-white" />
              </button>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-accent/50" />
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Original Feed Context</span>
              </div>
              <p className="text-sm font-medium italic text-white/80">&quot;{pulseCommit.translated_message || pulseCommit.message}&quot;</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-accent" />
                Strategic Impact (The &quot;So What?&quot;)
              </label>
              <textarea 
                value={strategicNote}
                onChange={(e) => setStrategicNote(e.target.value)}
                placeholder="Explain the business value... (e.g. This update cuts latency by 500ms, making the checkout experience feel instant.)"
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm min-h-[140px] focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all resize-none"
              />
            </div>

            <button 
              onClick={handleSendPulse}
              disabled={isSendingPulse || !strategicNote}
              className="w-full py-4 bg-accent text-white rounded-xl font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
            >
              {isSendingPulse ? (
                <span className="flex items-center justify-center gap-2">
                   <RefreshCw className="w-4 h-4 animate-spin" /> Pushing to Client...
                </span>
              ) : 'Push Strategic Pulse'}
            </button>
          </div>
        </div>
      )}
      {/* Admin Sub-Nav */}
      <div className="w-full p-4 border-b border-white/10 flex justify-center items-center bg-white/5 no-print">
        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'projects' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Portfolio Governance
          </button>
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'feed' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-white'}`}
          >
            <Activity className="w-4 h-4" /> Velocity Feed
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Strategy Archive
          </button>

        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 max-w-6xl w-full mx-auto space-y-12">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Loading engine data...</p>
          </div>
        ) : activeTab === 'projects' ? (
          <div className="space-y-12">
            {/* Create Project Form */}
            <section className="slab-card space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Plus className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">Deploy New Project</h2>
              </div>
              <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  name="name"
                  placeholder="Project Name / Client ID" 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                  required
                />
                <input 
                  name="repo"
                  placeholder="Repository URL (Optional)" 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
                <button 
                  type="submit"
                  className="bg-accent text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all"
                >
                  Create Project
                </button>
              </form>
            </section>

            {/* Project List */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Users className="w-6 h-6 text-accent" />
                Active Projects
                <span className="text-sm font-normal text-muted ml-2">({projects.length})</span>
              </h2>
              {projects.length === 0 ? (
                <div className="slab-card text-center py-16 border-dashed">
                  <Users className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                  <p className="text-muted text-lg">No projects yet</p>
                  <p className="text-muted/50 text-sm mt-1">Deploy your first project above to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((p) => (
                    <div key={p.id} className="slab-card group hover:border-accent/50 transition-all space-y-4">
                      <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 
                              onClick={() => setEditingProjectId(editingProjectId === p.id ? null : p.id)}
                              className="text-xl font-bold text-glow cursor-pointer hover:text-accent transition-colors"
                            >
                              {p.name}
                            </h3>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest text-muted font-bold">{p.status?.replace('_', ' ')}</span>
                              </div>
                              <div 
                                onClick={() => {
                                  navigator.clipboard.writeText(p.id);
                                  toast.success('Project ID copied');
                                }}
                                className="text-[9px] font-mono text-muted/40 cursor-pointer hover:text-accent transition-colors flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded w-fit"
                              >
                                <Copy className="w-2.5 h-2.5" />
                                {p.id}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-2 text-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                      </div>

                      {editingProjectId === p.id ? (
                        <form onSubmit={(e) => handleUpdateSaaS(p.id, e)} className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="grid grid-cols-2 gap-2">
                            <select name="status" defaultValue={p.status} className="bg-black border border-white/10 rounded px-2 py-1 text-xs">
                              <option value="on_track">On Track</option>
                              <option value="at_risk">At Risk</option>
                              <option value="blocked">Blocked</option>
                            </select>
                            <input name="progress" type="number" defaultValue={p.progress_percent} placeholder="Progress %" className="bg-black border border-white/10 rounded px-2 py-1 text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input name="hourly_rate" type="number" defaultValue={p.hourly_rate || 5} placeholder="Velocity Tier (1-5)" className="bg-black border border-white/10 rounded px-2 py-1 text-xs" />
                            <input name="retainer_cost" type="number" defaultValue={p.retainer_cost || 160} placeholder="Cap Capacity (Hours)" className="bg-black border border-white/10 rounded px-2 py-1 text-xs" />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <input name="client_email" type="email" defaultValue={p.client_email} placeholder="Client Identity (Email for Auth)" className="bg-black border border-white/10 rounded px-2 py-1 text-xs" />
                            <input name="webhook_url" type="text" defaultValue={p.webhook_url} placeholder="Slack/Discord Webhook URL" className="bg-black border border-white/10 rounded px-2 py-1 text-xs" />
                            <textarea name="milestones" defaultValue={JSON.stringify(p.milestones || [], null, 2)} placeholder='Roadmap Milestones (JSON): [{"title": "Phase 1", "status": "completed", "description": "..."}]' className="w-full bg-black border border-white/10 rounded px-2 py-1 text-[10px] font-mono h-24" />
                          </div>
                          <textarea name="agency_note" defaultValue={p.agency_note} placeholder="Executive Note to Client (Human Touch)..." className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs h-16" />
                          <textarea name="impact" defaultValue={p.impact_summary} placeholder="Business Impact Summary..." className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs h-16" />
                          <button type="submit" className="w-full bg-accent text-white py-1.5 rounded text-xs font-bold">Update SaaS Metadata</button>
                        </form>
                      ) : (
                        <>

                          {p.impact_summary && (
                            <div className="p-3 bg-accent/5 border border-accent/10 rounded-lg">
                              <p className="text-[10px] text-accent font-bold uppercase mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Business Impact
                              </p>
                              <p className="text-xs text-muted line-clamp-2 italic">&quot;{p.impact_summary}&quot;</p>
                            </div>
                          )}
                        </>
                      )}



                      <div className="pt-4 flex gap-3">
                        <button 
                          onClick={() => handleSync(p.id)}
                          disabled={syncingId === p.id || !p.repository_url}
                          className="flex-1 bg-accent text-white py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === p.id ? 'animate-spin' : ''}`} />
                          {syncingId === p.id ? 'Syncing...' : 'Sync GitHub'}
                        </button>
                        <a 
                          href={`/dashboard/${p.id}`}
                          target="_blank"
                          className="flex-1 bg-white/5 border border-white/10 py-2 rounded-lg text-center text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          View UI <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : activeTab === 'feed' ? (
          /* Global Feed */
          <section className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <LayoutDashboard className="w-8 h-8 text-accent" />
                  Engineering Velocity Stream
                </h2>
                <div className="text-sm text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  {commits.length} Total Updates
                </div>
             </div>

             {commits.length === 0 ? (
               <div className="slab-card text-center py-16 border-dashed">
                 <Activity className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                 <p className="text-muted text-lg">No activity yet</p>
                 <p className="text-muted/50 text-sm mt-1">Sync a project from GitHub to see the live feed.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {commits.map((c, i) => (
                   <div 
                     key={c.id} 
                     className="slab-card flex items-center justify-between gap-6 hover:border-white/20 transition-all py-4 animate-fade-in-up"
                     style={{ animationDelay: `${i * 50}ms` }}
                   >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-medium">{c.translated_message}</h4>
                          <p className="text-xs text-muted flex items-center gap-2">
                            <span className="text-accent font-bold uppercase tracking-widest">{c.Projects?.name || 'Unknown Project'}</span>
                            • {c.author} • {format(new Date(c.created_at), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                       <div className="flex items-center gap-3">
                        <div className="text-xs font-mono text-muted/50 hidden md:block">
                          {c.hash.substring(0, 7)}
                        </div>
                        <button 
                          onClick={() => setPulseCommit(c)}
                          className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2"
                        >
                          <Zap className="w-3 h-3" /> Strategic Update
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </section>
        ) : (
          /* Reports Tab */
          <div className="space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-6 h-6 text-accent" />
                Generate New Reports
              </h2>
              {projects.length === 0 ? (
                <div className="slab-card text-center py-12 text-muted border-dashed">
                  Create a project first to generate reports.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((p) => (
                    <div key={p.id} className="slab-card space-y-4">
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGenerateReport(p.id, 'weekly')}
                          disabled={isGeneratingReport === `${p.id}-weekly`}
                          className="flex-1 bg-white/5 border border-white/10 py-2 rounded-lg text-xs font-bold hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                        >
                          {isGeneratingReport === `${p.id}-weekly` ? (
                            <span className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Generating...
                            </span>
                          ) : 'Weekly'}
                        </button>
                        <button 
                          onClick={() => handleGenerateReport(p.id, 'monthly')}
                          disabled={isGeneratingReport === `${p.id}-monthly`}
                          className="flex-1 bg-white/5 border border-white/10 py-2 rounded-lg text-xs font-bold hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                        >
                          {isGeneratingReport === `${p.id}-monthly` ? (
                            <span className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Generating...
                            </span>
                          ) : 'Monthly'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-6 h-6 text-accent" />
                Strategic Asset Governance
              </h2>
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="slab-card text-center py-12 text-muted border-dashed">No reports generated yet.</div>
                ) : (
                  reports.map((r) => (
                    <div key={r.id} className="slab-card flex items-center justify-between gap-6 hover:border-white/20 transition-all py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${r.type === 'weekly' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold flex items-center gap-2">
                            {r.Projects?.name} {r.type.toUpperCase()} Report
                            {r.status === 'sent' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                          </h4>
                          <p className="text-xs text-muted">
                            Generated {format(new Date(r.created_at), 'MMM d, yyyy • HH:mm')} 
                            {r.channels?.length > 0 && ` • Shared via ${r.channels.join(', ')}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyReportLink(r.id)}
                          className="p-2 text-muted hover:text-accent transition-colors"
                          title="Copy shareable report link"
                        >
                          {copiedId === r.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        {!r.is_published && (
                          <button 
                            onClick={async () => {
                              try {
                                await publishReport(r.id);
                                loadData();
                                toast.success('Report sent to client!');
                              } catch (e) {
                                toast.error('Failed to send report');
                              }
                            }}
                            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                          >
                            Send to Client
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedReport(r)}
                          className="bg-accent/10 text-accent border border-accent/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent hover:text-white transition-all"
                        >
                          View & Share
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Pulse History Section */}
        {activeTab === 'feed' && (
          <section className="space-y-6 pt-12 border-t border-white/10">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <HistoryIcon className="w-6 h-6 text-accent" />
              Executive Communication Logs
            </h2>
            {pulses.length === 0 ? (
              <div className="slab-card text-center py-12 text-muted border-dashed">
                No pulses sent yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pulses.map((p) => (
                  <div key={p.id} className="slab-card flex flex-col justify-between gap-4 border-accent/10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                          {p.Projects?.name}
                        </span>
                        <p className="text-[10px] text-muted font-bold">
                          {format(new Date(p.created_at), 'MMM d, HH:mm')}
                        </p>
                      </div>
                      <p className="text-sm font-medium italic text-white/90 leading-relaxed">&quot;{p.strategic_note}&quot;</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <p className="text-[9px] text-muted font-mono">
                        Commit: {p.commit_hash?.substring(0, 7)}
                      </p>
                      <button 
                        onClick={async () => {
                          if(confirm('Delete this pulse from client dashboard?')) {
                            try {
                              await deletePulse(p.id);
                              loadData();
                              toast.success('Pulse removed from client feed');
                            } catch (e) {
                              toast.error('Failed to delete pulse');
                            }
                          }
                        }}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors flex items-center gap-2 group"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Delete Pulse</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {selectedReport && (
        <Portal>
          <ReportPreview 
            report={selectedReport} 
            onClose={() => {
              setSelectedReport(null);
              loadData();
            }} 
          />
        </Portal>
      )}
    </main>
  );
}
