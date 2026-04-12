import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Check, Eye, Info, Upload, Volume2 } from "lucide-react";
import { getDeepfakeSession, predictDeepfakeFromImageFile } from "../lib/runDeepfakeOnnx";
import { speakTextWithAppLang } from "../voice/useVoiceAssistant";

/** Listen-aloud lines per app language (matches LanguageModal codes). */
function summaryTtsLine(analysisKind, pct, appLang) {
  const p = Math.round(Number(pct) || 0);
  const L = {
    EN: {
      text: `Text risk score is about ${p} percent, including scam and phishing style cues. This is not the image model.`,
      image: `AI likelihood is about ${p} percent based on the ONNX image model. Always verify important content through multiple sources.`,
    },
    HI: {
      text:
        "\u091F\u0947\u0915\u094D\u0938\u094D\u091F \u091C\u094B\u0916\u093F\u092E \u0938\u094D\u0915\u094B\u0930 \u0932\u0917\u092D\u0917 " +
        p +
        " \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0939\u0948, \u091C\u093F\u0938\u092E\u0947\u0902 \u0938\u094D\u0915\u0948\u092E \u0914\u0930 \u092B\u093C\u093F\u0936\u093F\u0902\u0917 \u091C\u0948\u0938\u0947 \u0938\u0902\u0915\u0947\u0924 \u0936\u093E\u092E\u093F\u0932 \u0939\u0948\u0902\u0964 \u092F\u0939 \u091A\u093F\u0924\u094D\u0930 \u092E\u0949\u0921\u0932 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
      image:
        "ONNX \u091A\u093F\u0924\u094D\u0930 \u092E\u0949\u0921\u0932 \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930 \u090F\u0906\u0908 \u0915\u0940 \u0938\u0902\u092D\u093E\u0935\u0928\u093E \u0932\u0917\u092D\u0917 " +
        p +
        " \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0939\u0948\u0964 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0939\u092E\u0947\u0936\u093E \u0915\u0908 \u0938\u094D\u0930\u094B\u0924\u094B\u0902 \u0938\u0947 \u091C\u093E\u0901\u091A \u0932\u0947\u0902\u0964",
    },
    MR: {
      text:
        "\u092E\u091C\u0915\u0942\u0930 \u0927\u094B\u0915\u094D\u092F\u093E\u091A\u093E \u0938\u094D\u0915\u094B\u0930 \u0938\u0941\u092E\u093E\u0930\u0947 " +
        p +
        " \u091F\u0915\u094D\u0915\u0947 \u0906\u0939\u0947, \u0918\u094B\u091F\u093E\u0932\u093E \u0906\u0923\u093F \u092B\u093F\u0936\u093F\u0902\u0917 \u0938\u093E\u0930\u0916\u094D\u092F\u093E \u0938\u0902\u0915\u0947\u0924\u093E\u0902\u0938\u0939. \u0939\u093E \u092A\u094D\u0930\u0924\u093F\u092E\u093E \u092E\u0949\u0921\u0947\u0932 \u0928\u093E\u0939\u0940\u0964",
      image:
        "ONNX \u092A\u094D\u0930\u0924\u093F\u092E\u093E \u092E\u0949\u0921\u0947\u0932 \u0928\u0941\u0938\u093E\u0930 \u0915\u0943\u0924\u094D\u0930\u093F\u092E \u092C\u0941\u0926\u094D\u0927\u093F\u092E\u0924\u094D\u0924\u0947\u091A\u0940 \u0936\u0915\u094D\u092F\u0924\u093E \u0938\u0941\u092E\u093E\u0930\u0947 " +
        p +
        " \u091F\u0915\u094D\u0915\u0947 \u0906\u0939\u0947. \u092E\u0939\u0924\u094D\u0935\u093E\u091A\u0940 \u092E\u093E\u0939\u093F\u0924\u0940 \u0928\u0947\u0939\u092E\u0940 \u0905\u0928\u0947\u0915 \u0938\u094D\u0930\u094B\u0924\u093E\u0902\u0924\u0942\u0928 \u0924\u092A\u093E\u0938\u093E\u0964",
    },
    ES: {
      text: `La puntuación de riesgo del texto es alrededor del ${p} por ciento, con señales de estafa y phishing. No es el modelo de imagen.`,
      image: `La probabilidad de contenido generado por IA es alrededor del ${p} por ciento según el modelo ONNX. Verifica siempre con varias fuentes.`,
    },
    FR: {
      text: `Le score de risque du texte est d'environ ${p} pour cent, avec des indices d'arnaque et de hameçonnage. Ce n'est pas le modèle image.`,
      image: `La probabilité d'IA est d'environ ${p} pour cent selon le modèle ONNX. Vérifiez toujours auprès de plusieurs sources.`,
    },
    AR: {
      text: `درجة مخاطر النص حوالي ${p} بالمائة، مع مؤشرات احتيال وتصيد. هذا ليس نموذج الصور.`,
      image: `احتمال المحتوى المولد بالذكاء الاصطناعي حوالي ${p} بالمائة حسب نموذج ONNX. تحقق دائما من مصادر متعددة.`,
    },
  };
  const key = String(appLang || "EN").toUpperCase();
  const pack = L[key] || L.EN;
  return analysisKind === "text" ? pack.text : pack.image;
}

