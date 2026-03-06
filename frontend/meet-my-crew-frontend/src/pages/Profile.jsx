import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Mail, Camera, Link2, X } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MY_PROFILE_URL = "http://localhost/meet-my-crew/backend/public/my-profile.php";
const MY_PORTFOLIO_URL = "http://localhost/meet-my-crew/backend/public/my-portfolio.php";
const ADD_PORTFOLIO_URL = "http://localhost/meet-my-crew/backend/public/portfolio-add-link.php";

const DEFAULT_USER = {
  user_id: null,
  full_name: "User",
  role: "Creative",
  city: "",
  region: "",
  email: "",
  bio: "",
  skills: "",
  photo: "",
};

function parseSkills(skills) {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    return skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(DEFAULT_USER);
  const [portfolioItems, setPortfolioItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    media_url: "",
  });
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [portfolioFormError, setPortfolioFormError] = useState("");

  const skills = useMemo(() => {
    const parsed = parseSkills(user.skills);
    return parsed.length > 0 ? parsed : [];
  }, [user.skills]);

  async function fetchPortfolio() {
    const response = await fetch(MY_PORTFOLIO_URL, { credentials: "include" });
    const data = await parseJsonSafe(response);
    if (!response.ok) throw new Error(data?.error || "Failed to load portfolio");
    setPortfolioItems(Array.isArray(data?.items) ? data.items : []);
  }

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, portfolioResponse] = await Promise.all([
          fetch(MY_PROFILE_URL, { credentials: "include" }),
          fetch(MY_PORTFOLIO_URL, { credentials: "include" }),
        ]);

        const profileData = await parseJsonSafe(profileResponse);
        const portfolioData = await parseJsonSafe(portfolioResponse);

        if (!profileResponse.ok) throw new Error(profileData?.error || "Failed to load profile");
        if (!portfolioResponse.ok) throw new Error(portfolioData?.error || "Failed to load portfolio");

        if (!mounted) return;

        setUser({
          ...DEFAULT_USER,
          ...(profileData?.user || {}),
          ...(profileData?.profile || {}),
        });

        setPortfolioItems(Array.isArray(portfolioData?.items) ? portfolioData.items : []);
      } catch (err) {
        if (!mounted) return;
        setUser(DEFAULT_USER);
        setPortfolioItems([]);
        setError(err.message || "Failed to load profile");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  function openPortfolioForm() {
    setPortfolioFormError("");
    setPortfolioForm({ title: "", description: "", media_url: "" });
    setShowPortfolioForm(true);
  }

  function closePortfolioForm() {
    setShowPortfolioForm(false);
    setSavingPortfolio(false);
    setPortfolioFormError("");
  }

  async function savePortfolioItem(event) {
    event.preventDefault();
    setPortfolioFormError("");

    if (!portfolioForm.title.trim() || !portfolioForm.media_url.trim()) {
      setPortfolioFormError("Title and media URL are required.");
      return;
    }

    setSavingPortfolio(true);

    try {
      const response = await fetch(ADD_PORTFOLIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: portfolioForm.title.trim(),
          description: portfolioForm.description.trim(),
          media_url: portfolioForm.media_url.trim(),
        }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(data?.error || "Failed to add portfolio item");

      await fetchPortfolio();
      setNotice("Portfolio item added successfully.");
      closePortfolioForm();
    } catch (err) {
      setPortfolioFormError(err.message || "Failed to add portfolio item");
    } finally {
      setSavingPortfolio(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your personal profile information and portfolio.</p>
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

      {loading ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile...</p>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={user.photo || `https://i.pravatar.cc/240?u=${encodeURIComponent(user.full_name || "user")}`}
                  alt={user.full_name}
                  className="h-20 w-20 rounded-full object-cover"
                />

                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.role || "Creative"}</p>
                  <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="text-teal-500" />
                    {user.city || ""}{user.city && user.region ? ", " : ""}{user.region || ""}
                  </div>
                </div>
              </div>

              <Button variant="neutral" onClick={() => navigate("/profile/edit")}>
                <Camera size={16} />
                Change Photo
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Personal Information</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500 dark:text-slate-400">Full Name:</span> <span className="text-slate-900 dark:text-slate-100">{user.full_name || "-"}</span></div>
              <div><span className="text-slate-500 dark:text-slate-400">Role:</span> <span className="text-slate-900 dark:text-slate-100">{user.role || "-"}</span></div>
              <div><span className="text-slate-500 dark:text-slate-400">City:</span> <span className="text-slate-900 dark:text-slate-100">{user.city || "-"}</span></div>
              <div><span className="text-slate-500 dark:text-slate-400">Region:</span> <span className="text-slate-900 dark:text-slate-100">{user.region || "-"}</span></div>
              <div className="sm:col-span-2 inline-flex items-center gap-2"><Mail size={14} className="text-blue-600" /> <span className="text-slate-900 dark:text-slate-100">{user.email || "No email"}</span></div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">About</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {user.bio || "No bio available."}
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
            {skills.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Portfolio</h3>
              <Button variant="primary" className="px-3 py-1.5 text-sm" onClick={openPortfolioForm}>
                Add Portfolio Item
              </Button>
            </div>

            {portfolioItems.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No portfolio items yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {portfolioItems.map((item) => (
                  <Card key={item.item_id || item.id || item.title} className="p-4" as="article">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title || "Untitled"}</h4>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.description || "No description"}</p>
                    <a
                      href={item.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Link2 size={14} />
                      View Link
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {showPortfolioForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Portfolio Item</h3>
              <button
                onClick={closePortfolioForm}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                aria-label="Close add portfolio form"
              >
                <X size={16} />
              </button>
            </div>

            {portfolioFormError ? (
              <Card className="mt-3 p-3 border-red-200 dark:border-red-700">
                <p className="text-sm text-red-700 dark:text-red-300">{portfolioFormError}</p>
              </Card>
            ) : null}

            <form className="mt-4 space-y-3" onSubmit={savePortfolioItem}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Portfolio item title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Short description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Media URL</label>
                <input
                  value={portfolioForm.media_url}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, media_url: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="neutral" className="px-3 py-1.5 text-sm" onClick={closePortfolioForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="px-3 py-1.5 text-sm" disabled={savingPortfolio}>
                  {savingPortfolio ? "Saving..." : "Save Item"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
