import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, MessageSquare, FolderPlus, Link2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const GET_USER_PROFILE_URL = "http://localhost/meet-my-crew/backend/public/get-user-profile.php";
const GET_USER_PORTFOLIO_URL = "http://localhost/meet-my-crew/backend/public/get-user-portfolio.php";
const GET_USER_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/get-user-projects.php";

const DEFAULT_USER = {
  user_id: null,
  full_name: "Unknown Creative",
  role: "Creative",
  city: "",
  region: "",
  bio: "",
  skills: "",
  photo: "",
};

function parseId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getProjectId(project) {
  return project?.id || project?.project_id || null;
}

function normalizeUser(user, profile) {
  return {
    ...DEFAULT_USER,
    ...(user || {}),
    bio: profile?.bio || user?.bio || "",
    skills: profile?.skills || user?.skills || "",
    photo: profile?.photo || user?.photo || "",
  };
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function CreativeProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [creative, setCreative] = useState(DEFAULT_USER);
  const [portfolio, setPortfolio] = useState([]);
  const [pastProjects, setPastProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const creativeId = parseId(id);

  useEffect(() => {
    let mounted = true;

    async function loadCreative() {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, portfolioResponse, projectsResponse] = await Promise.all([
          fetch(`${GET_USER_PROFILE_URL}?user_id=${encodeURIComponent(creativeId || "")}`, { credentials: "include" }),
          fetch(`${GET_USER_PORTFOLIO_URL}?user_id=${encodeURIComponent(creativeId || "")}`, { credentials: "include" }),
          fetch(`${GET_USER_PROJECTS_URL}?user_id=${encodeURIComponent(creativeId || "")}`, { credentials: "include" }),
        ]);

        const profileData = await parseJsonSafe(profileResponse);
        const portfolioData = await parseJsonSafe(portfolioResponse);
        const projectsData = await parseJsonSafe(projectsResponse);

        if (!profileResponse.ok) {
          throw new Error(profileData?.error || "Failed to load creative profile");
        }
        if (!portfolioResponse.ok) {
          throw new Error(portfolioData?.error || "Failed to load portfolio");
        }
        if (!projectsResponse.ok) {
          throw new Error(projectsData?.error || "Failed to load past projects");
        }

        if (!mounted) return;

        setCreative(normalizeUser(profileData?.user, profileData?.profile));
        setPortfolio(Array.isArray(portfolioData?.items) ? portfolioData.items : []);
        setPastProjects(Array.isArray(projectsData?.projects) ? projectsData.projects : []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load creative profile");
        setCreative(DEFAULT_USER);
        setPortfolio([]);
        setPastProjects([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    if (!creativeId) {
      setError("Invalid creative id.");
      setLoading(false);
      return;
    }

    loadCreative();

    return () => {
      mounted = false;
    };
  }, [creativeId]);

  const skills = useMemo(() => parseList(creative.skills), [creative.skills]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Creative Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Public profile preview for collaboration.</p>
      </div>

      {error ? (
        <Card className="p-4 border-red-200 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading creative profile...</p>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={creative.photo || `https://i.pravatar.cc/220?u=${encodeURIComponent(creative.full_name || "creative")}`}
                  alt={creative.full_name}
                  className="h-20 w-20 rounded-full object-cover"
                />

                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{creative.full_name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{creative.role || "Creative"}</p>
                  <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="text-teal-500" />
                    {creative.city || "Unknown city"}
                    {creative.city && creative.region ? ", " : ""}
                    {creative.region || "Unknown region"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/messages?user_id=${encodeURIComponent(creative.user_id || "")}`)}
                >
                  <MessageSquare size={16} />
                  Chat
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/discover?invite_user_id=${encodeURIComponent(creative.user_id || "")}`)}
                >
                  <FolderPlus size={16} />
                  Invite to Project
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">About</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{creative.bio || "No bio added yet."}</p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
              {skills.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No skills listed.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Portfolio</h3>
              {portfolio.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No portfolio items yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {portfolio.map((item) => (
                    <Card key={item.item_id || item.id || `${item.title}-${item.video_link}`} className="p-4" as="article">
                      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title || "Untitled"}</h4>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.description || "No description"}</p>
                      {item.video_link ? (
                        <a
                          href={item.video_link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Link2 size={14} />
                          {item.video_link}
                        </a>
                      ) : null}
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Past Projects</h3>
              {pastProjects.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No past projects listed.</p>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pastProjects.map((project) => {
                    const projectId = getProjectId(project);

                    return (
                      <Card key={projectId || `${project.title}-${project.project_type}`} className="p-4" as="article">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{project.title || "Untitled Project"}</h4>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.project_type || "No project type"}</p>

                        {projectId ? (
                          <Button variant="neutral" className="mt-3" onClick={() => navigate(`/project/${projectId}`)}>
                            View Project Info
                          </Button>
                        ) : null}
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