const IMG_QUIZ = {
  a: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&w=720&q=80",
    label: "Real",
    isAi: false,
  },
  b: {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&w=720&q=80",
    label: "AI Generated",
    isAi: true,
  },
};

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i += 1) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function createWavBlob(float32Mono, sampleRate) {
  const n = float32Mono.length;
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, n * 2, true);
  floatTo16BitPCM(view, 44, float32Mono);
  return new Blob([buffer], { type: "audio/wav" });
}

function makeAudioPairUrls() {
  const sr = 22050;
  const len = Math.floor(sr * 1.35);
  const ai = new Float32Array(len);
  const real = new Float32Array(len);
  for (let i = 0; i < len; i += 1) {
    const t = i / sr;
    ai[i] = Math.sin(2 * Math.PI * 440 * t) * 0.88;
    real[i] =
      Math.sin(2 * Math.PI * 440 * t + 0.06 * Math.sin(2 * Math.PI * 2.2 * t)) *
        (0.72 + 0.1 * Math.sin(2 * Math.PI * 0.65 * t)) +
      (Math.random() - 0.5) * 0.045;
  }
  const aUrl = URL.createObjectURL(createWavBlob(ai, sr));
  const bUrl = URL.createObjectURL(createWavBlob(real, sr));
  return { aUrl, bUrl, aiIs: "a" };
}

function textHeuristicScore(text) {
  const t = text.trim();
  if (!t) return null;
  let score = 6;
  const lower = t.toLowerCase();

  const phishUrgent =
    /\b(urgent|immediately|asap|act\s+now|right\s+now|expires?|time\s*sensitive|verify\s+now|confirm\s+now|last\s+chance)\b/i.test(
      t,
    );
  const phishSecrets =
    /\b(password|passwd|pass\s*word|otp|one[-\s]?time|pin\s*code|cvv|cvc|ssn|social\s+security|account\s+number|routing|login\s+credentials)\b/i.test(
      t,
    );
  const phishAction =
    /\b(click\s+(here|this|the\s+link)|wire\s+transfer|gift\s+card|bitcoin|crypto|send\s+money|share\s+your)\b/i.test(t);
  const phishBank =
    /\b(bank|paypal|amazon|microsoft|irs|refund|invoice|tax\s+refund|package\s+delivery|fedex|dhl)\b/i.test(t) &&
    (phishUrgent || phishSecrets);

  if (phishUrgent) score += 26;
  if (phishSecrets) score += 30;
  if (phishUrgent && phishSecrets) score += 20;
  if (phishAction) score += 16;
  if (phishBank) score += 10;

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 80) score += 14;
  if (/^\s*[-*•\d.]+\s/m.test(t)) score += 10;
  if (/\b(furthermore|moreover|delve|landscape|tapestry|unlock|leverage)\b/gi.test(t)) score += 18;
  if (/(\b\w+\b)(\s+\1\b){2,}/i.test(t)) score += 20;
  if (/[—–]{2,}/.test(t)) score += 6;
  if (lower.includes("lorem ipsum")) score += 40;

  return Math.min(96, Math.round(score + (t.length > 1200 ? 12 : 0)));
}

