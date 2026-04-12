import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars -- `motion.div` / `motion.*` JSX uses namespace
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronUp,
  Clock,
  Flame,
  MessageSquare,
  Send,
  Shield,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";

const CATEGORY_ORDER = ["OTP Scam", "Job Scam", "Bank Scam", "Delivery Scam"];

const CATEGORY_STYLES = {
  "OTP Scam": "bg-rose-100 text-rose-700",
  "Bank Scam": "bg-amber-100 text-amber-800",
  "Job Scam": "bg-orange-100 text-orange-800",
  "Delivery Scam": "bg-sky-100 text-sky-800",
};

const TREND_ICON_BG = {
  "OTP Scam": "from-rose-500 to-orange-500",
  "Job Scam": "from-orange-500 to-amber-500",
  "Bank Scam": "from-amber-400 to-yellow-500",
  "Delivery Scam": "from-sky-500 to-cyan-500",
};

function relativeTime(ts) {
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_FEED = [
  {
    id: "s1",
    category: "OTP Scam",
    body: "they asked me for my otp",
    confirms: 1,
    highlyReported: false,
    at: Date.now() - 9_000,
  },
  {
    id: "s2",
    category: "Bank Scam",
    body:
      "Urgent: Your bank account has been locked. Click this link to verify your identity and unlock: bit.ly/unlock-2024. Act now or lose access!",
    confirms: 248,
    highlyReported: true,
    at: Date.now() - 30 * 60_000,
  },
  {
    id: "s3",
    category: "Job Scam",
    body: "Pay ₹5000 registration fee to get a work-from-home job with Google. Limited slots!",
    confirms: 190,
    highlyReported: true,
    at: Date.now() - 2 * 60 * 60_000,
  },
  {
    id: "s4",
    category: "Delivery Scam",
    body: "Your package is on hold — pay customs fee via this link or it will be returned.",
    confirms: 42,
    highlyReported: false,
    at: Date.now() - 5 * 60 * 60_000,
  },
];

export default function SetuConnect() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTP Scam");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const totalConfirms = useMemo(() => feed.reduce((a, r) => a + r.confirms, 0), [feed]);
  const totalReports = feed.length;

  const trending = useMemo(() => {
    const counts = {};
    feed.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return CATEGORY_ORDER.map((name) => ({
      name,
      count: counts[name] || 0,
    }));
  }, [feed]);

  const onConfirm = useCallback((id) => {
    setFeed((prev) =>
      prev.map((r) => (r.id === id ? { ...r, confirms: r.confirms + 1 } : r)),
    );
  }, []);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setScreenshot(null);
      setScreenshotName("");
      return;
    }
    if (screenshot) URL.revokeObjectURL(screenshot);
    setScreenshot(URL.createObjectURL(f));
    setScreenshotName(f.name);
  };

  const clearFile = () => {
    if (screenshot) URL.revokeObjectURL(screenshot);
    setScreenshot(null);
    setScreenshotName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitReport = (e) => {
    e.preventDefault();
    const text = description.trim();
    if (!text) return;
    const row = {
      id: uid(),
      category,
      body: text,
      confirms: 0,
      highlyReported: false,
      at: Date.now(),
    };
    setFeed((prev) => [row, ...prev]);
    setDescription("");
    clearFile();
  };

  const formValid = description.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 text-slate-900 antialiased selection:bg-sky-200">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <header className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <ArrowLeft size={18} className="transition group-hover:-translate-x-0.5" aria-hidden />
            Back
          </button>
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/25">
                <Shield size={22} strokeWidth={2.2} aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl">Setu Connect</h1>
                <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">Community Scam Alert Feed</p>
              </div>
            </div>
          </div>
          <span className="inline-block w-[88px] shrink-0 sm:w-[100px]" aria-hidden />
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-rose-100/90 p-5 shadow-sm"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(251,113,133,0.35)",
                    "0 0 0 14px rgba(251,113,133,0)",
                    "0 0 0 0 rgba(251,113,133,0.35)",
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex items-start gap-2">
                <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={22} aria-hidden />
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={22} aria-hidden />
                <h2 className="text-lg font-bold text-rose-900">Warning of the Day</h2>
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-rose-950/90">
                Fraudsters are sending fake bank alerts: <strong>Your OTP is 847392</strong> — never share OTPs, CVV,
                or UPI PIN. Real banks never ask for these over call or SMS.
              </p>
              <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES["OTP Scam"]}`}>
                  OTP Scam
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-800/80">
                  <Users size={14} aria-hidden />
                  Reported by 312 users today
                </span>
              </div>
            </motion.div>

            <motion.section
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <MessageSquare size={18} aria-hidden />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Report a Scam</h2>
              </div>
              <form onSubmit={submitReport} className="flex flex-col gap-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the scam you encountered..."
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    <Upload size={14} aria-hidden />
                    Upload Screenshot (Optional)
                  </button>
                  {screenshotName ? (
                    <span className="text-xs text-slate-500">
                      {screenshotName}{" "}
                      <button type="button" className="font-semibold text-rose-600 hover:underline" onClick={clearFile}>
                        Remove
                      </button>
                    </span>
                  ) : null}
                </div>
                {screenshot ? (
                  <motion.img
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    src={screenshot}
                    alt="Screenshot preview"
                    className="max-h-48 w-auto max-w-full rounded-xl border border-slate-200 object-contain"
                  />
                ) : null}
                <motion.button
                  type="submit"
                  disabled={!formValid}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-md transition-colors disabled:cursor-not-allowed ${
                    formValid
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
                      : "bg-slate-300 text-slate-600"
                  }`}
                  whileHover={formValid ? { scale: 1.02 } : {}}
                  whileTap={formValid ? { scale: 0.98 } : {}}
                >
                  <Send size={18} aria-hidden />
                  Report &amp; Alert Others
                </motion.button>
              </form>
            </motion.section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Users size={18} aria-hidden />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Community Feed</h2>
              </div>
              <ul className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {feed.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      {item.highlyReported ? (
                        <motion.div
                          className="absolute left-0 right-0 top-0 h-1 origin-left rounded-t-2xl bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.55, ease: "easeOut" }}
                        />
                      ) : null}
                      <div className="flex gap-3 pt-0.5">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[item.category] || "bg-slate-100 text-slate-700"}`}
                            >
                              {item.category}
                            </span>
                            {item.highlyReported ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                <Flame size={12} className="shrink-0" aria-hidden />
                                Highly Reported
                              </span>
                            ) : null}
                          </div>
                          <div className="mb-2 flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={12} aria-hidden />
                            {relativeTime(item.at)}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-900">{item.body}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-center border-l border-slate-100 pl-3">
                          <motion.button
                            type="button"
                            aria-label="Confirm this report"
                            onClick={() => onConfirm(item.id)}
                            className="flex flex-col items-center gap-0.5 rounded-xl border-2 border-transparent px-2 py-1.5 text-center transition hover:border-slate-900 focus-visible:border-slate-900 focus-visible:outline-none"
                            whileTap={{ scale: 0.92 }}
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                              <ChevronUp size={18} strokeWidth={2.5} aria-hidden />
                            </span>
                            <span
                              className={`text-base font-bold ${item.confirms > 100 ? "text-rose-600" : "text-slate-600"}`}
                            >
                              {item.confirms}
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Confirm</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            <motion.div
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="text-orange-500" size={22} aria-hidden />
                <h2 className="text-lg font-bold text-slate-900">Trending Scams</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {trending.map((t, i) => (
                  <motion.li
                    key={t.name}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 transition hover:border-orange-200 hover:bg-white hover:shadow-sm"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm ${TREND_ICON_BG[t.name]}`}
                    >
                      <Flame size={18} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">
                        {t.count} {t.count === 1 ? "report" : "reports"}
                      </p>
                    </div>
                    <TrendingUp className="shrink-0 text-orange-500" size={18} aria-hidden />
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                className="rounded-2xl bg-cyan-100/90 p-4 text-center shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.p
                  key={totalReports}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-black text-sky-600"
                >
                  {totalReports}
                </motion.p>
                <p className="mt-1 text-xs font-semibold text-sky-800/80">Total Reports</p>
              </motion.div>
              <motion.div
                className="rounded-2xl bg-rose-100/90 p-4 text-center shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.p
                  key={totalConfirms}
                  initial={{ scale: 1.15, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-black leading-tight text-rose-600 sm:text-3xl"
                >
                  {totalConfirms}
                </motion.p>
                <p className="mt-1 text-xs font-semibold text-rose-900/80">Total Confirms</p>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
