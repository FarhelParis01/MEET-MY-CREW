import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X } from "lucide-react";

function parseSkillsForInput(skills) {
  if (Array.isArray(skills)) return skills.join(", ");
  if (typeof skills === "string") return skills;
  return "";
}

export default function EditProfile() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    const raw = localStorage.getItem("mmc_user");
    if (!raw) return {};
    try {
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }, []);

  const [form, setForm] = useState({
    full_name: currentUser.full_name || "",
    role: currentUser.role || "",
    city: currentUser.city || "",
    region: currentUser.region || "",
    bio: currentUser.bio || "",
    skills: parseSkillsForInput(currentUser.skills),
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onCancel() {
    navigate("/profile");
  }

  function onSave(e) {
    e.preventDefault();

    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedUser = {
      ...currentUser,
      full_name: form.full_name.trim(),
      role: form.role.trim(),
      city: form.city.trim(),
      region: form.region.trim(),
      bio: form.bio.trim(),
      skills: skillsArray,
    };

    localStorage.setItem("mmc_user", JSON.stringify(updatedUser));
    navigate("/profile");
  }

  return (
    <div className="max-w-4xl">
      <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Edit Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/65">
          Update your profile information and save changes.
        </p>

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
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#1f66ff]"
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
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#1f66ff]"
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
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#1f66ff]"
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
                className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#1f66ff]"
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
              className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#1f66ff]"
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
              className="w-full rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#1f66ff]"
              placeholder="Video Directing, Scriptwriting, Editing"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-5 py-3 font-semibold shadow-lg shadow-[#1f66ff]/20"
            >
              <Save size={16} />
              Save Profile
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
      </div>
    </div>
  );
}