export default function DeepfakeRecognition({ lang = "EN" }) {
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiPercent, setAiPercent] = useState(null);
  const [analysisKind, setAnalysisKind] = useState(null);
  const [showWhy, setShowWhy] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const [quizStep, setQuizStep] = useState(0);
  const [quizPick, setQuizPick] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [audioPair, setAudioPair] = useState({ aUrl: "", bUrl: "", aiIs: "a" });

  useEffect(() => {
    const pair = makeAudioPairUrls();
    setAudioPair(pair);
    return () => {
      URL.revokeObjectURL(pair.aUrl);
      URL.revokeObjectURL(pair.bUrl);
    };
  }, []);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const u = URL.createObjectURL(file);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const pills = useMemo(() => {
    if (aiPercent === null) return [];
    const p = aiPercent;
    const textMode = analysisKind === "text";
    return [
      {
        key: "risk",
        text:
          p >= 55
            ? textMode
              ? "High suspicious-text signals"
              : "Higher AI likelihood"
            : textMode
              ? "Fewer red-flag phrases"
              : "Lower AI risk detected",
        tone: p >= 55 ? "bad" : "good",
      },
      {
        key: "verify",
        text:
          p >= 35 && p < 72
            ? "Needs human verification"
            : p >= 72
              ? textMode
                ? "Possible scam or mass message"
                : "Treat as suspicious"
              : "Still verify the source",
        tone: "warn",
      },
      {
        key: "real",
        text:
          p < 45 ? (textMode ? "Does not look like typical spam" : "Likely Real") : textMode ? "Review carefully anyway" : "Not enough to confirm real",
        tone: p < 45 ? "neutral" : "muted",
      },
    ];
  }, [aiPercent, analysisKind]);

  const prefetchModel = useCallback(async () => {
    setModelLoading(true);
    setError("");
    try {
      await getDeepfakeSession();
      setModelReady(true);
    } catch (e) {
      setModelReady(false);
      setError(e?.message || "Could not load the ONNX model. Check your connection and try again.");
    } finally {
      setModelLoading(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      setFile(f);
      setAiPercent(null);
      setAnalysisKind(null);
      setError("");
      setShowWhy(false);
    }
  };

  const onAnalyze = async () => {
    setError("");
    setShowWhy(false);
    if (tab === "upload") {
      if (!file) {
        setError("Upload a photo, video, or audio file first.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("The ONNX detector runs on images. For video or audio, use the tips below or extract a clear frame first.");
        return;
      }
      setAnalyzing(true);
      try {
        if (!modelReady) {
          setModelLoading(true);
          await getDeepfakeSession();
          setModelReady(true);
          setModelLoading(false);
        }
        const pct = await predictDeepfakeFromImageFile(file);
        setAiPercent(pct);
        setAnalysisKind("onnx");
      } catch (e) {
        setAiPercent(null);
        setError(e?.message || "Analysis failed.");
      } finally {
        setAnalyzing(false);
        setModelLoading(false);
      }
    } else {
      const score = textHeuristicScore(pasteText);
      if (score === null) {
        setError("Paste some text to analyze.");
        return;
      }
      setAnalyzing(true);
      await new Promise((r) => setTimeout(r, 380));
      setAiPercent(score);
      setAnalysisKind("text");
      setAnalyzing(false);
    }
  };

  const speakSummary = () => {
    if (aiPercent === null) return;
    const line = summaryTtsLine(analysisKind, aiPercent, lang);
    void speakTextWithAppLang(line, lang);
  };

  const quizConfig = useMemo(
    () => [
      {
        id: "image",
        title: "Image Comparison",
        aiKey: "b",
        explanation:
          "AI-generated images often show subtle inconsistencies (lighting, edges, reflections). Always verify with multiple cues, not just one.",
        hints: ["Check facial symmetry", "Look at eye reflections", "Examine hair details"],
      },
      {
        id: "audio",
        title: "Audio Clues",
        aiKey: audioPair.aiIs || "a",
        explanation:
          "Synthetic audio may sound too consistent. Real speech typically has natural variation in pitch, pauses, and breathing.",
        hints: ["Listen for unnatural smoothness", "Check pauses and emphasis", "Look for clipped consonants"],
      },
    ],
    [audioPair.aiIs],
  );

  const currentQuiz = quizConfig[quizStep];
  const quizDone = quizStep >= quizConfig.length;

  const onQuizSelect = (key) => {
    if (quizDone) return;
    setQuizPick(key);
  };

  const onQuizNext = () => {
    if (!currentQuiz || quizPick === null) return;
    const ok = quizPick === currentQuiz.aiKey;
    setQuizResults((r) => [...r, ok]);
    setQuizPick(null);
    if (quizStep + 1 < quizConfig.length) {
      setQuizStep((s) => s + 1);
    } else {
      setQuizStep((s) => s + 1);
    }
  };

  const quizCorrect = quizResults.filter(Boolean).length;
  const quizTotal = quizConfig.length;

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizPick(null);
    setQuizResults([]);
  };

  return (
    <div className="df2Page">
      <div className="df2Bg" aria-hidden="true">
        <span className="df2Deco df2d1">&#128737;</span>
        <span className="df2Deco df2d2">&#128241;</span>
      </div>

      <div className="df2Inner">
        <header className="df2Top">
          <Link className="df2Back" to="/">
            ← Back to Home
          </Link>
          <button type="button" className="df2IconBtn" onClick={speakSummary} aria-label="Read summary aloud">
            <Volume2 size={20} strokeWidth={2} />
          </button>
        </header>

        <section className="df2HeroCard">
          <div className="df2HeroTitleRow">
            <AlertTriangle className="df2WarnIcon" size={22} strokeWidth={2.2} aria-hidden="true" />
            <div>
              <h1 className="df2HeroTitle">Deepfake Detector</h1>
              <p className="df2HeroSub">Upload files or text to analyze for AI-generated content</p>
            </div>
          </div>

          <div className="df2Tabs" role="tablist" aria-label="Analysis mode">
            <button type="button" role="tab" aria-selected={tab === "upload"} className={tab === "upload" ? "on" : ""} onClick={() => setTab("upload")}>
              Upload Media
            </button>
            <button type="button" role="tab" aria-selected={tab === "text"} className={tab === "text" ? "on" : ""} onClick={() => setTab("text")}>
              Paste Text
            </button>
          </div>

          {tab === "upload" ? (
            <>
              <div
                className="df2Drop"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => document.getElementById("df2-file")?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    document.getElementById("df2-file")?.click();
                  }
                }}
              >
                <Upload className="df2UpIcon" size={36} strokeWidth={1.8} aria-hidden="true" />
                <p className="df2DropTitle">Drop a photo, video, or audio here</p>
                <p className="df2DropSub">or click to choose a file</p>
                <input
                  id="df2-file"
                  className="df2HiddenInput"
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      setAiPercent(null);
                      setAnalysisKind(null);
                      setError("");
                      setShowWhy(false);
                    }
                  }}
                />
              </div>
              {previewUrl ? (
                <div className="df2PreviewBlock">
                  <img src={previewUrl} alt="Upload preview" className="df2PreviewImg" />
                  <p className="df2PreviewOk">File uploaded! Click Analyze below.</p>
                </div>
              ) : null}
            </>
          ) : (
            <label className="df2TextAreaWrap">
              <span className="df2SrOnly">Text to analyze</span>
              <textarea
                className="df2TextArea"
                rows={6}
                placeholder="Paste suspicious text here…"
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value);
                  setAiPercent(null);
                  setAnalysisKind(null);
                  setError("");
                  setShowWhy(false);
                }}
              />
            </label>
          )}

          <div className="df2ModelRow">
            <button type="button" className="df2Linkish" onClick={prefetchModel} disabled={modelLoading || modelReady}>
              {modelReady ? "ONNX model ready" : modelLoading ? "Loading ONNX…" : "Preload ONNX model (first run downloads ~50–90 MB)"}
            </button>
          </div>

          <button type="button" className="df2Analyze" disabled={analyzing} onClick={onAnalyze}>
            <AlertTriangle size={18} strokeWidth={2.2} aria-hidden="true" />
            {analyzing ? "Analyzing…" : "Analyze"}
          </button>

          {error ? (
            <p className="df2Error" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        {aiPercent !== null ? (
          <section className="df2ResultCard">
            <div className="df2ResultHead">
              <h2>Analysis Result</h2>
              <button type="button" className="df2IconBtn df2IconBtn--ghost" aria-label="Toggle explanation details" onClick={() => setShowWhy((v) => !v)}>
                <Eye size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="df2Likelihood">
              <div className="df2LikelihoodRow">
                <span>{analysisKind === "text" ? "Text risk score" : "AI Likelihood"}</span>
                <span className="df2Pct">{aiPercent}%</span>
              </div>
              {analysisKind === "text" ? (
                <p className="df2LikelihoodHint">Combines scam/phishing cues and AI-like wording—not the image ONNX model.</p>
              ) : null}
              <div className="df2BarTrack">
                <div className="df2BarFill" style={{ width: `${Math.min(100, aiPercent)}%` }} />
              </div>
            </div>

            <div className="df2Pills">
              {pills.map((pill) => (
                <span key={pill.key} className={`df2Pill df2Pill--${pill.tone}`}>
                  {pill.text}
                </span>
              ))}
            </div>

            <button type="button" className="df2WhyBtn" onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy}>
              <Info className="df2WhyIcon" size={18} strokeWidth={2} aria-hidden="true" />
              Why this result?
              <span className="df2Chev" aria-hidden="true">
                {showWhy ? "\u25BC" : "\u25B6"}
              </span>
            </button>

            {showWhy ? (
              <div className="df2WhyBox">
                <p className="df2Disclaimer">
                  <span aria-hidden="true">&#9888;&#65039;</span> This is an educational estimation, not a definitive result. Always verify important content
                  through multiple sources.
                </p>
                {analysisKind === "onnx" ? (
                  <ul className="df2WhyList">
                    <li>Image analyzed with a Vision Transformer exported to ONNX (Deep-Fake-Detector v2 community build).</li>
                    <li>Output is the estimated probability of the &quot;Deepfake&quot; class versus &quot;Realism&quot;.</li>
                    <li>If the score looks uncertain, retake with better lighting or verify from the original source.</li>
                  </ul>
                ) : (
                  <ul className="df2WhyList">
                    <li>
                      Text mode scores urgency, requests for secrets (password, OTP, PIN), and common phishing patterns—plus generic AI-style wording cues.
                    </li>
                    <li>High scores mean &quot;treat as suspicious,&quot; not proof of a specific model. It is not the ONNX image model.</li>
                  </ul>
                )}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="df2Train">
          <h2 className="df2TrainTitle">Train Your Eyes</h2>
          <p className="df2TrainSub">Can you spot the AI-generated content?</p>
          <p className="df2TrainFoot">
            The drills below use labeled practice content. The detector above runs a real ONNX image model on <strong>your</strong> uploads.
          </p>

          {!quizDone ? (
            <div className="df2QuizCard">
              <div className="df2QuizTop">
                <span className="df2QuizBadge">{currentQuiz?.title}</span>
                <span className="df2QuizCount">
                  {quizStep + 1} / {quizTotal}
                </span>
              </div>
              <div className="df2Prog">
                <div className="df2ProgFill" style={{ width: `${((quizStep + 1) / quizTotal) * 100}%` }} />
              </div>

              {currentQuiz?.id === "image" ? (
                <div className="df2CompareGrid">
                  {["a", "b"].map((key) => {
                    const item = IMG_QUIZ[key];
                    const sel = quizPick === key;
                    const revealed = quizPick !== null;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`df2Opt ${sel ? "df2Opt--sel" : ""} ${
                          revealed ? (item.isAi ? "df2Opt--ai" : "df2Opt--real") : "df2Opt--neutral"
                        }`}
                        onClick={() => onQuizSelect(key)}
                      >
                        <div className="df2OptTop">
                          <span className="df2OptTag">{revealed ? item.label : `Image ${key.toUpperCase()}`}</span>
                          <span className={`df2OptRadio ${sel ? "on" : ""}`} aria-hidden="true" />
                        </div>
                        <div className="df2OptImgWrap">
                          <img src={item.src} alt="" className="df2OptImg" />
                        </div>
                        <div className="df2OptFoot">
                          <span className="df2Gt">
                            {revealed ? `Ground truth: ${item.label}` : "Which one looks more synthetic? Labels appear after you choose."}
                          </span>
                          <strong>Option {key.toUpperCase()}</strong>
                          <span className="df2OptHint">Click to select</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {currentQuiz?.id === "audio" && audioPair.aUrl ? (
                <div className="df2CompareGrid">
                  {["a", "b"].map((key) => {
                    const sel = quizPick === key;
                    const revealed = quizPick !== null;
                    const aiKey = audioPair.aiIs;
                    const isSynthetic = key === aiKey;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`df2Opt df2Opt--audio ${sel ? "df2Opt--sel" : ""} ${
                          revealed ? (isSynthetic ? "df2Opt--ai" : "df2Opt--real") : "df2Opt--neutral"
                        }`}
                        onClick={() => onQuizSelect(key)}
                      >
                        <div className="df2OptTop">
                          <span className="df2OptTag">
                            {revealed
                              ? isSynthetic
                                ? "AI-generated (synthetic)"
                                : "Natural variation"
                              : `Clip ${key.toUpperCase()}`}
                          </span>
                          <span className={`df2OptRadio ${sel ? "on" : ""}`} aria-hidden="true" />
                        </div>
                        <div className="df2AudioShell">
                          <audio controls src={key === "a" ? audioPair.aUrl : audioPair.bUrl} className="df2Audio" />
                        </div>
                        <div className="df2OptFoot">
                          <span className="df2Gt">
                            {revealed
                              ? isSynthetic
                                ? "Ground truth: synthetic / overly smooth tone"
                                : "Ground truth: more like natural speech"
                              : "Which sounds more synthetic? Labels appear after you choose."}
                          </span>
                          <strong>Option {key.toUpperCase()}</strong>
                          <span className="df2OptHint">Click to select</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="df2Explain">
                <h3 className="df2ExplainTitle">
                  <Info size={18} strokeWidth={2} aria-hidden="true" /> Explanation
                </h3>
                <p>{currentQuiz?.explanation}</p>
                <p className="df2HintsTitle">Detection Hints:</p>
                <ul>
                  {currentQuiz?.hints.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              <button type="button" className="df2NextChallenge" disabled={quizPick === null} onClick={onQuizNext}>
                Next Challenge →
              </button>
            </div>
          ) : (
            <div className="df2QuizCard df2Summary">
              <div className="df2QuizTop">
                <span className="df2QuizBadge">Results</span>
                <span className="df2QuizCount">
                  {quizTotal} / {quizTotal}
                </span>
              </div>
              <div className="df2Prog">
                <div className="df2ProgFill" style={{ width: "100%" }} />
              </div>
              <div className="df2Star" aria-hidden="true">
                &#11088;
              </div>
              <p className="df2ScoreLine">
                You got {quizCorrect}/{quizTotal} correct
              </p>
              <div className="df2AccPill">{Math.round((quizCorrect / quizTotal) * 100)}% Accuracy</div>
              <div className="df2Feedback">
                <div className="df2Fb df2Fb--y">
                  <Check size={18} strokeWidth={2.5} aria-hidden="true" /> Great job spotting visual inconsistencies!
                </div>
                <div className="df2Fb df2Fb--y">
                  <AlertTriangle size={18} strokeWidth={2} aria-hidden="true" /> Listen for unnaturally smooth audio.
                </div>
                <div className="df2Fb df2Fb--g">
                  <Check size={18} strokeWidth={2.5} aria-hidden="true" /> Keep checking multiple cues, not just one.
                </div>
              </div>
              <div className="df2SummaryActions">
                <button type="button" className="df2NextChallenge" onClick={resetQuiz}>
                  Try Again
                </button>
                <Link className="df2LearnMore" to="/challenge">
                  Learn More
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
