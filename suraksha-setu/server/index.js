const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const { getCyberStats } = require("./cyberStats");
const fileStore = require("./authFileStore");
const { mergeScores } = fileStore;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/guardian_path";
const JWT_SECRET = process.env.JWT_SECRET || "guardian-path-dev-secret-change-in-production";
/** Optional: enable Cloud Text-to-Speech for hi/mr/en (see https://cloud.google.com/text-to-speech) */
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || "";

/** Try in order — Neural2/Wavenet names differ by GCP project/region; first success wins */
const GOOGLE_TTS_VOICE_FALLBACKS = {
  EN: [
    { languageCode: "en-US", name: "en-US-Neural2-F" },
    { languageCode: "en-US", name: "en-US-Wavenet-F" },
    { languageCode: "en-US", name: "en-US-Standard-I" },
  ],
  HI: [
    { languageCode: "hi-IN", name: "hi-IN-Neural2-A" },
    { languageCode: "hi-IN", name: "hi-IN-Neural2-B" },
    { languageCode: "hi-IN", name: "hi-IN-Wavenet-A" },
    { languageCode: "hi-IN", name: "hi-IN-Wavenet-B" },
    { languageCode: "hi-IN", name: "hi-IN-Standard-A" },
  ],
  MR: [
    { languageCode: "mr-IN", name: "mr-IN-Wavenet-A" },
    { languageCode: "mr-IN", name: "mr-IN-Standard-A" },
    { languageCode: "mr-IN", name: "mr-IN-Standard-B" },
    { languageCode: "mr-IN", name: "mr-IN-Wavenet-B" },
  ],
  ES: [
    { languageCode: "es-ES", name: "es-ES-Neural2-A" },
    { languageCode: "es-ES", name: "es-ES-Wavenet-A" },
  ],
  FR: [
    { languageCode: "fr-FR", name: "fr-FR-Neural2-A" },
    { languageCode: "fr-FR", name: "fr-FR-Wavenet-A" },
  ],
  AR: [
    { languageCode: "ar-XA", name: "ar-XA-Wavenet-A" },
    { languageCode: "ar-XA", name: "ar-XA-Wavenet-B" },
  ],
};

/** Microsoft Edge online neural voices — no API key (uses edge-tts-universal). */
const EDGE_TTS_VOICE_FALLBACKS = {
  EN: ["en-US-JennyNeural", "en-US-GuyNeural", "en-US-AriaNeural"],
  HI: ["hi-IN-SwaraNeural", "hi-IN-MadhurNeural"],
  MR: ["mr-IN-AarohiNeural", "mr-IN-ManoharNeural"],
  ES: ["es-ES-ElviraNeural", "es-ES-AlvaroNeural"],
  FR: ["fr-FR-DeniseNeural", "fr-FR-HenriNeural"],
  AR: ["ar-SA-ZariyahNeural", "ar-EG-SalmaNeural"],
};

async function synthesizeEdgeTtsToBase64(text, langKey) {
  const { EdgeTTS } = await import("edge-tts-universal");
  const voices = EDGE_TTS_VOICE_FALLBACKS[langKey] || EDGE_TTS_VOICE_FALLBACKS.EN;
  let lastErr = null;
  for (const voice of voices) {
    try {
      const tts = new EdgeTTS(text, voice);
      const result = await tts.synthesize();
      const buf = Buffer.from(await result.audio.arrayBuffer());
      if (buf.length > 0) {
        return {
          audioContent: buf.toString("base64"),
          mimeType: "audio/mpeg",
          engine: "microsoft-edge",
          voiceUsed: voice,
        };
      }
    } catch (e) {
      lastErr = e;
      console.warn(`Edge TTS ${voice}:`, e?.message || e);
    }
  }
  throw lastErr || new Error("Edge TTS: all voices failed");
}

