import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ALLOWED_APP_LANG = new Set(["EN", "HI", "MR", "ES", "FR", "AR"]);

/** Prefer live value from localStorage (same as landing language) so TTS never lags behind UI */
export function getEffectiveAppLang(langProp) {
  try {
    const s = localStorage.getItem("suraksha-lang");
    if (s && ALLOWED_APP_LANG.has(s)) return s;
  } catch {
    /* ignore */
  }
  const p = String(langProp ?? "EN").toUpperCase();
  return ALLOWED_APP_LANG.has(p) ? p : "EN";
}

function normLang(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/_/g, "-");
}

function toSpeechLang(appLang) {
  const map = {
    EN: "en-US",
    HI: "hi-IN",
    MR: "mr-IN",
    ES: "es-ES",
    FR: "fr-FR",
    AR: "ar-SA",
  };
  const key = String(appLang ?? "EN").toUpperCase();
  return map[key] || "en-US";
}

function voiceMatchesAppLang(voice, base) {
  const vl = normLang(voice.lang);
  const name = String(voice.name || "").toLowerCase();
  if (base === "hi") {
    if (vl === "hi" || vl.startsWith("hi-")) return true;
    if (/hindi|hemant|kalpana|devanagari|india.*hi\b/.test(name)) return true;
    return false;
  }
  if (base === "en") return vl === "en" || vl.startsWith("en-");
  if (base === "es") return vl === "es" || vl.startsWith("es-");
  if (base === "fr") return vl === "fr" || vl.startsWith("fr-");
  if (base === "ar") return vl === "ar" || vl.startsWith("ar-");
  if (base === "mr") {
    if (vl === "mr" || vl.startsWith("mr-")) return true;
    if (/marathi|मराठी/i.test(name)) return true;
    return false;
  }
  return vl.startsWith(`${base}-`) || vl === base;
}

function voicesForAppLang(voices, speechLang) {
  const base = normLang(speechLang).split("-")[0] || "en";
  return (voices || []).filter((v) => voiceMatchesAppLang(v, base));
}

function pickBestVoice(candidates, speechLang) {
  if (!candidates?.length) return null;
  const want = normLang(speechLang);

  const exact = candidates.find((v) => normLang(v.lang) === want);
  if (exact) return exact;

  const prefix = candidates.find((v) => normLang(v.lang).startsWith(want));
  if (prefix) return prefix;

  const base = want.split("-")[0];
  const baseMatch = candidates.find((v) => {
    const vl = normLang(v.lang);
    return vl === base || vl.startsWith(`${base}-`);
  });
  if (baseMatch) return baseMatch;

  return candidates[0];
}

function b64ToBlob(b64, mime) {
  const bin = atob(b64);
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime || "audio/mpeg" });
}

async function refreshVoices(synth, attempts = 4) {
  let voices = synth.getVoices?.() || [];
  for (let i = 0; i < attempts; i += 1) {
    if (voices.length) break;
    await new Promise((r) => setTimeout(r, 120));
    voices = synth.getVoices?.() || [];
  }
  if (!voices.length) {
    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        synth.removeEventListener?.("voiceschanged", finish);
        resolve();
      };
      synth.addEventListener?.("voiceschanged", finish);
      setTimeout(finish, 800);
    });
    voices = synth.getVoices?.() || [];
  }
  await new Promise((r) => setTimeout(r, 120));
  const again = synth.getVoices?.() || [];
  return again.length >= voices.length ? again : voices;
}

/**
 * Try Google Cloud TTS via our API (server holds GOOGLE_TTS_API_KEY).
 * Returns true if playback started; false to use browser synthesis.
 */
async function speakWithGoogleTts(text, appLang, audioRef, blobUrlRef, onSpeaking, onDone) {
  try {
    const r = await fetch("/api/tts/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: String(text).slice(0, 4800),
        lang: getEffectiveAppLang(appLang),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.audioContent) return false;

    const blob = b64ToBlob(data.audioContent, data.mimeType || "audio/mpeg");
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => onSpeaking(true, false);
    audio.onpause = () => {};
    audio.onended = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      audioRef.current = null;
      onDone();
    };
    audio.onerror = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      audioRef.current = null;
      onDone();
    };

    await audio.play();
    return true;
  } catch {
    return false;
  }
}

