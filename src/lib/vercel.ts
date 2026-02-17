const VERCEL_API = "https://api.vercel.com";

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  latestDeployments?: Array<{
    id: string;
    url: string;
    state: string;
    createdAt: number;
  }>;
}

interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  state: string;
  createdAt: number;
  readyState?: string;
}

async function vercelFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) throw new Error("VERCEL_API_TOKEN not set");

  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${VERCEL_API}${endpoint}${teamId ? `${separator}teamId=${teamId}` : ""}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function listProjects(): Promise<VercelProject[]> {
  const data = await vercelFetch<{ projects: VercelProject[] }>(
    "/v9/projects?limit=50",
  );
  return data.projects;
}

export async function getProject(
  nameOrId: string,
): Promise<VercelProject | null> {
  try {
    return await vercelFetch<VercelProject>(`/v9/projects/${nameOrId}`);
  } catch {
    return null;
  }
}

export async function listDeployments(
  projectId: string,
  limit = 5,
): Promise<VercelDeployment[]> {
  const data = await vercelFetch<{ deployments: VercelDeployment[] }>(
    `/v6/deployments?projectId=${projectId}&limit=${limit}`,
  );
  return data.deployments;
}

export async function getDeployment(
  idOrUrl: string,
): Promise<VercelDeployment | null> {
  try {
    return await vercelFetch<VercelDeployment>(`/v13/deployments/${idOrUrl}`);
  } catch {
    return null;
  }
}

export async function triggerDeployment(
  projectName: string,
): Promise<{ id: string; url: string } | null> {
  // Get project first
  const project = await getProject(projectName);
  if (!project) return null;

  // Trigger deployment via deploy hook or redeploy latest
  const deployments = await listDeployments(project.id, 1);
  if (deployments.length === 0) return null;

  // Create a new deployment by redeploying the latest
  const latest = deployments[0];

  try {
    const result = await vercelFetch<{ id: string; url: string }>(
      "/v13/deployments",
      {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          deploymentId: latest.id,
          target: "production",
        }),
      },
    );
    return result;
  } catch {
    return null;
  }
}

export async function getDeploymentLogs(
  deploymentId: string,
): Promise<string[]> {
  try {
    const teamId = process.env.VERCEL_TEAM_ID;
    const teamParam = teamId ? `&teamId=${teamId}` : "";
    const data = await vercelFetch<{ logs: Array<{ text: string }> }>(
      `/v2/deployments/${deploymentId}/events?limit=50${teamParam}`,
    );
    return data.logs?.map((l) => l.text) || [];
  } catch {
    return [];
  }
}
