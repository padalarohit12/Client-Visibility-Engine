export function parseGitHubUrl(url: string) {
  try {
    // Handle both https://github.com/owner/repo and https://github.com/owner/repo.git
    const cleanUrl = url.replace(/\.git$/, '');
    const parts = cleanUrl.split('/');
    const repo = parts.pop();
    const owner = parts.pop();
    
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch (e) {
    return null;
  }
}

export async function fetchCommitsFromGitHub(owner: string, repo: string, limit = 10) {
  const token = process.env.GITHUB_PAT; // Optional token for private repos/higher rate limits
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
    { headers, next: { revalidate: 0 } }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch commits from GitHub');
  }

  const data = await response.json();
  
  return data.map((item: any) => ({
    hash: item.sha,
    message: item.commit.message,
    author: item.commit.author.name,
    timestamp: item.commit.author.date,
  }));
}