async function speakWithBrowserSynth(text, appLang, onSpeaking, onUtterEnd) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  const raw = String(text ?? "").trim();
  if (!raw) return;

  synth.cancel();
  const app = getEffectiveAppLang(appLang);
  const speechLang = toSpeechLang(app);

  let voices = await refreshVoices(synth);
  let pool = voicesForAppLang(voices, speechLang);
  let voice = pickBestVoice(pool, speechLang);

  if (app !== "EN" && !voice) {
    const deadline = Date.now() + 2800;
    while (!voice && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 220));
      voices = synth.getVoices?.() || [];
      pool = voicesForAppLang(voices, speechLang);
      voice = pickBestVoice(pool, speechLang);
    }
  }

  if (app !== "EN" && !voice) {
    voice = findLooseIndicVoice(voices, app);
  }

  const u = new SpeechSynthesisUtterance(raw);
  u.lang = voice ? normLang(voice.lang) || speechLang : speechLang;
  if (voice) u.voice = voice;

  u.onstart = () => onSpeaking(true, false);
  u.onend = () => {
    onUtterEnd();
  };
  u.onerror = () => {
    onUtterEnd();
  };

  synth.speak(u);
}

/** Last resort when strict filters find nothing (e.g. Edge voice names) */
function findLooseIndicVoice(voices, app) {
  const all = voices || [];
  if (app === "HI") {
    return (
      all.find((v) => normLang(v.lang).startsWith("hi")) ||
      all.find((v) => /hindi|हिन्दी|devanagari|india.*hi/i.test(String(v.name || "")))
    );
  }
  if (app === "MR") {
    return (
      all.find((v) => normLang(v.lang).startsWith("mr")) ||
      all.find((v) => /marathi|मराठी/i.test(String(v.name || "")))
    );
  }
  return null;
}

export async function speakTextWithAppLang(text, appLang) {
  if (typeof window === "undefined") return;
  const raw = typeof text === "string" ? text : String(text ?? "");
  if (!raw.trim()) return;

  window.speechSynthesis?.cancel();

  const app = getEffectiveAppLang(appLang);
  const audioRef = { current: null };
  const blobUrlRef = { current: null };

  const ok = await speakWithGoogleTts(raw, app, audioRef, blobUrlRef, () => {}, () => {});
  if (ok) return;

  await speakWithBrowserSynth(raw, app, () => {}, () => {});
}

export function useVoiceAssistant({ lang, getText }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utterRef = useRef(null);
  const audioRef = useRef(null);
  const blobUrlRef = useRef(null);
  const useGoogleRef = useRef(false);
  const speakImplRef = useRef(null);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    useGoogleRef.current = false;
    utterRef.current = null;
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback(async () => {
    if (typeof window === "undefined") return;
    const text = typeof getText === "function" ? String(getText() || "") : "";
    if (!text.trim()) return;

    stop();
    const appLang = getEffectiveAppLang(lang);

    useGoogleRef.current = false;

    const onSpeaking = (isSpeaking, isPaused) => {
      setSpeaking(isSpeaking);
      setPaused(isPaused);
    };
    const onDone = () => {
      setSpeaking(false);
      setPaused(false);
      audioRef.current = null;
      useGoogleRef.current = false;
    };

    const googleOk = await speakWithGoogleTts(text, appLang, audioRef, blobUrlRef, onSpeaking, onDone);
    if (googleOk) {
      useGoogleRef.current = true;
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth) return;

    const speechLang = toSpeechLang(appLang);
    let voices = await refreshVoices(synth);
    let pool = voicesForAppLang(voices, speechLang);
    let voice = pickBestVoice(pool, speechLang);

    if (appLang !== "EN" && !voice) {
      const deadline = Date.now() + 2800;
      while (!voice && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 220));
        voices = synth.getVoices?.() || [];
        pool = voicesForAppLang(voices, speechLang);
        voice = pickBestVoice(pool, speechLang);
      }
    }

    if (appLang !== "EN" && !voice) {
      voice = findLooseIndicVoice(voices, appLang);
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice ? normLang(voice.lang) || speechLang : speechLang;
    if (voice) u.voice = voice;

    u.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    u.onend = () => {
      setSpeaking(false);
      setPaused(false);
      utterRef.current = null;
    };
    u.onerror = () => {
      setSpeaking(false);
      setPaused(false);
      utterRef.current = null;
    };

    utterRef.current = u;
    synth.speak(u);
  }, [getText, lang, stop]);

  speakImplRef.current = speak;

  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;

    if (useGoogleRef.current && audioRef.current) {
      const a = audioRef.current;
      if (!speaking) {
        void speakImplRef.current?.();
        return;
      }
      if (paused) {
        a.play();
        setPaused(false);
        return;
      }
      a.pause();
      setPaused(true);
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth) return;
    if (!speaking) {
      void speakImplRef.current?.();
      return;
    }
    if (synth.paused) {
      synth.resume();
      setPaused(false);
      return;
    }
    synth.pause();
    setPaused(true);
  }, [speaking, paused]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    void refreshVoices(synth);
  }, []);

  return useMemo(() => ({ speaking, paused, toggle, stop }), [paused, speaking, stop, toggle]);
}
