const GITHUB_API = "https://api.github.com";

async function githubFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) throw new Error("GITHUB_TOKEN not set");

  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  // Some endpoints return 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function triggerWorkflow(
  owner: string,
  repo: string,
  workflowId: string,
  inputs: Record<string, string>,
): Promise<boolean> {
  try {
    await githubFetch(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      {
        method: "POST",
        body: JSON.stringify({
          ref: "main",
          inputs,
        }),
      },
    );
    return true;
  } catch (error) {
    console.error("Failed to trigger workflow:", error);
    return false;
  }
}

export async function getLatestWorkflowRun(
  owner: string,
  repo: string,
  workflowId: string,
): Promise<{
  id: number;
  status: string;
  conclusion: string | null;
  html_url: string;
} | null> {
  try {
    const data = await githubFetch<{
      workflow_runs: Array<{
        id: number;
        status: string;
        conclusion: string | null;
        html_url: string;
      }>;
    }>(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=1`,
    );

    return data.workflow_runs[0] || null;
  } catch {
    return null;
  }
}

export async function listRepos(owner: string): Promise<string[]> {
  try {
    const data = await githubFetch<Array<{ name: string }>>(
      `/users/${owner}/repos?per_page=100&sort=updated`,
    );
    return data.map((r) => r.name);
  } catch {
    return [];
  }
}
