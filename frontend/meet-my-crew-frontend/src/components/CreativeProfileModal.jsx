import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";

export default function CreativeProfileModal({ open, creative, onClose, onInvite }) {
  const navigate = useNavigate();

  if (!open || !creative) return null;

  function goToChat() {
    onClose?.();
    navigate(`/messages?user_id=${encodeURIComponent(creative.user_id || creative.id || "")}`);
  }

  function goToFullProfile() {
    onClose?.();
    navigate(`/creative/${encodeURIComponent(creative.user_id || creative.id || "")}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <Card className="w-full max-w-md p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Creative Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-400"
            aria-label="Close profile modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <img
            src={creative.photo || creative.profile_image || `https://i.pravatar.cc/200?u=${encodeURIComponent(creative.full_name || "creative")}`}
            alt={creative.full_name || "Creative"}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{creative.full_name || "Unknown creative"}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{creative.role || "Creative"}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-200">City:</span> {creative.city || "Unknown city"}
          </p>
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-200">Region:</span> {creative.region || "Unknown region"}
          </p>
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-200">Bio:</span> {creative.bio || "No bio provided."}
          </p>
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-200">Skills:</span> {creative.skills || "No skills listed."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="primary" className="px-3 py-1.5 text-sm" onClick={goToChat}>
            Chat
          </Button>
          <Button variant="secondary" className="px-3 py-1.5 text-sm" onClick={() => onInvite?.(creative)}>
            Invite to Project
          </Button>
          <Button variant="neutral" className="px-3 py-1.5 text-sm" onClick={goToFullProfile}>
            View Full Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}
