import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Gamepad2,
  LogOut,
  Phone,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-react";
import { displayNameForWelcome } from "../lib/userDisplay.js";

function mergeScores(local, server) {
  const a = { ...(local || {}), ...(server || {}) };
  return {
    ...a,
    quizBest: Math.max(local?.quizBest || 0, server?.quizBest || 0, a.quizBest || 0),
    compareBest: Math.max(local?.compareBest || 0, server?.compareBest || 0, a.compareBest || 0),
    hunterBest: Math.max(local?.hunterBest || 0, server?.hunterBest || 0, a.hunterBest || 0),
    compareAnswered: Math.max(local?.compareAnswered || 0, server?.compareAnswered || 0, a.compareAnswered || 0),
  };
}

/** Profile UI for use inside the landing-page overlay (URL stays `/`). */
export function ProfilePanel({ refreshSession, onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState({});

  useEffect(() => {
    refreshSession?.();
    const token = localStorage.getItem("gp_token");
    if (!token) {
      onClose?.();
      navigate("/login", { replace: true });
      return;
    }
    let local = {};
    try {
      local = JSON.parse(localStorage.getItem("suraksha_game_scores") || "{}");
    } catch {
      local = {};
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem("gp_user", JSON.stringify(d.user));
          setScores(mergeScores(local, d.user.scores));
        }
      })
      .catch(() => {
        const u = localStorage.getItem("gp_user");
        if (u) {
          try {
            const parsed = JSON.parse(u);
            setUser(parsed);
            setScores(mergeScores(local, parsed.scores));
          } catch {
            onClose?.();
            navigate("/login", { replace: true });
          }
        } else {
          onClose?.();
          navigate("/login", { replace: true });
        }
      });
  }, [navigate, refreshSession]);

  const logout = () => {
    localStorage.removeItem("gp_token");
    localStorage.removeItem("gp_user");
    window.dispatchEvent(new Event("suraksha-auth-change"));
    onClose?.();
    navigate("/", { replace: true });
  };

  if (!user) {
    return (
      <div className="flex min-h-[min(50vh,420px)] items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100 text-slate-600">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="text-slate-900">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-gradient-to-r from-sky-50/95 to-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <X size={18} aria-hidden />
          Close
        </button>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>

      <div className="px-4 pb-10 pt-6 sm:px-6">
        <header className="mb-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg">
              <User size={40} strokeWidth={2} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-sky-800">Welcome, {displayNameForWelcome(user)}</p>
              <h1 id="profile-panel-title" className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Your profile
              </h1>
              <p className="mt-1 text-sky-700">SurakshaSetu account</p>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Shield className="text-sky-600" size={22} />
            Account details
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <User size={20} className="mt-0.5 shrink-0 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</p>
                <p className="font-semibold text-slate-900">{user.fullName?.trim() || "—"}</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <Phone size={20} className="mt-0.5 shrink-0 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                <p className="font-semibold text-slate-900">{user.phone}</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <Calendar size={20} className="mt-0.5 shrink-0 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date of birth</p>
                <p className="font-semibold text-slate-900">{user.dob?.trim() || "—"}</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Trophy className="text-amber-500" size={22} />
            Game &amp; activity scores
          </h2>
          <p className="mb-6 text-sm text-slate-600">
            Best results from Security Quiz, Spot the Difference, and Red Flag Hunter sync here when you&apos;re signed in.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-fuchsia-200/80 bg-gradient-to-br from-fuchsia-50 to-white p-4">
              <div className="mb-2 flex items-center gap-2 text-fuchsia-800">
                <Gamepad2 size={18} />
                <span className="text-sm font-bold">Security Quiz</span>
              </div>
              <p className="text-2xl font-black text-fuchsia-700">
                {scores.quizBest ?? 0}
                <span className="text-sm font-semibold text-fuchsia-600/80"> / {scores.quizTotalQs ?? 8} best</span>
              </p>
              {scores.quizAt ? (
                <p className="mt-1 text-xs text-slate-500">Last: {scores.quizLast ?? "—"} correct</p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-800">
                <Trophy size={18} />
                <span className="text-sm font-bold">Spot the Difference</span>
              </div>
              <p className="text-2xl font-black text-emerald-700">{scores.compareBest ?? 0}</p>
              <p className="text-xs text-slate-500">Best correct picks · {scores.compareAnswered ?? 0} attempts logged</p>
            </div>
            <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-white p-4">
              <div className="mb-2 flex items-center gap-2 text-sky-900">
                <Shield size={18} />
                <span className="text-sm font-bold">Red Flag Hunter</span>
              </div>
              <p className="text-2xl font-black text-sky-700">{scores.hunterBest ?? 0}</p>
              <p className="text-xs text-slate-500">Best cumulative score</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
