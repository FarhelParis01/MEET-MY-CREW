import { useEffect, useMemo, useState } from "react";
import {
  Users,
  FolderKanban,
  Briefcase,
  MessageSquare,
  Activity,
  BarChart3,
  Download,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const ADMIN_STATS_URL = "http://localhost/meet-my-crew/backend/public/admin/get-stats.php";

const DEFAULT_STATS = {
  totalUsers: 0,
  totalProjects: 0,
  totalPortfolioItems: 0,
  totalMessages: 0,
  directMessages: 0,
  projectMessages: 0,
  userStatusBreakdown: { active: 0, suspended: 0 },
  accountTypeBreakdown: { user: 0, admin: 0 },
  projectTypeBreakdown: {},
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function downloadCsv(filename, headers, rows) {
  const escapeCell = (value) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csv = [headers.map(escapeCell).join(","), ...rows.map((row) => row.map(escapeCell).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function normalizeStats(payload) {
  const status = payload?.user_status_breakdown || {};
  const account = payload?.account_type_breakdown || {};

  return {
    totalUsers: toNumber(payload?.total_users ?? payload?.users ?? payload?.totalUsers),
    totalProjects: toNumber(payload?.total_projects ?? payload?.projects ?? payload?.totalProjects),
    totalPortfolioItems: toNumber(
      payload?.total_portfolio_items ?? payload?.portfolio_items ?? payload?.portfolio ?? payload?.totalPortfolioItems
    ),
    totalMessages: toNumber(payload?.total_messages ?? payload?.messages ?? payload?.totalMessages),
    directMessages: toNumber(payload?.direct_messages),
    projectMessages: toNumber(payload?.project_messages),
    userStatusBreakdown: {
      active: toNumber(status?.active),
      suspended: toNumber(status?.suspended),
    },
    accountTypeBreakdown: {
      user: toNumber(account?.user),
      admin: toNumber(account?.admin),
    },
    projectTypeBreakdown: payload?.project_type_breakdown || {},
  };
}

function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}

function BarRow({ label, value, total, colorClass }) {
  const pct = toPercent(value, total);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(ADMIN_STATS_URL, { credentials: "include" });
        const text = await response.text();

        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load admin stats");
        }

        if (!mounted) return;
        setStats(normalizeStats(data));
      } catch (err) {
        if (!mounted) return;
        setStats(DEFAULT_STATS);
        setError(err.message || "Failed to load admin stats");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const users = stats.totalUsers;
    const projects = stats.totalProjects;
    const portfolio = stats.totalPortfolioItems;
    const messages = stats.totalMessages;

    const avgProjectsPerUser = users ? (projects / users).toFixed(2) : "0.00";
    const avgPortfolioPerUser = users ? (portfolio / users).toFixed(2) : "0.00";
    const messagesPerProject = projects ? (messages / projects).toFixed(2) : "0.00";
    const activeUsers = stats.userStatusBreakdown.active;
    const activeRate = toPercent(activeUsers, users);

    return {
      avgProjectsPerUser,
      avgPortfolioPerUser,
      messagesPerProject,
      activeRate,
    };
  }, [stats]);

  function handleDownloadStats() {
    const rows = [
      ["total_users", stats.totalUsers],
      ["total_projects", stats.totalProjects],
      ["total_portfolio_items", stats.totalPortfolioItems],
      ["total_messages", stats.totalMessages],
      ["direct_messages", stats.directMessages],
      ["project_messages", stats.projectMessages],
      ["active_users", stats.userStatusBreakdown.active],
      ["suspended_users", stats.userStatusBreakdown.suspended],
      ["standard_users", stats.accountTypeBreakdown.user],
      ["admin_users", stats.accountTypeBreakdown.admin],
      ["avg_projects_per_user", kpis.avgProjectsPerUser],
      ["avg_portfolio_per_user", kpis.avgPortfolioPerUser],
      ["messages_per_project", kpis.messagesPerProject],
      ["active_rate_percent", `${kpis.activeRate}%`],
    ];

    Object.entries(stats.projectTypeBreakdown || {}).forEach(([type, count]) => {
      rows.push([`project_type_${type}`, count]);
    });

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadCsv(`admin-overview-${stamp}.csv`, ["metric", "value"], rows);
  }

  const statusTotal = stats.userStatusBreakdown.active + stats.userStatusBreakdown.suspended;
  const activePct = toPercent(stats.userStatusBreakdown.active, statusTotal);

  const projectTypeEntries = Object.entries(stats.projectTypeBreakdown || {}).sort((a, b) => b[1] - a[1]);
  const topProjectTypes = projectTypeEntries.slice(0, 6);
  const topProjectTypeMax = Math.max(1, ...topProjectTypes.map(([, value]) => Number(value) || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Overview</h2>
        <Button
          variant="neutral"
          className="rounded-md px-3 py-2 text-sm"
          onClick={handleDownloadStats}
          disabled={loading}
        >
          <Download size={16} />
          Download Statistics
        </Button>
      </div>

      {error ? (
        <Card className="p-4 border-red-200 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers}
          subtitle={`${kpis.activeRate}% active users`}
          icon={Users}
        />
        <MetricCard
          title="Total Projects"
          value={loading ? "..." : stats.totalProjects}
          subtitle={`${kpis.avgProjectsPerUser} projects/user`}
          icon={FolderKanban}
        />
        <MetricCard
          title="Portfolio Items"
          value={loading ? "..." : stats.totalPortfolioItems}
          subtitle={`${kpis.avgPortfolioPerUser} items/user`}
          icon={Briefcase}
        />
        <MetricCard
          title="Total Messages"
          value={loading ? "..." : stats.totalMessages}
          subtitle={`${kpis.messagesPerProject} messages/project`}
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-1">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">User Status</h3>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div
              className="h-24 w-24 rounded-full"
              style={{
                background: `conic-gradient(#2563eb 0 ${activePct}%, #f59e0b ${activePct}% 100%)`,
              }}
            >
              <div className="m-4 h-16 w-16 rounded-full bg-white dark:bg-slate-900" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Active: {stats.userStatusBreakdown.active}
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Suspended: {stats.userStatusBreakdown.suspended}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 xl:col-span-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Account Types & Activity Mix</h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <BarRow
                label="Standard Users"
                value={stats.accountTypeBreakdown.user}
                total={stats.totalUsers || 1}
                colorClass="bg-blue-600"
              />
              <BarRow
                label="Admins"
                value={stats.accountTypeBreakdown.admin}
                total={stats.totalUsers || 1}
                colorClass="bg-teal-500"
              />
            </div>

            <div>
              <p className="text-sm text-slate-700 dark:text-slate-200">Messages Split</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="flex h-full">
                  <div
                    className="bg-blue-600"
                    style={{ width: `${toPercent(stats.directMessages, stats.totalMessages || 1)}%` }}
                  />
                  <div
                    className="bg-teal-500"
                    style={{ width: `${toPercent(stats.projectMessages, stats.totalMessages || 1)}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Direct: {stats.directMessages}</span>
                <span>Project: {stats.projectMessages}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Top Project Types</h3>
        {topProjectTypes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No project type data available yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topProjectTypes.map(([type, count]) => {
              const width = Math.max(8, Math.round((Number(count) / topProjectTypeMax) * 100));
              return (
                <div key={type} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">{type}</span>
                    <span className="text-slate-500 dark:text-slate-400">{count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
