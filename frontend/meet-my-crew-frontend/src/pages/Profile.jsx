import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Mail, Edit3, MessageSquare, FolderPlus } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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

const MY_PROFILE_URL = "http://localhost/meet-my-crew/backend/public/my-profile.php";
const SEARCH_URL = "http://localhost/meet-my-crew/backend/public/search.php";

function parseSkills(skills) {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    return skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeUserRecord(record) {
  return {
    ...DEFAULT_USER,
    ...(record || {}),
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState(DEFAULT_USER);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const profileUserId = parseId(searchParams.get("user_id"));

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);

      try {
        const myRes = await fetch(MY_PROFILE_URL, { credentials: "include" });
        const myData = await parseJsonSafe(myRes);
        if (!myRes.ok) throw new Error(myData?.error || "Failed to load profile");

        const myUser = normalizeUserRecord({
          ...(myData?.user || {}),
          ...(myData?.profile || {}),
        });

        const myId = parseId(myUser.user_id);
        if (!mounted) return;
        setCurrentUserId(myId);

        if (!profileUserId || (myId && profileUserId === myId)) {
          setUser(myUser);
          return;
        }

        const searchRes = await fetch(SEARCH_URL, { credentials: "include" });
        const searchData = await parseJsonSafe(searchRes);
        if (!searchRes.ok) throw new Error(searchData?.error || "Failed to load user directory");

        const users = Array.isArray(searchData?.users) ? searchData.users : [];
        const target = users.find((u) => parseId(u.user_id) === profileUserId);

        if (!mounted) return;
        if (target) {
          setUser(normalizeUserRecord(target));
        } else {
          setUser(myUser);
        }
      } catch {
        if (!mounted) return;
        setUser(DEFAULT_USER);
        setCurrentUserId(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [profileUserId]);

  const isOwnProfile = useMemo(() => {
    const viewedId = parseId(user.user_id);
    if (!viewedId || !currentUserId) return true;
    return viewedId === currentUserId;
  }, [user.user_id, currentUserId]);

  const skills = useMemo(() => {
    const parsed = parseSkills(user.skills);
    return parsed.length > 0 ? parsed : ["No skills added yet"];
  }, [user.skills]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Professional profile and public details.</p>
      </div>

      {loading ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={user.photo || `https://i.pravatar.cc/300?u=${encodeURIComponent(user.full_name || "user")}`}
                alt={user.full_name}
                className="h-44 w-44 rounded-xl object-cover"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user.role || "Creative"}</p>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin size={14} />
                      {user.city || ""}{user.city && user.region ? ", " : ""}{user.region || ""}
                    </div>
                  </div>

                  {isOwnProfile ? (
                    <Button variant="primary" onClick={() => navigate("/profile/edit")}>
                      <Edit3 size={16} />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/discover?invite_user_id=${encodeURIComponent(user.user_id || "")}`)}
                      >
                        <FolderPlus size={16} />
                        Invite to Project
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/messages?user_id=${encodeURIComponent(user.user_id || "")}`)}
                      >
                        <MessageSquare size={16} />
                        Chat
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Connections</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">254</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Projects</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">12</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Experience</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">8 Years</p>
                  </Card>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">About</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {user.bio || `Hi, I am ${user.full_name}. I am open to creative collaborations and new projects.`}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Skills</h3>
              <div className="mt-4 flex flex-wrap gap-4">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Contact</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-teal-500" />
                {user.city || ""}{user.city && user.region ? ", " : ""}{user.region || ""}
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-blue-600" />
                {user.email || "No email available"}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Availability</h4>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Open to new projects</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
