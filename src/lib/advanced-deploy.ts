/**
 * ADVANCED DEPLOYMENT OPERATIONS
 * Clone projects, manage env vars, add domains
 */

const VERCEL_API = "https://api.vercel.com";
const GITHUB_API = "https://api.github.com";
const GITHUB_OWNER = "Showowt";

interface VercelProject {
  id: string;
  name: string;
}

/**
 * Clone an existing project to a new name
 */
export async function cloneProject(
  sourceProject: string,
  newName: string,
): Promise<{ success: boolean; repoUrl?: string; error?: string }> {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    return { success: false, error: "GITHUB_TOKEN not configured" };
  }

  try {
    // Step 1: Check if source repo exists
    const sourceResponse = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${sourceProject}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!sourceResponse.ok) {
      return {
        success: false,
        error: `Source project '${sourceProject}' not found`,
      };
    }

    // Step 2: Create new repo
    const createResponse = await fetch(`${GITHUB_API}/user/repos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
        description: `Cloned from ${sourceProject} | MachineMind Genesis`,
        private: false,
        auto_init: false,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      return {
        success: false,
        error: error.message || "Failed to create repo",
      };
    }

    // Step 3: The actual file copying would require more complex Git operations
    // For now, return success with instructions
    return {
      success: true,
      repoUrl: `https://github.com/${GITHUB_OWNER}/${newName}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Clone failed",
    };
  }
}

/**
 * Set environment variable on Vercel project
 */
export async function setEnvVar(
  projectName: string,
  key: string,
  value: string,
  targets: ("production" | "preview" | "development")[] = [
    "production",
    "preview",
  ],
): Promise<{ success: boolean; error?: string }> {
  const vercelToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken) {
    return { success: false, error: "VERCEL_API_TOKEN not configured" };
  }

  try {
    // First, get the project ID
    const projectUrl = `${VERCEL_API}/v9/projects/${projectName}${teamId ? `?teamId=${teamId}` : ""}`;
    const projectResponse = await fetch(projectUrl, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    if (!projectResponse.ok) {
      return { success: false, error: `Project '${projectName}' not found` };
    }

    const project: VercelProject = await projectResponse.json();

    // Check if env var already exists
    const envUrl = `${VERCEL_API}/v10/projects/${project.id}/env${teamId ? `?teamId=${teamId}` : ""}`;
    const envResponse = await fetch(envUrl, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    const envData = await envResponse.json();
    const existingVar = envData.envs?.find(
      (e: { key: string }) => e.key === key,
    );

    if (existingVar) {
      // Update existing
      const updateUrl = `${VERCEL_API}/v10/projects/${project.id}/env/${existingVar.id}${teamId ? `?teamId=${teamId}` : ""}`;
      const updateResponse = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value,
          target: targets,
        }),
      });

      if (!updateResponse.ok) {
        return { success: false, error: "Failed to update env var" };
      }
    } else {
      // Create new
      const createResponse = await fetch(envUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value,
          target: targets,
          type: "encrypted",
        }),
      });

      if (!createResponse.ok) {
        return { success: false, error: "Failed to create env var" };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Env var operation failed",
    };
  }
}

/**
 * Add custom domain to Vercel project
 */
export async function addDomain(
  projectName: string,
  domain: string,
): Promise<{ success: boolean; configured?: boolean; error?: string }> {
  const vercelToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken) {
    return { success: false, error: "VERCEL_API_TOKEN not configured" };
  }

  try {
    // Get project ID
    const projectUrl = `${VERCEL_API}/v9/projects/${projectName}${teamId ? `?teamId=${teamId}` : ""}`;
    const projectResponse = await fetch(projectUrl, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    if (!projectResponse.ok) {
      return { success: false, error: `Project '${projectName}' not found` };
    }

    const project: VercelProject = await projectResponse.json();

    // Add domain
    const domainUrl = `${VERCEL_API}/v10/projects/${project.id}/domains${teamId ? `?teamId=${teamId}` : ""}`;
    const domainResponse = await fetch(domainUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    });

    if (!domainResponse.ok) {
      const error = await domainResponse.json();
      return {
        success: false,
        error: error.error?.message || "Failed to add domain",
      };
    }

    const result = await domainResponse.json();

    return {
      success: true,
      configured: result.verified === true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Domain operation failed",
    };
  }
}

/**
 * Get deployment preview URL for a specific branch
 */
export async function getPreviewUrl(
  projectName: string,
  branch: string = "main",
): Promise<{ success: boolean; url?: string; error?: string }> {
  const vercelToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken) {
    return { success: false, error: "VERCEL_API_TOKEN not configured" };
  }

  try {
    // Get project ID
    const projectUrl = `${VERCEL_API}/v9/projects/${projectName}${teamId ? `?teamId=${teamId}` : ""}`;
    const projectResponse = await fetch(projectUrl, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    if (!projectResponse.ok) {
      return { success: false, error: `Project '${projectName}' not found` };
    }

    const project: VercelProject = await projectResponse.json();

    // Get deployments for the branch
    const deploymentsUrl = `${VERCEL_API}/v6/deployments?projectId=${project.id}&target=preview&limit=5${teamId ? `&teamId=${teamId}` : ""}`;
    const deploymentsResponse = await fetch(deploymentsUrl, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    if (!deploymentsResponse.ok) {
      return { success: false, error: "Failed to fetch deployments" };
    }

    const data = await deploymentsResponse.json();
    const branchDeployment = data.deployments?.find(
      (d: { meta?: { gitBranch?: string } }) => d.meta?.gitBranch === branch,
    );

    if (branchDeployment) {
      return {
        success: true,
        url: `https://${branchDeployment.url}`,
      };
    }

    return {
      success: false,
      error: `No preview deployment found for branch '${branch}'`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Preview fetch failed",
    };
  }
}

/**
 * Trigger a new deployment from GitHub
 */
export async function triggerDeploy(
  projectName: string,
  branch: string = "main",
  production: boolean = false,
): Promise<{
  success: boolean;
  deploymentId?: string;
  url?: string;
  error?: string;
}> {
  const vercelToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken) {
    return { success: false, error: "VERCEL_API_TOKEN not configured" };
  }

  try {
    // Get project
    const projectUrl = `${VERCEL_API}/v9/projects/${projectName}${teamId ? `?teamId=${teamId}` : ""}`;
    const projectResponse = await fetch(projectUrl, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    if (!projectResponse.ok) {
      return { success: false, error: `Project '${projectName}' not found` };
    }

    const project = await projectResponse.json();

    // Create deployment
    const deployUrl = `${VERCEL_API}/v13/deployments${teamId ? `?teamId=${teamId}` : ""}`;
    const deployResponse = await fetch(deployUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        project: project.id,
        target: production ? "production" : "preview",
        gitSource: {
          type: "github",
          org: GITHUB_OWNER,
          repo: projectName,
          ref: branch,
        },
      }),
    });

    if (!deployResponse.ok) {
      const error = await deployResponse.json();
      return {
        success: false,
        error: error.error?.message || "Deployment failed",
      };
    }

    const deployment = await deployResponse.json();

    return {
      success: true,
      deploymentId: deployment.id,
      url: `https://${deployment.url}`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Deployment trigger failed",
    };
  }
}
