import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X } from "lucide-react";
import { getProfile, updateProfile } from "../services/api";

const DEFAULT_FORM = {
  full_name: "",
  role: "",
  city: "",
  region: "",
  bio: "",
  skills: "",
};

function parseSkillsForInput(skills) {
  if (Array.isArray(skills)) return skills.join(", ");
  if (typeof skills === "string") return skills;
  return "";
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.user || {};
        const profile = res.profile || {};
        setForm({
          full_name: user.full_name || "",
          role: user.role || "",
          city: user.city || "",
          region: user.region || "",
          bio: profile.bio || "",
          skills: parseSkillsForInput(profile.skills),
        });
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onCancel() {
    navigate("/profile");
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateProfile({
        full_name: form.full_name.trim(),
        role: form.role.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        bio: form.bio.trim(),
        skills: skillsArray,
      });
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Edit Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/65">
          Update your profile information and save changes.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-slate-600 dark:text-white/70">Loading profile...</div>
        ) : (
        <form onSubmit={onSave} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
                Full Name
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={onChange}
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#1f66ff]"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
                Role
              </label>
              <input
                name="role"
                value={form.role}
                onChange={onChange}
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#1f66ff]"
                placeholder="Director, Actor, Editor..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
                City
              </label>
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#1f66ff]"
                placeholder="e.g. Yaounde"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
                Region
              </label>
              <input
                name="region"
                value={form.region}
                onChange={onChange}
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#1f66ff]"
                placeholder="e.g. Centre"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={onChange}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#1f66ff]"
              placeholder="Tell people about your creative work..."
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
              Skills (comma separated)
            </label>
            <input
              name="skills"
              value={form.skills}
              onChange={onChange}
              className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:border-[#1f66ff]"
              placeholder="Video Directing, Scriptwriting, Editing"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-5 py-3 font-semibold shadow-lg shadow-[#1f66ff]/20"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-xl bg-white/65 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-5 py-3 font-semibold border border-white/10"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

