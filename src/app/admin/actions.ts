'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { parseGitHubUrl, fetchCommitsFromGitHub } from '@/lib/github';
import { translateCommitMessage } from '@/lib/ai';

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

export async function deleteProject(id: string) {
  const { error } = await supabaseAdmin
    .from('Projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin');
}

export async function getClientPreferences(projectId: string) {
  const { data, error } = await supabaseAdmin
    .from('ClientPreferences')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
  return data;
}

export async function updateClientPreferences(
  projectId: string,
  reportFrequency: 'weekly' | 'monthly',
  deliveryChannel: 'email' | 'whatsapp',
  contactInfo: string
) {
  const { data, error } = await supabaseAdmin
    .from('ClientPreferences')
    .upsert({
      project_id: projectId,
      report_frequency: reportFrequency,
      delivery_channel: deliveryChannel,
      contact_info: contactInfo,
    }, { onConflict: 'project_id' })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin');
  return data;
}

export async function getAllCommits() {
  const { data, error } = await supabaseAdmin
    .from('Commits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function syncProjectCommits(projectId: string) {
  // 1. Get project details
  const { data: project, error: pError } = await supabaseAdmin
    .from('Projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (pError || !project.repository_url) {
    throw new Error('Project not found or missing repository URL');
  }

  // 2. Parse GitHub URL
  const repoInfo = parseGitHubUrl(project.repository_url);
  if (!repoInfo) throw new Error('Invalid GitHub URL');

  // 3. Fetch commits from GitHub
  const githubCommits = await fetchCommitsFromGitHub(repoInfo.owner, repoInfo.repo);

  // 4. Get existing hashes for this project
  // Implementing manual transactional integrity check for multi-row sync operations
  const { data: existingCommits } = await supabaseAdmin
    .from('Commits')
    .select('hash')
    .eq('project_id', projectId);

  const existingHashes = new Set(existingCommits?.map(c => c.hash) || []);
  let newSyncCount = 0;

  // 5. Process new commits
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
