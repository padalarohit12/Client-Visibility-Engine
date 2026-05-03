"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Settings, 
  LayoutDashboard, 
  Users, 
  Search,
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  getProjects, 
  createProject, 
  deleteProject, 
  getAllCommits,
  updateClientPreferences,
  syncProjectCommits
} from './actions';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

export default function AdminPortal() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'feed'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [commits, setCommits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Simple Access Code Check
  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === 'admin123') { // Replace with your desired code
      setIsAuthorized(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Invalid Access Code');
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthorized(true);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [p, c] = await Promise.all([getProjects(), getAllCommits()]);
      setProjects(p);
      setCommits(c);
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
    } catch (error: any) {
      alert(`Error creating project: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        loadData();
      } catch (error) {
        alert('Error deleting project');
      }
    }
  };

  const handleSync = async (projectId: string) => {
    setSyncingId(projectId);
    try {
      const result = await syncProjectCommits(projectId);
      alert(`Sync complete! Found ${result.newSyncCount} new updates.`);
      loadData();
    } catch (error: any) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full slab-card space-y-8 p-10">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-glow">Admin Access</h1>
            <p className="text-muted">Enter the master access code to manage the Visibility Engine.</p>
          </div>
          <form onSubmit={handleAuthorize} className="space-y-4">
            <input 
              type="password" 
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
              required
            />
            <button 
              type="submit"
              className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Authorize <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Admin Sub-Nav */}
      <div className="w-full p-4 border-b border-white/10 flex justify-center items-center bg-white/5">
        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'projects' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Manage Projects
          </button>
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'feed' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Global Feed
          </button>
          <div className="w-px h-6 bg-white/10 mx-2 self-center" />
          <button 
            onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthorized(false); }}
            className="px-6 py-2 rounded-lg text-sm font-bold text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 max-w-6xl w-full mx-auto space-y-12">
        
        {activeTab === 'projects' ? (
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
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p) => (
                  <div key={p.id} className="slab-card group hover:border-accent/50 transition-all space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-glow">{p.name}</h3>
                      <button 
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted break-all font-mono opacity-60">ID: {p.id}</p>
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
                        href={`/dashboard/${p.name}`}
                        target="_blank"
                        className="flex-1 bg-white/5 border border-white/10 py-2 rounded-lg text-center text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        View UI <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Global Feed */
          <section className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <LayoutDashboard className="w-8 h-8 text-accent" />
                  Global Activity Stream
                </h2>
                <div className="text-sm text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  {commits.length} Total Updates
                </div>
             </div>

             <div className="space-y-4">
               {commits.map((c) => (
                 <div key={c.id} className="slab-card flex items-center justify-between gap-6 hover:border-white/20 transition-all py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium">{c.translated_message}</h4>
                        <p className="text-xs text-muted flex items-center gap-2">
                          <span className="text-accent font-bold uppercase tracking-widest">{c.project_id}</span>
                          • {c.author} • {format(new Date(c.created_at), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-muted/50 hidden md:block">
                      {c.hash.substring(0, 7)}
                    </div>
                 </div>
               ))}
             </div>
          </section>
        )}
      </div>
    </main>
  );
}
