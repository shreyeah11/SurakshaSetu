import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Shield } from "lucide-react";

function TypingBubble() {
  return (
    <div className="inline-flex max-w-[78%] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
      <span className="flex items-center gap-1">
        <span className="typing-dot" />
        <span className="typing-dot typing-dot2" />
        <span className="typing-dot typing-dot3" />
      </span>
      <span className="text-xs font-semibold text-slate-400">typing…</span>
    </div>
  );
}

function ResultModal({ variant, onTryAgain, onBack }) {
  const isBad = variant === "tricked";
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4">
      <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${isBad ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
        <div className="flex items-start gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl ${isBad ? "bg-rose-500/15 text-rose-700" : "bg-emerald-500/15 text-emerald-700"}`}>
            {isBad ? <span className="text-2xl font-black">×</span> : <span className="text-2xl font-black">✓</span>}
          </div>
          <div className="flex-1">
            <h2 className={`text-3xl font-extrabold ${isBad ? "text-rose-700" : "text-emerald-700"}`}>{isBad ? "You Were Tricked!" : "You Stayed Safe!"}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-700">Safety Score: {isBad ? "40%" : "100%"}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4">
          <p className="text-sm font-extrabold text-slate-900">{isBad ? "Mistakes Made" : "Correct Actions"}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {isBad ? (
              <>
                <li>Ask for verification details</li>
                <li>Provide card details</li>
              </>
            ) : (
              <>
                <li>Ignore the message</li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onTryAgain} className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-500/20 hover:brightness-110">
            Try Again
          </button>
          <button onClick={onBack} className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScamSimulator() {
  const navigate = useNavigate();
  const [node, setNode] = useState("start");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! This is Bank Security. Your account has been locked due to suspicious activity detected at 3:42 AM." },
  ]);
  const [typing, setTyping] = useState(false);
  const [safety, setSafety] = useState(100);
  const [alerting, setAlerting] = useState(false);
  const [alertSeconds, setAlertSeconds] = useState(5);
  const [result, setResult] = useState(null); // "tricked" | "safe" | null
  const timers = useRef([]);
  const sirenRef = useRef(() => {});

  const stepNo = useMemo(() => {
    if (node === "start") return 1;
    if (node === "ask1") return 3;
    return 1;
  }, [node]);

  const choices = useMemo(() => {
    if (node === "start") {
      return [
        { id: "share", label: "Share OTP immediately", kind: "bad" },
        { id: "ignore", label: "Ignore the message", kind: "good" },
        { id: "ask", label: "Ask for verification details", kind: "neutral" },
        { id: "report", label: "Report as suspicious", kind: "good" },
      ];
    }
    if (node === "ask1") {
      return [
        { id: "provide", label: "Provide card details", kind: "bad" },
        { id: "end", label: "End conversation", kind: "good" },
      ];
    }
    return [];
  }, [node]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
      sirenRef.current?.();
    },
    []
  );

  useEffect(() => {
    if (!alerting) return;
    setAlertSeconds(5);
    const iv = setInterval(() => {
      setAlertSeconds((s) => (s > 1 ? s - 1 : 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [alerting]);

  const startSiren = () => {
    sirenRef.current?.();
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      master.gain.value = 0.001;
      osc1.type = "sawtooth";
      osc2.type = "triangle";
      osc1.frequency.value = 760;
      osc2.frequency.value = 510;
      lfo.frequency.value = 1.8;
      lfoGain.gain.value = 220;

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      osc1.connect(master);
      osc2.connect(master);
      master.connect(ctx.destination);

      ctx.resume?.();
      osc1.start();
      osc2.start();
      lfo.start();
      master.gain.setTargetAtTime(0.13, ctx.currentTime, 0.02);

      sirenRef.current = () => {
        try {
          master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        } catch {}
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            lfo.stop();
          } catch {}
          try {
            ctx.close();
          } catch {}
        }, 200);
      };
    } catch {
      sirenRef.current = () => {};
    }
  };

  const pushBot = (text, delay = 900) => {
    setTyping(true);
    const t1 = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text }]);
    }, delay);
    timers.current.push(t1);
  };

  const triggerAlert = () => {
    startSiren();
    setAlerting(true);
    const t1 = setTimeout(() => {
      setAlerting(false);
      sirenRef.current?.();
      setResult("tricked");
    }, 5000);
    timers.current.push(t1);
  };

  const onPick = (c) => {
    if (typing || alerting || result) return;
    setMessages((m) => [...m, { from: "user", text: c.label }]);

    if (node === "start") {
      if (c.id === "share") {
        setSafety(40);
        triggerAlert();
        return;
      }
      if (c.id === "ignore" || c.id === "report") {
        setSafety(100);
        setResult("safe");
        return;
      }
      if (c.id === "ask") {
        setSafety(90);
        setNode("ask1");
        pushBot("Thank you! Now please confirm your card details: Last 4 digits and CVV.");
        return;
      }
    }

    if (node === "ask1") {
      if (c.id === "provide") {
        setSafety(40);
        triggerAlert();
        return;
      }
      if (c.id === "end") {
        setSafety(100);
        setResult("safe");
      }
    }
  };

  const onTryAgain = () => {
    clearTimers();
    sirenRef.current?.();
    setAlerting(false);
    setAlertSeconds(5);
    setResult(null);
    setNode("start");
    setSafety(100);
    setTyping(false);
    setMessages([{ from: "bot", text: "Hello! This is Bank Security. Your account has been locked due to suspicious activity detected at 3:42 AM." }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50/35 to-white">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-90 [background:radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_78%_30%,rgba(244,63,94,0.16),transparent_55%),radial-gradient(circle_at_55%_92%,rgba(99,102,241,0.18),transparent_55%)]" />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">
              <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                AI Scam Simulator
              </span>
            </h1>
            <p className="text-xs font-semibold text-slate-500">WhatsApp-style safe practice chat</p>
          </div>
          <div className="w-[92px]" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Step {stepNo} / 4
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
            <Shield size={14} className="text-sky-600" />
            Safety Score: {safety}%
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${Math.max(10, Math.min(100, safety))}%` }} />
        </div>

        <div className="mt-3 rounded-2xl border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-sm font-semibold text-amber-900 backdrop-blur">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>This is a simulated scam environment. Do not enter real personal information.</span>
          </div>
        </div>

        <div className="mt-5 min-h-[440px] rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_22px_70px_rgba(2,6,23,0.08)] backdrop-blur">
          <div className="space-y-3">
            {messages.map((m, idx) => {
              const isUser = m.from === "user";
              return (
                <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                      isUser
                        ? "border-sky-300/60 bg-gradient-to-r from-sky-600 to-blue-700 text-white"
                        : "border-slate-200/70 bg-white/90 text-slate-800"
                    }`}
                  >
                    {m.text}
                    <div className={`mt-1 text-[11px] ${isUser ? "text-white/80" : "text-slate-400"}`}>11:32 AM</div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start">
                <TypingBubble />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 text-center text-xs font-semibold text-slate-500">Choose your response</div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              disabled={typing || alerting || !!result}
              className="rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-xs font-extrabold text-slate-800 shadow-sm hover:bg-white disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Link to="/challenge" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Back to challenges
          </Link>
        </div>
      </div>

      {alerting && (
        <div className="fixed inset-0 z-[55] grid place-items-center bg-[#d92f2f] p-6">
          <div className="w-full max-w-6xl text-center text-white">
            <div className="mb-5 flex items-center justify-center gap-5 text-4xl sm:text-5xl">
              <span className="alarm-blink">🚨</span>
              <div className="mx-auto grid h-24 w-24 place-items-center text-white">
                <AlertTriangle size={78} strokeWidth={2.2} />
              </div>
              <span className="alarm-blink">🚨</span>
            </div>
            <div className="alarm-blink text-[2rem] font-black tracking-tight sm:text-[4rem]">
              ALERT! SENSITIVE DATA SHARED!
            </div>
            <p className="mx-auto mt-4 max-w-3xl text-lg font-extrabold text-white sm:text-2xl">
              You just shared sensitive personal information! This is extremely dangerous in real scenarios.
            </p>
            <div className="mt-8 text-6xl font-black uppercase tracking-[0.18em] text-white/20 sm:text-8xl">ALERT</div>
            <p className="mt-8 text-sm font-bold text-white/90">
              Safety warning active. Next screen will appear automatically in {alertSeconds}s.
            </p>
          </div>
        </div>
      )}

      {result && <ResultModal variant={result} onTryAgain={onTryAgain} onBack={() => navigate("/challenge")} />}
    </div>
  );
}

