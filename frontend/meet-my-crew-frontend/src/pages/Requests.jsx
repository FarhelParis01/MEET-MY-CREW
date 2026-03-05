import { useEffect, useState } from "react";
import { Clock3, CheckCircle2, XCircle, FolderOpen } from "lucide-react";
import {
  fetchCollaborationRequests,
  respondCollaborationRequest,
} from "../services/api";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCollaborationRequests()
      .then((res) => {
        setRequests(Array.isArray(res.requests) ? res.requests : []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load requests");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function updateStatus(requestId, status) {
    try {
      await respondCollaborationRequest({
        request_id: requestId,
        action: status,
      });

      setRequests((prev) =>
        prev.map((request) =>
          request.request_id === requestId ? { ...request, status } : request
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update request");
    }
  }

  function statusBadge(status) {
    if (status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={13} />
          Accepted
        </span>
      );
    }
    if (status === "declined") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
          <XCircle size={13} />
          Declined
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
        <Clock3 size={13} />
        Pending
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Collaboration Requests
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/65">
          Review incoming and outgoing requests related to your profile.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-8 text-center text-slate-600 dark:text-white/70">
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-8 text-center text-slate-600 dark:text-white/70">
          No requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article
              key={request.request_id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm text-slate-500 dark:text-white/55">
                    Sender
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {request.sender_name || "Unknown sender"}
                  </div>
                </div>

                {statusBadge(request.status)}
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-slate-700 dark:text-white/70">
                <FolderOpen size={16} className="text-[#00b3c7]" />
                <span className="font-medium">
                  {request.message || "Collaboration Request"}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  disabled={request.status !== "pending"}
                  onClick={() => updateStatus(request.request_id, "accepted")}
                  className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Accept
                </button>
                <button
                  disabled={request.status !== "pending"}
                  onClick={() => updateStatus(request.request_id, "declined")}
                  className="rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-4 py-2 text-sm font-semibold border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Decline
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

