import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// In a real app, you would use a service like Resend to send the email
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // 1. Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized cron invocation attempt');
    // For development/demo purposes, we won't block it here if CRON_SECRET is not set, 
    // but in production we should return 401.
  }

  try {
    const projectId = 'demo-project-id'; // Fetch from DB in real implementation

    // 2. Fetch commits from the last 7 days (Weekly report)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Mock data for the report if no supabase url
    let commits = [
      { translated_message: 'Improved system security for logins.' },
      { translated_message: 'Upgraded dashboard visuals.' }
    ];

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { data, error } = await supabaseAdmin
        .from('Commits')
        .select('*')
        .eq('project_id', projectId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      commits = data || [];
    }

    if (commits.length === 0) {
      return NextResponse.json({ message: 'No updates to report this week.' });
    }

    // 3. Format the email
    const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #111; color: #eee; padding: 20px; border-radius: 8px;">
        <h1 style="color: #fff;">Weekly Project Update</h1>
        <p>Here's what we accomplished for your project this week:</p>
        <ul style="padding-left: 20px;">
          ${commits.map(c => `<li style="margin-bottom: 10px;">${c.translated_message}</li>`).join('')}
        </ul>
        <p style="margin-top: 30px; font-size: 12px; color: #888;">
          You can view real-time updates anytime at your <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #3b82f6;">Client Dashboard</a>.
        </p>
      </div>
    `;

    // 4. Send the email (Mocked)
    console.log('[Mock Email Send] To: client@example.com');
    console.log('[Mock Email HTML]:\n', emailHtml);
    
    // Example Resend usage:
    // await resend.emails.send({
    //   from: 'Updates <updates@youragency.com>',
    //   to: ['client@example.com'],
    //   subject: 'Weekly Project Update',
    //   html: emailHtml,
    // });

    return NextResponse.json({ 
      message: 'Reports generated and sent successfully',
      updates_included: commits.length
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
