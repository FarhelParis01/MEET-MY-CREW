import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderPlus } from "lucide-react";

const INITIAL_FORM = {
  title: "",
  description: "",
  project_type: "",
  location: "",
  deadline: "",
  budget: "",
};

export default function StartProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost/meet-my-crew/backend/public/create-project.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            project_type: form.project_type,
            location: form.location,
            deadline: form.deadline,
            budget: form.budget,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setSuccess("Project created successfully.");
      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Start a New Project
            </h2>
            <p className="mt-1 text-slate-600 dark:text-white/65">
              Create a project and invite collaborators.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/60 px-3 py-2 text-sm text-slate-800 hover:bg-white dark:bg-white/10 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/75">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Enter project title"
              className="w-full rounded-xl border border-white/10 bg-white/65 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#1f66ff] focus:ring-2 focus:ring-[#1f66ff]/30 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/75">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              placeholder="Describe your project goals and what you need"
              className="w-full rounded-xl border border-white/10 bg-white/65 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#1f66ff] focus:ring-2 focus:ring-[#1f66ff]/30 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/75">
                Project Type
              </label>
              <input
                name="project_type"
                value={form.project_type}
                onChange={onChange}
                placeholder="Film, Ad, Music Video..."
                className="w-full rounded-xl border border-white/10 bg-white/65 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#1f66ff] focus:ring-2 focus:ring-[#1f66ff]/30 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/75">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={onChange}
                placeholder="City, Region"
                className="w-full rounded-xl border border-white/10 bg-white/65 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#1f66ff] focus:ring-2 focus:ring-[#1f66ff]/30 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/75">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={onChange}
                className="w-full rounded-xl border border-white/10 bg-white/65 px-4 py-3 text-slate-900 outline-none focus:border-[#1f66ff] focus:ring-2 focus:ring-[#1f66ff]/30 dark:bg-white/10 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/75">
                Budget
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="budget"
                value={form.budget}
                onChange={onChange}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/65 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#1f66ff] focus:ring-2 focus:ring-[#1f66ff]/30 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f66ff] px-5 py-3 font-semibold text-white hover:bg-[#1b59db] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FolderPlus className="h-4 w-4" />
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}

