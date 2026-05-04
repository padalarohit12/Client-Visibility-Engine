'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { parseGitHubUrl, fetchCommitsFromGitHub } from '@/lib/github';
import { translateCommitMessage, generateReportSummary, generateAIStrategistAdvice } from '@/lib/ai';

export async function getProjects() {
  const { data, error } = await supabaseAdmin
    .from('Projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProject(name: string, repositoryUrl?: string) {
  const { data, error } = await supabaseAdmin
    .from('Projects')
    .insert([{ name, repository_url: repositoryUrl }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin');
  return data;
}

export async function updateProjectSaaSData(
  id: string, 
  data: { 
    status?: string, 
    progress_percent?: number, 
    impact_summary?: string,
    hourly_rate?: number,
    retainer_cost?: number,
    webhook_url?: string,
    client_email?: string,
    agency_note?: string,
    milestones?: any[]
  }
) {
  const { error } = await supabaseAdmin
    .from('Projects')
    .update(data)
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin');
  revalidatePath(`/dashboard/${id}`);
}

export async function deleteProject(id: string) {
  const { error } = await supabaseAdmin
    .from('Projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin');
}

export async function getAllCommits() {
  // Fetch commits and projects separately, then merge
  // (Supabase schema cache sometimes can't resolve FK with quoted table names)
  const [commitsResult, projectsResult] = await Promise.all([
    supabaseAdmin
      .from('Commits')
      .select('*')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('Projects')
      .select('id, name')
  ]);

  if (commitsResult.error) throw commitsResult.error;
  
  const projectMap = new Map(
    (projectsResult.data || []).map(p => [p.id, p.name])
  );
  
  return (commitsResult.data || []).map(c => ({
    ...c,
    Projects: { name: projectMap.get(c.project_id) || 'Unknown' }
  }));
}

export async function syncProjectCommits(projectId: string) {
  const { data: project, error: pError } = await supabaseAdmin
    .from('Projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (pError || !project.repository_url) {
    throw new Error('Project not found or missing repository URL');
  }

  const repoInfo = parseGitHubUrl(project.repository_url);
  if (!repoInfo) throw new Error('Invalid GitHub URL');

  const githubCommits = await fetchCommitsFromGitHub(repoInfo.owner, repoInfo.repo);

  const { data: existingCommits } = await supabaseAdmin
    .from('Commits')
    .select('hash')
    .eq('project_id', projectId);

  const existingHashes = new Set(existingCommits?.map(c => c.hash) || []);
  let newSyncCount = 0;

  for (const commit of githubCommits) {
    if (!existingHashes.has(commit.hash)) {
      const translated = await translateCommitMessage(commit.message);
      
      const { error: iError } = await supabaseAdmin
        .from('Commits')
        .insert({
          project_id: projectId,
          hash: commit.hash,
          original_message: commit.message,
          translated_message: translated,
          author: commit.author,
          created_at: commit.timestamp
        });

      if (!iError) newSyncCount++;
    }
  }

  revalidatePath('/admin');
  revalidatePath(`/dashboard/${projectId}`);
  return { newSyncCount };
}

export async function getReports(projectId?: string) {
  let query = supabaseAdmin
    .from('Reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data: reports, error } = await query;
  if (error) throw error;

  // Manually join project names
  const { data: projects } = await supabaseAdmin
    .from('Projects')
    .select('id, name');
  
  const projectMap = new Map(
    (projects || []).map(p => [p.id, p.name])
  );

  return (reports || []).map(r => ({
    ...r,
    Projects: { name: projectMap.get(r.project_id) || 'Unknown' }
  }));
}

export async function generateProjectReport(projectId: string, type: 'weekly' | 'monthly') {
  const now = new Date();
  const startDate = new Date();
  if (type === 'weekly') {
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate.setMonth(now.getMonth() - 1);
  }

  const { data: commits, error: cError } = await supabaseAdmin
    .from('Commits')
    .select('translated_message, original_message, hash, author, created_at')
    .eq('project_id', projectId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (cError) throw cError;
  if (!commits || commits.length === 0) {
    throw new Error('No updates found for this period to generate a report.');
  }

  const messages = commits.map(c => c.translated_message || '');
  const summary = await generateReportSummary(type, messages);
  const advice = await generateAIStrategistAdvice(messages);

  // Get project data for actual retainer and hourly rates
  const { data: proj } = await supabaseAdmin
    .from('Projects')
    .select('name, hourly_rate, retainer_cost')
    .eq('id', projectId)
    .single();

  // Calculate billing/value estimates using real project values
  const estimatedHours = commits.length * 1.5; // ~1.5 hours per meaningful commit
  const hourlyRate = proj?.hourly_rate || 2500;
  const retainerCost = proj?.retainer_cost || 80000;
  const estimatedValue = estimatedHours * hourlyRate;

  const { data: report, error: rError } = await supabaseAdmin
    .from('Reports')
    .insert({
      project_id: projectId,
      type,
      summary,
      metrics: {
        update_count: commits.length,
        period_start: startDate.toISOString(),
        period_end: now.toISOString(),
        ai_strategist_advice: advice,
        roi_highlights: [
          { label: 'Strategic Updates Shipped', value: `${commits.length}` },
          { label: 'Engineering Hours Invested', value: `${estimatedHours.toFixed(1)}h` },
          { label: 'Unique Contributors', value: `${new Set(commits.map(c => c.author)).size}` },
        ],
        billing_summary: {
          hours_worked: estimatedHours,
          estimated_value: `₹${(estimatedValue / 1000).toFixed(0)}K`,
          retainer_cost: `₹${(retainerCost / 1000).toFixed(0)}K`,
        },
        commit_details: commits.map(c => ({
          hash: c.hash,
          message: c.translated_message,
          original: c.original_message,
          author: c.author,
          date: c.created_at,
        })),
      },
      status: 'generated'
    })
    .select('*')
    .single();

  if (rError) throw rError;

  revalidatePath('/admin');
  return { ...report, Projects: { name: proj?.name || 'Unknown' } };
}

export async function sendReport(reportId: string, channel: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { data: existingReport } = await supabaseAdmin
    .from('Reports')
    .select('channels')
    .eq('id', reportId)
    .single();

  const channels = existingReport?.channels || [];
  if (!channels.includes(channel)) {
    channels.push(channel);
  }

  const { error } = await supabaseAdmin
    .from('Reports')
    .update({ 
      status: 'sent',
      channels: channels
    })
    .eq('id', reportId);

  if (error) throw error;
  revalidatePath('/admin');
  return { success: true };
}

// Get shareable report link data
export async function publishReport(reportId: string) {
  const { data: report, error: rError } = await supabaseAdmin
    .from('Reports')
    .update({ is_published: true })
    .eq('id', reportId)
    .select('*, Projects(webhook_url, name)')
    .single();

  if (rError) throw rError;

  // Trigger Webhook if exists
  const project = (report as any).Projects;
  if (project?.webhook_url) {
    try {
      await fetch(project.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚀 *New Strategy Report Delivered for ${project.name}*\nView your updated dashboard here: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/${report.project_id}`
        })
      });
    } catch (e) {
      console.error('Webhook failed', e);
    }
  }

  revalidatePath('/admin');
  revalidatePath(`/dashboard/${report.project_id}`);
  return { success: true };
}
export async function sendPulse(projectId: string, commit: any, strategicNote: string) {
  const { data: pulse, error: pError } = await supabaseAdmin
    .from('Pulses')
    .insert({
      project_id: projectId,
      commit_hash: commit.hash,
      message: commit.message,
      strategic_note: strategicNote
    })
    .select()
    .single();

  if (pError) throw pError;

  // Trigger Webhook
  const { data: project } = await supabaseAdmin
    .from('Projects')
    .select('webhook_url, name')
    .eq('id', projectId)
    .single();

  if (project?.webhook_url) {
    try {
      await fetch(project.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎯 *Strategic Pulse: ${project.name}*\n\n*What happened:* ${commit.message}\n*Strategic Impact:* ${strategicNote}\n\nView Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/${projectId}`
        })
      });
    } catch (e) {
      console.error('Pulse Webhook failed', e);
    }
  }

  revalidatePath(`/dashboard/${projectId}`);
  return { success: true };
}
export async function getReportById(reportId: string) {
  const { data, error } = await supabaseAdmin
    .from('Reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;

  // Manually join project name
  const { data: proj } = await supabaseAdmin
    .from('Projects')
    .select('name')
    .eq('id', data.project_id)
    .single();

  return { ...data, Projects: { name: proj?.name || 'Unknown' } };
}

// Get project alerts/health checks
export async function getProjectAlerts(projectId: string) {
  const alerts: { type: 'warning' | 'success' | 'danger'; message: string; timestamp: string }[] = [];
  
  // Check for inactivity (no commits in 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: recentCommits } = await supabaseAdmin
    .from('Commits')
    .select('id')
    .eq('project_id', projectId)
    .gte('created_at', threeDaysAgo.toISOString());

  if (!recentCommits || recentCommits.length === 0) {
    alerts.push({
      type: 'warning',
      message: 'No activity detected for 3+ days. Consider syncing latest updates.',
      timestamp: new Date().toISOString(),
    });
  } else if (recentCommits.length >= 5) {
    alerts.push({
      type: 'success',
      message: `High velocity detected! ${recentCommits.length} updates shipped in the last 3 days.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Check project status
  const { data: project } = await supabaseAdmin
    .from('Projects')
    .select('status, progress_percent')
    .eq('id', projectId)
    .single();

  if (project?.status === 'blocked') {
    alerts.push({
      type: 'danger',
      message: 'Project is currently blocked. Immediate attention required.',
      timestamp: new Date().toISOString(),
    });
  } else if (project?.status === 'at_risk') {
    alerts.push({
      type: 'warning',
      message: 'Project flagged as at-risk. Review blockers and timeline.',
      timestamp: new Date().toISOString(),
    });
  }

  if (project?.progress_percent && project.progress_percent >= 90) {
    alerts.push({
      type: 'success',
      message: 'Project nearing completion! Final review phase recommended.',
      timestamp: new Date().toISOString(),
    });
  }

  return alerts;
}
export async function deletePulse(pulseId: string) {
  const { data: pulse } = await supabaseAdmin
    .from('Pulses')
    .select('project_id')
    .eq('id', pulseId)
    .single();

  const { error } = await supabaseAdmin
    .from('Pulses')
    .delete()
    .eq('id', pulseId);

  if (error) throw error;

  if (pulse) {
    revalidatePath(`/dashboard/${pulse.project_id}`);
  }
  return { success: true };
}

export async function getPulses() {
  const { data, error } = await supabaseAdmin
    .from('Pulses')
    .select('*, Projects(name)')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}
