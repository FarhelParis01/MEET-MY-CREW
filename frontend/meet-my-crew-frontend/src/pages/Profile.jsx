import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Mail, Camera, Link2, X } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MY_PROFILE_URL = "http://localhost/meet-my-crew/backend/public/my-profile.php";
const MY_PORTFOLIO_URL = "http://localhost/meet-my-crew/backend/public/my-portfolio.php";
const ADD_PORTFOLIO_URL = "http://localhost/meet-my-crew/backend/public/portfolio-add-link.php";
const UPLOAD_PROFILE_PHOTO_URL = "http://localhost/meet-my-crew/backend/public/upload-profile-photo.php";
const UPDATE_PROFILE_URL = "http://localhost/meet-my-crew/backend/public/update-profile.php";
const BACKEND_PUBLIC_URL = "http://localhost/meet-my-crew/backend/public";

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

function getProfilePhotoUrl(user) {
  const photoPath = user.profile_photo || user.photo || "";
  if (!photoPath) return `https://i.pravatar.cc/240?u=${encodeURIComponent(user.full_name || "user")}`;
  if (/^https?:\/\//i.test(photoPath)) return photoPath;
  return `${BACKEND_PUBLIC_URL}/${String(photoPath).replace(/^\/+/, "")}`;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function Profile() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    media_url: "",
  });
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [portfolioFormError, setPortfolioFormError] = useState("");
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    bio: "",
    skills: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [editProfileError, setEditProfileError] = useState("");

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

  function openEditProfileForm() {
    setEditProfileError("");
    setEditProfileForm({
      bio: user.bio || "",
      skills: typeof user.skills === "string" ? user.skills : parseSkills(user.skills).join(", "),
    });
    setShowEditProfileForm(true);
  }

  function closeEditProfileForm() {
    setShowEditProfileForm(false);
    setSavingProfile(false);
    setEditProfileError("");
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

  function triggerPhotoPicker() {
    fileInputRef.current?.click();
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("Profile photo must be 2MB or smaller.");
      return;
    }

    setUploadingPhoto(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(UPLOAD_PROFILE_PHOTO_URL, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(data?.error || "Failed to upload profile photo");

      const updatedPhoto = data?.photo || "";
      if (!updatedPhoto) throw new Error("Upload succeeded but photo path is missing.");

      setUser((prev) => ({
        ...prev,
        photo: updatedPhoto,
        profile_photo: updatedPhoto,
      }));
      setNotice("Profile photo updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveProfileChanges(event) {
    event.preventDefault();
    setEditProfileError("");
    setSavingProfile(true);

    const nextBio = editProfileForm.bio.trim();
    const nextSkills = editProfileForm.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    try {
      const response = await fetch(UPDATE_PROFILE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bio: nextBio,
          skills: nextSkills,
        }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(data?.error || "Failed to update profile");

      setUser((prev) => ({
        ...prev,
        bio: nextBio,
        skills: nextSkills,
      }));
      setNotice("Profile updated successfully.");
      closeEditProfileForm();
    } catch (err) {
      setEditProfileError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
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
                  src={getProfilePhotoUrl(user)}
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

              <Button variant="neutral" onClick={triggerPhotoPicker} disabled={uploadingPhoto}>
                <Camera size={16} />
                {uploadingPhoto ? "Uploading..." : "Change Photo"}
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleUpload}
              />
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
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">About</h3>
              <Button variant="neutral" className="px-3 py-1.5 text-sm" onClick={openEditProfileForm}>
                Edit Profile
              </Button>
            </div>
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

      {showEditProfileForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit Profile</h3>
              <button
                onClick={closeEditProfileForm}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                aria-label="Close edit profile form"
              >
                <X size={16} />
              </button>
            </div>

            {editProfileError ? (
              <Card className="mt-3 p-3 border-red-200 dark:border-red-700">
                <p className="text-sm text-red-700 dark:text-red-300">{editProfileError}</p>
              </Card>
            ) : null}

            <form className="mt-4 space-y-3" onSubmit={saveProfileChanges}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                <textarea
                  rows={5}
                  value={editProfileForm.bio}
                  onChange={(e) => setEditProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Tell people about yourself"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Skills</label>
                <input
                  value={editProfileForm.skills}
                  onChange={(e) => setEditProfileForm((prev) => ({ ...prev, skills: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Directing, Editing, Cinematography"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="neutral" className="px-3 py-1.5 text-sm" onClick={closeEditProfileForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="px-3 py-1.5 text-sm" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