async function synthesizeGoogleTtsToBase64(text, langKey) {
  if (!GOOGLE_TTS_API_KEY) throw new Error("No Google API key");
  const voices = GOOGLE_TTS_VOICE_FALLBACKS[langKey] || GOOGLE_TTS_VOICE_FALLBACKS.EN;
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(GOOGLE_TTS_API_KEY)}`;
  let lastErr = null;
  for (const voice of voices) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voice.languageCode,
            name: voice.name,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.98,
            pitch: 0,
          },
        }),
      });
      const data = await r.json();
      if (r.ok && data.audioContent) {
        return {
          audioContent: data.audioContent,
          mimeType: "audio/mpeg",
          engine: "google-cloud",
          voiceUsed: voice.name,
        };
      }
      lastErr = data.error?.message || data.error || `HTTP ${r.status}`;
      console.warn(`Google TTS voice ${voice.name} failed:`, lastErr);
    } catch (e) {
      lastErr = String(e.message || e);
      console.warn(`Google TTS request error for ${voice.name}:`, lastErr);
    }
  }
  throw new Error(lastErr || "Google TTS failed");
}

function normPhone(p) {
  const d = String(p || "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : d;
}

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

function authRequired(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not signed in." });
  }
  try {
    req.auth = jwt.verify(h.slice(7), JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

async function loadUserDocumentById(id) {
  if (mongoReady()) {
    try {
      if (mongoose.isValidObjectId(id)) {
        const u = await User.findById(id).select("-passwordHash").lean();
        if (u) {
          return { ...u, _id: String(u._id) };
        }
      }
    } catch {
      /* fall through to file */
    }
  }
  const f = await fileStore.findById(id);
  if (!f) return null;
  const { passwordHash: _p, ...rest } = f;
  return { ...rest, scores: rest.scores || {} };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "guardian-path-api",
    authStore: mongoReady() ? "mongodb" : "file",
  });
});

app.get("/api/public/cyber-stats", (_req, res) => {
  res.json(getCyberStats());
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const phone = normPhone(req.body.phone);
    const password = String(req.body.password || "");
    const fullName = String(req.body.fullName || "").trim();
    const dob = String(req.body.dob || "").trim();
    if (phone.length !== 10) {
      return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user;

    if (mongoReady()) {
      const exists = await User.findOne({ phone });
      if (exists) return res.status(409).json({ error: "This number is already registered." });
      user = await User.create({ phone, passwordHash, fullName, dob });
    } else {
      try {
        user = await fileStore.registerUser({ phone, passwordHash, fullName, dob });
      } catch (e) {
        if (e.message === "DUPLICATE_PHONE" || e.statusCode === 409) {
          return res.status(409).json({ error: "This number is already registered." });
        }
        throw e;
      }
    }

    const token = jwt.sign({ sub: String(user._id), phone: user.phone }, JWT_SECRET, { expiresIn: "14d" });
    res.status(201).json({
      token,
      user: { phone: user.phone, fullName: user.fullName, scores: user.scores || {} },
    });
  } catch (e) {
    console.error("register error:", e);
    if (e.code === 11000) {
      return res.status(409).json({ error: "This number is already registered." });
    }
    const msg =
      e.name === "MongoServerError" || e.name === "MongoNetworkError" || e.name === "MongooseError"
        ? "Database connection failed. Start MongoDB or rely on file storage — restart the server after fixing MongoDB."
        : String(e.message || "Registration failed.");
    res.status(500).json({ error: msg });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const phone = normPhone(req.body.phone);
    const password = String(req.body.password || "");
    if (phone.length !== 10) {
      return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number." });
    }

    let user;
    if (mongoReady()) {
      user = await User.findOne({ phone });
    } else {
      user = await fileStore.findByPhone(phone);
    }

    if (!user) return res.status(401).json({ error: "Invalid phone or password." });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid phone or password." });
    const token = jwt.sign({ sub: String(user._id), phone: user.phone }, JWT_SECRET, { expiresIn: "14d" });
    res.json({ token, user: { phone: user.phone, fullName: user.fullName, scores: user.scores || {} } });
  } catch (e) {
    console.error("login error:", e);
    res.status(500).json({ error: e.message || "Login failed." });
  }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  try {
    const user = await loadUserDocumentById(req.auth.sub);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({
      user: {
        phone: user.phone,
        fullName: user.fullName || "",
        dob: user.dob || "",
        scores: user.scores || {},
      },
    });
  } catch (e) {
    console.error("me error:", e);
    res.status(500).json({ error: "Could not load profile." });
  }
});

app.patch("/api/user/scores", authRequired, async (req, res) => {
  try {
    const incoming = req.body.scores;
    if (!incoming || typeof incoming !== "object") {
      return res.status(400).json({ error: "Invalid scores payload." });
    }
    const id = req.auth.sub;

    if (mongoReady() && mongoose.isValidObjectId(id)) {
      const u = await User.findById(id);
      if (!u) return res.status(404).json({ error: "User not found." });
      u.scores = mergeScores(u.scores || {}, incoming);
      await u.save();
      return res.json({ scores: u.scores });
    }

    const updated = await fileStore.updateScoresById(id, incoming);
    if (!updated) return res.status(404).json({ error: "User not found." });
    const { passwordHash: _p, ...rest } = updated;
    return res.json({ scores: rest.scores || {} });
  } catch (e) {
    console.error("scores patch:", e);
    res.status(500).json({ error: "Could not save scores." });
  }
});

app.get("/api/tts/status", (_req, res) => {
  res.json({
    /** Hindi/Marathi/English via Microsoft Edge neural TTS — no API key */
    edgeTts: true,
    googleTtsConfigured: Boolean(GOOGLE_TTS_API_KEY),
    hint:
      "Default: Microsoft Edge TTS on the server (free, no key). Optional: GOOGLE_TTS_API_KEY for Google Cloud fallback.",
  });
});

app.post("/api/tts/synthesize", async (req, res) => {
  const text = String(req.body.text || "")
    .trim()
    .slice(0, 4800);
  const lang = String(req.body.lang || "EN").toUpperCase();
  if (!text) {
    return res.status(400).json({ error: "No text", fallback: true });
  }

  try {
    const out = await synthesizeEdgeTtsToBase64(text, lang);
    return res.json(out);
  } catch (edgeErr) {
    console.warn("Edge TTS failed:", edgeErr?.message || edgeErr);
  }

  if (GOOGLE_TTS_API_KEY) {
    try {
      const out = await synthesizeGoogleTtsToBase64(text, lang);
      return res.json(out);
    } catch (gErr) {
      console.warn("Google TTS failed:", gErr?.message || gErr);
    }
  }

  return res.status(502).json({
    error: "TTS failed (Edge and optional Google). Check server logs and network.",
    fallback: true,
  });
});

app.post("/api/analyze", (req, res) => {
  const text = (req.body.text || "").toLowerCase();
  const checks = [
    { test: /(urgent|immediately|suspended|verify now)/, reason: "Urgent language creates pressure." },
    { test: /(otp|password|credit card|cvv)/, reason: "Sensitive data request detected." },
    { test: /(http:\/\/|\.tk|\.ru|bit\.ly)/, reason: "Suspicious or shortened link detected." },
    { test: /(dear customer|winner|congratulations)/, reason: "Generic or manipulative greeting found." },
  ];

  const reasons = checks.filter((c) => c.test.test(text)).map((c) => c.reason);
  const confidence = Math.min(98, 35 + reasons.length * 15);
  res.json({
    label: reasons.length ? "Potential Spam / Phishing" : "Likely Safe",
    confidence,
    reasons: reasons.length ? reasons : ["No major phishing indicators detected."],
  });
});

(async function start() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected — user accounts are stored in MongoDB.");
  } catch (err) {
    console.warn("MongoDB not reachable — user accounts will be stored in:", fileStore.DATA_FILE);
    console.warn("Reason:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
