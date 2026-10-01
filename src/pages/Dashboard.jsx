import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Live listener so the name shows up as soon as the profile doc is written on signup
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setProfile(snap.exists() ? snap.data() : null),
      (err) => {
        console.error(err);
        setProfileError("Couldn't load your profile from Firestore.");
      }
    );
  }, [user.uid]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const name = profile?.firstName || user.displayName || user.email;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-semibold text-slate-900">Student Task Tracker</span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hi, {name} 👋</h1>
        <p className="mt-2 text-slate-600">You're logged in.</p>

        {profileError && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {profileError}
          </p>
        )}

        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          Your tasks will appear here.
        </div>
      </main>
    </div>
  );
}
