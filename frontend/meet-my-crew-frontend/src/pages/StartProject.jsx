import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderPlus } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create project");

      setSuccess("Project created successfully.");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Start Project</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Create a new project and invite collaborators.</p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Project Information</h2>
          <Button variant="neutral" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Enter project title"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Project Type</label>
              <input
                name="project_type"
                value={form.project_type}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Film, Ad, Music Video"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="City, Region"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-500 dark:text-slate-400">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Describe your project"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Budget</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="budget"
                value={form.budget}
                onChange={onChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="0.00"
              />
            </div>
          </div>

          {error ? (
            <Card className="p-4 border-red-200 dark:border-red-700">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </Card>
          ) : null}

          {success ? (
            <Card className="p-4 border-emerald-200 dark:border-emerald-700">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
            </Card>
          ) : null}

          <Button type="submit" variant="primary" disabled={submitting}>
            <FolderPlus size={16} />
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
