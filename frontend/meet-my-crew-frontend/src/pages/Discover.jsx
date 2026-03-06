import { useEffect, useMemo, useState } from "react";
import { MapPin, UserRound, FolderPlus, X, Search } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const SEARCH_URL = "http://localhost/meet-my-crew/backend/public/search.php";
const MY_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/my-projects.php";
const INVITE_TO_PROJECT_URL = "http://localhost/meet-my-crew/backend/public/invite-to-project.php";
const INVITE_USER_FALLBACK_URL = "http://localhost/meet-my-crew/backend/public/invite-user.php";

const ROLE_OPTIONS = ["All", "Director", "Producer", "Editor", "Actor", "Cinematographer", "Sound Designer", "Creative"];
const REGION_OPTIONS = ["All", "Centre", "Littoral", "West", "North West", "South West", "North", "South", "East", "Adamawa"];
const CITY_OPTIONS = ["All", "Yaounde", "Douala", "Bamenda", "Buea", "Garoua", "Bafoussam"];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseCreatives(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.creatives)) return payload.creatives;
  return [];
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function Discover() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [region, setRegion] = useState("All");
  const [city, setCity] = useState("All");

  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileCreative, setProfileCreative] = useState(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [projectsCreated, setProjectsCreated] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("Hi, I would like to collaborate with you.");
  const [inviteError, setInviteError] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const visibleCreatives = useMemo(() => {
    return creatives.filter((user) => {
      const matchesRegion = region === "All" || (user.region || "").toLowerCase() === region.toLowerCase();
      return matchesRegion;
    });
  }, [creatives, region]);

  async function handleSearch() {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("name", query.trim());
      if (role !== "All") params.set("role", role);
      if (city !== "All") params.set("city", city);

      const endpoint = params.toString() ? `${SEARCH_URL}?${params.toString()}` : SEARCH_URL;

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      const data = await parseJsonSafe(res);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to search creatives");
      }

      setCreatives(parseCreatives(data));
    } catch (err) {
      setCreatives([]);
      setError(err.message || "Failed to search creatives");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openProfileModal(user) {
    setProfileCreative(user);
    setIsProfileModalOpen(true);
  }

  function closeProfileModal() {
    setIsProfileModalOpen(false);
    setProfileCreative(null);
  }

  async function openInviteModal(user) {
    setSelectedCreative(user);
    setIsInviteModalOpen(true);
    setProjectsCreated([]);
    setSelectedProjectId("");
    setInvitationMessage("Hi, I would like to collaborate with you.");
    setInviteError("");
    setProjectsLoading(true);

    try {
      const res = await fetch(MY_PROJECTS_URL, { method: "GET", credentials: "include" });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.error || "Failed to load your projects");

      const created = safeArray(data?.projects_created);
      setProjectsCreated(created);
      if (created.length > 0) {
        setSelectedProjectId(String(created[0].id || created[0].project_id || ""));
      }
    } catch (err) {
      setProjectsCreated([]);
      setInviteError(err.message || "Failed to load your projects");
    } finally {
      setProjectsLoading(false);
    }
  }

  function closeInviteModal() {
    setIsInviteModalOpen(false);
    setSelectedCreative(null);
    setProjectsCreated([]);
    setSelectedProjectId("");
    setInvitationMessage("Hi, I would like to collaborate with you.");
    setInviteError("");
    setSendingInvite(false);
  }

  async function sendInviteRequest(url) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        project_id: Number(selectedProjectId),
        receiver_id: selectedCreative?.user_id,
        message: invitationMessage,
      }),
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error(data?.error || "Failed to send invitation");
    }

    return data;
  }

  async function handleSendInvitation() {
    if (!selectedCreative || !selectedProjectId) {
      setInviteError("Please select a project.");
      return;
    }

    setInviteError("");
    setSendingInvite(true);

    try {
      await sendInviteRequest(INVITE_TO_PROJECT_URL);
      setNotice("Invitation sent.");
      closeInviteModal();
    } catch (primaryErr) {
      try {
        await sendInviteRequest(INVITE_USER_FALLBACK_URL);
        setNotice("Invitation sent.");
        closeInviteModal();
      } catch (fallbackErr) {
        setInviteError(fallbackErr.message || primaryErr.message || "Failed to send invitation");
      }
    } finally {
      setSendingInvite(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Discover Creatives</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search and filter creatives, then invite collaborators to your projects.
          </p>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Search</label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <Search size={15} className="text-slate-500 dark:text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {REGION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {CITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <Button variant="primary" className="px-3 py-1.5 text-sm" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </Card>

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

        {loading ? (
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Searching creatives...</p>
          </Card>
        ) : visibleCreatives.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">No creatives found for your search and filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleCreatives.map((user) => (
              <Card key={user.user_id || user.id || user.full_name} className="p-4" as="article">
                <div className="flex items-center gap-3">
                  <img
                    src={user.photo || user.profile_image || `https://i.pravatar.cc/200?u=${encodeURIComponent(user.full_name || "creative")}`}
                    alt={user.full_name || "Creative profile"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{user.full_name || "Unknown creative"}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.role || "Creative"}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin size={14} className="text-teal-500" />
                  <span>{user.city || "Unknown city"}, {user.region || "Unknown region"}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="neutral"
                    className="px-3 py-1.5 text-sm"
                    onClick={() => openProfileModal(user)}
                  >
                    <UserRound size={15} />
                    View Profile
                  </Button>

                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                    onClick={() => openInviteModal(user)}
                  >
                    <FolderPlus size={15} />
                    Invite
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isProfileModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="w-full max-w-md p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Creative Profile</h2>
              <button
                onClick={closeProfileModal}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                aria-label="Close profile modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <img
                src={profileCreative?.photo || profileCreative?.profile_image || `https://i.pravatar.cc/200?u=${encodeURIComponent(profileCreative?.full_name || "creative")}`}
                alt={profileCreative?.full_name || "Creative"}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{profileCreative?.full_name || "Unknown creative"}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{profileCreative?.role || "Creative"}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p><span className="font-medium text-slate-800 dark:text-slate-200">Location:</span> {profileCreative?.city || "Unknown city"}, {profileCreative?.region || "Unknown region"}</p>
              <p><span className="font-medium text-slate-800 dark:text-slate-200">Bio:</span> {profileCreative?.bio || "No bio provided."}</p>
              <p><span className="font-medium text-slate-800 dark:text-slate-200">Skills:</span> {profileCreative?.skills || "No skills listed."}</p>
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="neutral" className="px-3 py-1.5 text-sm" onClick={closeProfileModal}>Close</Button>
            </div>
          </Card>
        </div>
      ) : null}

      {isInviteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invite to Project</h2>
              <button
                onClick={closeInviteModal}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                aria-label="Close invite modal"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Invite {selectedCreative?.full_name || "this creative"} to one of your projects.
            </p>

            {inviteError ? (
              <Card className="mt-4 p-4 border-red-200 dark:border-red-700">
                <p className="text-sm text-red-700 dark:text-red-300">{inviteError}</p>
              </Card>
            ) : null}

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={projectsLoading || projectsCreated.length === 0}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {projectsLoading ? (
                    <option value="">Loading projects...</option>
                  ) : projectsCreated.length === 0 ? (
                    <option value="">No projects created yet</option>
                  ) : (
                    projectsCreated.map((project) => (
                      <option key={project.id || project.project_id} value={project.id || project.project_id}>
                        {project.title || "Untitled Project"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Invitation Message</label>
                <textarea
                  rows={3}
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="neutral" className="px-3 py-1.5 text-sm" onClick={closeInviteModal}>Cancel</Button>
              <Button
                variant="primary"
                className="px-3 py-1.5 text-sm"
                onClick={handleSendInvitation}
                disabled={sendingInvite || projectsLoading || !selectedProjectId}
              >
                {sendingInvite ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
