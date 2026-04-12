import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Send, Trash2 } from "lucide-react";

const SUGGESTED = [
  "How can I identify phishing emails?",
  "What makes a password secure?",
  "How do I spot fake websites?",
  "What are red flags in SMS messages?",
  "Someone asked for my OTP — what should I do?",
  "I clicked a suspicious link — what now?",
  "How can I verify a bank call is real?",
  "Is it safe to share Aadhaar/PAN online?",
  "How to report a cybercrime in India?",
  "What is UPI PIN vs OTP?",
];

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function answerFor(qRaw) {
  const q = normalize(qRaw);
  if (q.includes("phishing")) {
    return [
      "Key signs of phishing emails:",
      "1) Suspicious sender domain (lookalike spellings).",
      "2) Urgent / threatening language.",
      "3) Links that don’t match the brand (hover to preview).",
      "4) Requests for OTP, passwords, PIN, card details.",
      "5) Unexpected attachments or login pages.",
      "",
      "Safe action: Don’t click. Verify via the official app/website, or call the official number (not from the message).",
    ].join("\n");
  }
  if (q.includes("password")) {
    return [
      "A strong password is:",
      "- Long (12+ characters).",
      "- Unique for every account.",
      "- A passphrase is best (e.g., 4 random words).",
      "- Avoid names, birthdays, common patterns (1234, qwerty).",
      "",
      "Tip: Use a password manager + turn on 2FA.",
    ].join("\n");
  }
  if (q.includes("fake website") || q.includes("spot fake") || q.includes("websites")) {
    return [
      "How to spot fake websites:",
      "- Check the full domain carefully (spelling matters).",
      "- Prefer typing the URL yourself instead of clicking links.",
      "- Look for HTTPS + valid certificate (but remember HTTPS alone isn’t enough).",
      "- Watch for urgent popups, forced downloads, or “verify now” traps.",
      "- Cross-check contact info from a trusted source.",
    ].join("\n");
  }
  if (q.includes("sms") || q.includes("red flags")) {
    return [
      "Red flags in SMS/WhatsApp messages:",
      "- Unknown sender claiming to be a bank/government.",
      "- Shortened links or strange domains.",
      "- Pressure: “Account blocked in 2 hours”.",
      "- Asking for OTP, UPI PIN, card CVV.",
      "- Request to install an app / share screen.",
      "",
      "Safe action: Ignore + verify via official channels.",
    ].join("\n");
  }
  if (q.includes("otp")) {
    return [
      "Never share OTP.",
      "- Banks/UPI apps will NEVER ask for OTP over call, SMS, or chat.",
      "- OTP means someone is trying to log in or make a transaction.",
      "",
      "If you shared OTP:",
      "1) Immediately contact your bank.",
      "2) Freeze/block the account if possible.",
      "3) Change passwords and enable 2FA.",
    ].join("\n");
  }
  if (q.includes("clicked") || q.includes("suspicious link")) {
    return [
      "If you clicked a suspicious link:",
      "1) Don’t enter any details.",
      "2) Close the page and clear browser data.",
      "3) Run a device security scan.",
      "4) Change passwords for affected accounts.",
      "5) Monitor bank/UPI transactions and set alerts.",
      "",
      "If money is lost: report immediately to cybercrime portal / your bank.",
    ].join("\n");
  }
  if (q.includes("bank call") || q.includes("verify") || q.includes("real")) {
    return [
      "How to verify a bank call is real:",
      "- Hang up and call back using the official number from the bank’s website/app.",
      "- Do not trust caller ID (it can be spoofed).",
      "- Never share OTP/UPI PIN/CVV/passwords on call.",
    ].join("\n");
  }
  if (q.includes("aadhaar") || q.includes("pan")) {
    return [
      "Sharing Aadhaar/PAN online:",
      "- Share only on official, verified websites.",
      "- Prefer masked Aadhaar where possible.",
      "- Never send documents via unknown WhatsApp/Telegram numbers.",
      "- Don’t share OTPs or allow remote access apps.",
    ].join("\n");
  }
  if (q.includes("report") || q.includes("cybercrime")) {
    return [
      "Reporting cybercrime (India):",
      "- Contact your bank immediately to freeze/stop transactions.",
      "- Collect evidence: screenshots, numbers, UPI IDs, URLs, timestamps.",
      "- Report via the official cybercrime portal or helpline (as per your region).",
      "",
      "The sooner you report, the higher the chance of recovery.",
    ].join("\n");
  }
  if (q.includes("upi") && (q.includes("pin") || q.includes("otp"))) {
    return [
      "UPI PIN vs OTP:",
      "- UPI PIN authorizes payments in your UPI app.",
      "- OTP is a one-time code for login/verification/transactions.",
      "",
      "Rule: Never share either with anyone. Banks/agents won’t ask for them.",
    ].join("\n");
  }
  return [
    "I can help with cyber safety questions like phishing, scams, passwords, fake links, UPI safety, and reporting.",
    "Try one of the suggested questions above, or tell me what message you received and what it asked for.",
  ].join("\n");
}

