import { NextResponse } from 'next/server';
import { translateCommitMessage } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    // Basic verification - in production, verify GitHub webhook signature
    const payload = await req.json();
    
    // Ensure this is a push event
    if (!payload.commits || !Array.isArray(payload.commits)) {
      return NextResponse.json({ message: 'No commits found in payload' }, { status: 400 });
    }

    const repoUrl = payload.repository?.html_url || payload.repository?.url;
    
    // Look up project ID based on repo URL
    const { data: project } = await supabaseAdmin
      .from('Projects')
      .select('id')
      .ilike('repository_url', `%${repoUrl}%`)
      .single();

    if (!project) {
      return NextResponse.json({ message: 'Unrecognized repository' }, { status: 400 });
    }

    const projectId = project.id;
    
    // Process commits in parallel to avoid Vercel timeout limits
    const commitPromises = payload.commits
      .filter((commit: any) => commit.message && !commit.message.startsWith('Merge pull request'))
      .map(async (commit: any) => {
        const translatedMessage = await translateCommitMessage(commit.message);
        
        const commitData = {
          project_id: projectId,
          hash: commit.id,
          original_message: commit.message,
          translated_message: translatedMessage,
          author: commit.author?.name || 'Unknown',
          created_at: commit.timestamp || new Date().toISOString(),
        };

        const { error } = await supabaseAdmin.from('Commits').insert([commitData]);
        if (error) console.error('Failed to insert commit:', error);
        
        return commitData;
      });

    const processedCommits = await Promise.all(commitPromises);

    return NextResponse.json({ 
      message: 'Commits processed successfully', 
      processed: processedCommits.length 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
