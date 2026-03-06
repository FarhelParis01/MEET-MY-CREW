import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const GET_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/admin/get-projects.php";
const DELETE_PROJECT_URL = "http://localhost/meet-my-crew/backend/public/admin/delete-project.php";

function normalizeProjects(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getProjectId(project) {
  return project?.id || project?.project_id || null;
}

function getMembersCount(project) {
  const value =
    project?.members_count ??
    project?.member_count ??
    project?.team_member_count ??
    project?.membersCount ??
    0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function parseJsonSafe(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export default function AdminProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingProjectId, setActingProjectId] = useState(null);

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(GET_PROJECTS_URL, { credentials: "include" });
      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch projects");
      }

      setProjects(normalizeProjects(data));
    } catch (err) {
      setProjects([]);
      setError(err.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) =>
        String(a?.title || "").localeCompare(String(b?.title || ""))
      ),
    [projects]
  );

  async function handleDeleteProject(projectId) {
    const confirmed = window.confirm("Delete this project? This action cannot be undone.");
    if (!confirmed) return;

    setActingProjectId(projectId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(DELETE_PROJECT_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((project) => String(getProjectId(project)) !== String(projectId)));
      setNotice(data?.message || "Project deleted");
    } catch (err) {
      setError(err.message || "Failed to delete project");
    } finally {
      setActingProjectId(null);
    }
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Projects</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review all projects and manage platform content.</p>
      </div>

      {notice ? (
        <Card className="p-4 border-emerald-200 dark:border-emerald-700">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>
        </Card>
      ) : null}

      {error ? (
        <Card className="p-4 border-red-200 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </Card>
      ) : null}

      <Card className="min-w-0 p-0 overflow-hidden">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-max min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Title</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Creator</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Project Type</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Members Count</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500 dark:text-slate-400">
                    Loading projects...
                  </td>
                </tr>
              ) : sortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500 dark:text-slate-400">
                    No projects found.
                  </td>
                </tr>
              ) : (
                sortedProjects.map((project) => {
                  const projectId = getProjectId(project);
                  const isActing = actingProjectId && String(actingProjectId) === String(projectId);

                  return (
                    <tr key={projectId || `${project.title}-${project.creator_name}`} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100">{project.title || "Untitled Project"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {project.creator_name || project.full_name || project.creator || "Unknown"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{project.project_type || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{getMembersCount(project)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-nowrap items-center gap-2">
                          <Button
                            variant="neutral"
                            className="px-3 py-1 text-xs"
                            disabled={!projectId}
                            onClick={() => navigate(`/project/${encodeURIComponent(projectId)}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="neutral"
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            disabled={!projectId || isActing}
                            onClick={() => handleDeleteProject(projectId)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}