export default function SecurityAssistant() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: "Hello! I'm your cybersecurity assistant. I can help you understand phishing emails, scam messages, secure passwords, and more. What would you like to learn about?",
    },
  ]);
  const scroller = useRef(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!scroller.current) return;
    scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, typing]);

  const send = (q) => {
    const text = String(q ?? input).trim();
    if (!text || typing) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text }]);
    setTyping(true);
    const t1 = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: answerFor(text) }]);
    }, 900);
    timers.current.push(t1);
  };

  const suggestions = useMemo(() => SUGGESTED, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50/40 to-white">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-90 [background:radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_80%_35%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(34,197,94,0.12),transparent_55%)]" />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back
          </button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Bot className="text-cyan-600" />
              <h1 className="text-2xl font-extrabold text-slate-900">Security Assistant</h1>
            </div>
            <p className="text-sm text-slate-500">Ask me anything about cybersecurity</p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearTimers();
              setTyping(false);
              setMsgs([
                {
                  from: "bot",
                  text: "Hello! I'm your cybersecurity assistant. I can help you understand phishing emails, scam messages, secure passwords, and more. What would you like to learn about?",
                },
              ]);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            <Trash2 size={16} />
            Clear Chat
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur">
          <div ref={scroller} className="h-[520px] overflow-y-auto pr-1">
            <div className="space-y-4">
              {msgs.map((m, idx) => {
                const isUser = m.from === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-gradient-to-r from-fuchsia-500/15 to-pink-500/10 text-slate-900 border border-fuchsia-200/60"
                        : "bg-gradient-to-r from-cyan-500/12 to-sky-500/8 text-slate-900 border border-sky-200/60"
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-200/60 bg-white/70 px-4 py-3 text-sm text-slate-700 backdrop-blur">
                    <span className="flex items-center gap-1">
                      <span className="typing-dot" />
                      <span className="typing-dot typing-dot2" />
                      <span className="typing-dot typing-dot3" />
                    </span>
                    <span className="text-xs font-semibold text-slate-400">typing…</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-extrabold text-slate-700">Suggested questions</p>
            <div className="grid gap-3 md:grid-cols-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInput(q)}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm hover:bg-white"
                >
                  ✨ {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-[0_18px_55px_rgba(2,6,23,0.06)] backdrop-blur">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Type your question here…"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-300"
            />
            <button
              type="button"
              onClick={() => send()}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-500/20 hover:brightness-110"
            >
              <Send size={16} />
              Send
            </button>
          </div>
          <div className="mt-2 text-center text-xs text-slate-500">
            Back to challenges:{" "}
            <Link className="font-semibold text-sky-700 hover:underline" to="/challenge">
              Choose your challenge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

