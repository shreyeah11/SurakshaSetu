import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Eye,
  Flame,
  Globe,
  Home,
  Languages,
  LogOut,
  Moon,
  Shield,
  Sun,
  Trophy,
  Upload,
} from "lucide-react";
import Spline from "@splinetool/react-spline";
import axios from "axios";
import confetti from "canvas-confetti";
import MascotPng from "./assets/mascot.png";
import QuizThumb1 from "./assets/quiz/q1-phishing-email.svg";
import QuizThumb2 from "./assets/quiz/q2-otp-secret.svg";
import QuizThumb3 from "./assets/quiz/q3-suspicious-link.svg";
import QuizThumb4 from "./assets/quiz/q4-verify-official.svg";
import QuizThumb5 from "./assets/quiz/q5-sender-check.svg";
import QuizThumb6 from "./assets/quiz/q6-safe-response.svg";
import QuizThumb7 from "./assets/quiz/q7-short-link-risk.svg";
import QuizThumb8 from "./assets/quiz/q8-payment-scam.svg";
import GuidedSandboxIntro from "./pages/GuidedSandboxIntro.jsx";
import CreatePin from "./pages/CreatePin.jsx";
import ConfirmPin from "./pages/ConfirmPin.jsx";
import SetupComplete from "./pages/SetupComplete.jsx";
import Landing from "./pages/Landing.jsx";
import UpiSetupIntro from "./pages/UpiSetupIntro.jsx";
import KycIntro from "./pages/KycIntro.jsx";
import KycTerms from "./pages/KycTerms.jsx";
import KycIdProof from "./pages/KycIdProof.jsx";
import KycPersonal from "./pages/KycPersonal.jsx";
import KycAddress from "./pages/KycAddress.jsx";
import KycUpload from "./pages/KycUpload.jsx";
import KycComplete from "./pages/KycComplete.jsx";
import UpiTutorial from "./pages/UpiTutorial.jsx";
import ScamSimulator from "./pages/ScamSimulator.jsx";
import SecurityAssistant from "./pages/SecurityAssistant.jsx";
import CyberPolice from "./pages/CyberPolice.jsx";
import DeepfakeRecognition from "./pages/DeepfakeRecognition.jsx";
import SetuConnect from "./pages/SetuConnect.jsx";
import GuardianAuth from "./pages/GuardianAuth.jsx";
import { applyGoogleTranslateLanguage, loadGoogleTranslateScript } from "./lib/googleTranslate.js";
import { recordGameScore } from "./lib/gameScores.js";
import { displayNameForWelcome } from "./lib/userDisplay.js";

const API = "/api";
const MASCOT_SCENE =
  // Put your own Spline scene URL here via Vite env if desired.
  // Example: https://prod.spline.design/<id>/scene.splinecode
  import.meta.env.VITE_SPLINE_MASCOT_SCENE || "https://prod.spline.design/FOVFxh6f5M7VV4lI/scene.splinecode";

const QUIZ_BANK = {
  EN: [
    {
      q: "Which of the following is a common sign of a phishing email?",
      a: ["Professional email address from a known company", "Urgent language demanding immediate action", "Personalized greeting with your full name", "Links to official company websites"],
      correct: 1,
      explain: "Phishing often uses urgency to rush you into acting without thinking.",
    },
    {
      q: "What should you never share over email/SMS?",
      a: ["One-time password (OTP)", "Your first name", "Your city", "A public review"],
      correct: 0,
      explain: "OTPs and passwords are secrets. Legit companies won’t ask for them in messages.",
    },
    {
      q: "Which link is most suspicious?",
      a: ["https://amazon.com/account", "https://support.google.com", "http://amaz0n-secure.tk/verify", "https://bankofamerica.com"],
      correct: 2,
      explain: "Look-alike spelling + uncommon TLD + verification trap is a classic red flag.",
    },
    {
      q: "A message says: “Your account will be closed in 2 hours.” What should you do first?",
      a: ["Click the link immediately", "Reply with your details", "Verify via the official website/app", "Forward to friends"],
      correct: 2,
      explain: "Go to the official website/app yourself. Don’t use links in the message.",
    },
    {
      q: "What is a safe way to verify a sender?",
      a: ["Trust the display name", "Check the full email address/domain", "Trust emojis/logos", "Assume it’s safe if it mentions a brand"],
      correct: 1,
      explain: "Attackers spoof display names. Always inspect the real address/domain.",
    },
    {
      q: "Which is the safest response to a suspicious message?",
      a: ["Provide partial info to test them", "Download the attachment to check", "Report/ignore and verify independently", "Send back your OTP to confirm"],
      correct: 2,
      explain: "Don’t engage. Report it and verify through official channels.",
    },
    {
      q: "Why are shortened URLs risky in messages?",
      a: ["They make pages load slower", "They hide the real destination", "They are always illegal", "They stop antivirus"],
      correct: 1,
      explain: "Short links can conceal malicious domains.",
    },
    {
      q: "If an email asks for payment details to “unlock” an account, it’s likely:",
      a: ["Routine support", "A scam attempt", "A standard security check", "Required by law"],
      correct: 1,
      explain: "Legit services don’t ask for sensitive details via email to unlock accounts.",
    },
  ],
  ES: [
    {
      q: "¿Cuál es una señal común de un correo de phishing?",
      a: ["Dirección profesional de una empresa conocida", "Lenguaje urgente que exige acción inmediata", "Saludo personalizado con tu nombre completo", "Enlaces a sitios oficiales"],
      correct: 1,
      explain: "El phishing usa urgencia para que actúes sin pensar.",
    },
    {
      q: "¿Qué nunca debes compartir por email/SMS?",
      a: ["Código OTP", "Tu nombre", "Tu ciudad", "Una reseña pública"],
      correct: 0,
      explain: "OTPs y contraseñas son secretos. Las empresas legítimas no los piden por mensaje.",
    },
    {
      q: "¿Qué enlace es más sospechoso?",
      a: ["https://amazon.com/account", "https://support.google.com", "http://amaz0n-secure.tk/verify", "https://bankofamerica.com"],
      correct: 2,
      explain: "Ortografía parecida + TLD raro + verificación falsa = alerta.",
    },
    {
      q: "Un mensaje dice: “Tu cuenta se cerrará en 2 horas”. ¿Qué haces primero?",
      a: ["Clic en el enlace", "Responder con datos", "Verificar en la web/app oficial", "Reenviar a amigos"],
      correct: 2,
      explain: "Ve tú mismo a la web/app oficial. No uses enlaces del mensaje.",
    },
  ],
  HI: [
    {
      q: "फ़िशिंग ईमेल का आम संकेत कौन सा है?",
      a: ["ज्ञात कंपनी का प्रोफेशनल ईमेल", "तुरंत कार्रवाई के लिए दबाव/अर्जेंसी", "पूरा नाम वाला पर्सनलाइज़्ड ग्रीटिंग", "ऑफिशियल वेबसाइट के लिंक"],
      correct: 1,
      explain: "फ़िशिंग में अक्सर जल्दबाज़ी/डर दिखाकर आपको तुरंत क्लिक करवाया जाता है।",
    },
    {
      q: "ईमेल/SMS पर क्या कभी साझा नहीं करना चाहिए?",
      a: ["OTP", "पहला नाम", "शहर", "पब्लिक रिव्यू"],
      correct: 0,
      explain: "OTP/पासवर्ड सीक्रेट हैं—कोई भी वैध कंपनी इन्हें मैसेज में नहीं मांगती।",
    },
    {
      q: "कौन सा लिंक सबसे ज़्यादा संदिग्ध है?",
      a: ["https://amazon.com/account", "https://support.google.com", "http://amaz0n-secure.tk/verify", "https://bankofamerica.com"],
      correct: 2,
      explain: "0 की जगह o, .tk जैसे TLD और “verify” ट्रैप—ये लाल झंडे हैं।",
    },
    {
      q: "मैसेज कहता है: “2 घंटे में अकाउंट बंद होगा।” सबसे पहले क्या करें?",
      a: ["तुरंत लिंक क्लिक करें", "डिटेल्स भेजें", "ऑफिशियल वेबसाइट/ऐप पर खुद जाकर जांचें", "दोस्तों को भेजें"],
      correct: 2,
      explain: "कभी भी मैसेज के लिंक से नहीं—हमेशा ऑफिशियल ऐप/वेबसाइट से जांच करें।",
    },
  ],
  FR: [
    {
      q: "Quel est un signe courant de phishing ?",
      a: ["Adresse pro d’une entreprise connue", "Langage urgent demandant une action immédiate", "Salutation personnalisée complète", "Liens vers des sites officiels"],
      correct: 1,
      explain: "Le phishing utilise souvent l’urgence pour vous précipiter.",
    },
    {
      q: "Que ne faut-il jamais partager par email/SMS ?",
      a: ["OTP (code)", "Prénom", "Ville", "Avis public"],
      correct: 0,
      explain: "OTP/mots de passe sont secrets. Une entreprise légitime ne les demandera pas.",
    },
  ],
  AR: [
    {
      q: "ما علامة شائعة لرسائل التصيّد؟",
      a: ["عنوان مهني من شركة معروفة", "لغة عاجلة تطلب إجراءً فوريًا", "تحية مخصصة باسمك الكامل", "روابط لمواقع رسمية"],
      correct: 1,
      explain: "التصيّد يستخدم الاستعجال لدفعك للتصرف دون تفكير.",
    },
    {
      q: "ما الذي لا يجب مشاركته عبر البريد/الرسائل؟",
      a: ["رمز OTP", "الاسم الأول", "المدينة", "مراجعة عامة"],
      correct: 0,
      explain: "رموز OTP وكلمات المرور أسرار ولا يجب مشاركتها.",
    },
  ],
};

const hunterScenarios = [
  {
    id: "s1",
    subject: "URGENT: Your Account Will Be Suspended!",
    from: "security@amaz0n-verify.com",
    body:
      "Dear Valued Customer,\n\nYour Amazon account has been locked due to suspicious activity. You must verify your identity within 24 hours or your account will be permanently suspended.\n\nClick here to verify: http://amaz0n-secure-login.tk/verify\n\nProvide your password and OTP to regain access immediately.\n\nAmazon Security Team",
    redFlags: [
      { id: "misspell", label: "Misspelled URL", highlight: "amaz0n" },
      { id: "urgent", label: "Urgent language", highlight: "URGENT" },
      { id: "sender", label: "Suspicious sender", highlight: "security@amaz0n-verify.com" },
      { id: "url", label: "Suspicious URL", highlight: "http://amaz0n-secure-login.tk/verify" },
      { id: "otp", label: "Requests passwords/OTP", highlight: "password and OTP" },
    ],
    hint:
      "Look for 5 suspicious elements: unusual URLs, urgent language, requests for passwords/OTP, unknown senders, and emotional pressure tactics.",
  },
  {
    id: "s2",
    subject: "Payment Issue: Action Required",
    from: "billing@paypaI-support.com",
    body:
      "Hello,\n\nWe detected an issue with your recent payment. To avoid service interruption, confirm your billing details now.\n\nLogin: https://paypaI-support.com/secure\n\nReply with your OTP for confirmation.\n\nThanks,\nBilling Team",
    redFlags: [
      { id: "misspell", label: "Look-alike domain", highlight: "paypaI-support.com" },
      { id: "urgent", label: "Pressure to act", highlight: "avoid service interruption" },
      { id: "sender", label: "Untrusted sender", highlight: "billing@paypaI-support.com" },
      { id: "url", label: "Suspicious link", highlight: "https://paypaI-support.com/secure" },
      { id: "otp", label: "Requests OTP", highlight: "Reply with your OTP" },
    ],
    hint:
      "Check for look-alike letters (I vs l), pressure, and any request to share OTP over email.",
  },
  {
    id: "s3",
    subject: "Security Alert: Verify Device",
    from: "no-reply@google-security-alerts.support",
    body:
      "Hi,\n\nA new device tried to sign in to your account. If this wasn’t you, verify immediately.\n\nVerify here: https://google-security-alerts.support/device\n\nFailure to verify may result in account closure.\n\nSecurity",
    redFlags: [
      { id: "domain", label: "Unusual domain", highlight: "google-security-alerts.support" },
      { id: "urgent", label: "Threatening tone", highlight: "account closure" },
      { id: "url", label: "Suspicious URL", highlight: "https://google-security-alerts.support/device" },
      { id: "emotion", label: "Fear tactic", highlight: "If this wasn’t you, verify immediately" },
      { id: "generic", label: "Generic greeting", highlight: "Hi" },
    ],
    hint:
      "Legit alerts typically use official domains and never threaten closure over a single email.",
  },
];

const LANGS = ["EN", "ES", "HI", "MR", "FR", "AR"];

const I18N = {
  EN: {
    home: "Home",
    chooseYourChallenge: "Choose Your Challenge",
    chooseSubtitle: "Master cybersecurity skills through interactive learning",
    play: "Play",
    spamDetector: "Spam Detector",
    spamSubtitle: "Upload files or text to analyze for spam",
    uploadFile: "Upload File/Screenshot",
    pasteText: "Paste Text",
    analyze: "Analyze",

    redFlagHunter: "Soch Secure",
    spotTheScam: "Spot the Scam",
    spotTheScamHelp: "Click on anything that looks suspicious in the message below.",
    step1Title: "Step 1: Look for suspicious elements",
    step1Desc: "Read the message and click on any suspicious text.",
    overallProgress: "Overall Progress",
    totalScore: "Total Score",
    streak: "Streak",
    attempts: "Attempts",
    emailMessage: "Email Message",
    scenario: "Scenario",
    suspicious: "Suspicious",
    subject: "Subject:",
    from: "From:",
    hintTitle: "Hint",
    showHint: "Show Hint",
    hideHint: "Hide Hint",
    submitAnswer: "Submit Answer",
    tryAgain: "Try Again",
    nextScenario: "Next Scenario",
    detectedRedFlags: "Detected Red Flags",
    noRedFlagsYet: "No red flags detected yet",
    clickSuspicious: "Click suspicious parts of the message",
    goodEffort: "Good effort!",
    youFound: (found, total) => `You found ${found} out of ${total} red flags.`,
    youMissed: "You missed:",
    aiSafetyAssistant: "AI Safety Assistant",
    smartProtectionTips: "Smart protection tips",
    whatToLookFor: "What to look for:",
    proTip: "Pro Tip",

    spotTheDifference: "Spot the Difference",
    compareInstruction: "Compare both messages and click on the one you think is a SCAM",
    scoreLabel: "Score",
    legitimateSigns: "LEGITIMATE SIGNS:",
    redFlagsLabel: "RED FLAGS:",
    correct: "Correct!",
    notQuite: "Not quite",

    securityQuiz: "Security Quiz",
    questionOf: (n, total) => `Question ${n} of ${total}`,
    previous: "Previous",
    next: "Next",
    sochSecureDesc: "Click on suspicious elements in phishing messages",
    securityQuizDesc: "Test your knowledge with multiple-choice questions",
    spotDifferenceDesc: "Compare legitimate and scam messages side-by-side",
    scamSimulator: "Scam Simulator",
    scamSimulatorDesc: "Chat with an AI scammer and see if you can avoid being tricked",
    startSimulation: "Start Simulation",
    assistantInfo: "Learn to protect yourself from cyber threats through interactive games",
    securityAssistant: "Security Assistant",
    spamPastePlaceholder: "Paste your message, email, or SMS content here...",
    confidenceLabel: "Confidence",
  },
  ES: {
    home: "Inicio",
    chooseYourChallenge: "Elige tu desafío",
    chooseSubtitle: "Domina ciberseguridad con aprendizaje interactivo",
    play: "Jugar",
    spamDetector: "Detector de spam",
    spamSubtitle: "Sube archivos o texto para analizar spam",
    uploadFile: "Subir archivo/captura",
    pasteText: "Pegar texto",
    analyze: "Analizar",

    redFlagHunter: "Soch Secure",
    spotTheScam: "Detecta la Estafa",
    spotTheScamHelp: "Haz clic en cualquier cosa que parezca sospechosa en el mensaje.",
    step1Title: "Paso 1: Busca elementos sospechosos",
    step1Desc: "Lee el mensaje y haz clic en el texto sospechoso.",
    overallProgress: "Progreso",
    totalScore: "Puntaje total",
    streak: "Racha",
    attempts: "Intentos",
    emailMessage: "Mensaje de correo",
    scenario: "Escenario",
    suspicious: "Sospechoso",
    subject: "Asunto:",
    from: "De:",
    hintTitle: "Pista",
    showHint: "Mostrar pista",
    hideHint: "Ocultar pista",
    submitAnswer: "Enviar respuesta",
    tryAgain: "Intentar de nuevo",
    nextScenario: "Siguiente escenario",
    detectedRedFlags: "Señales detectadas",
    noRedFlagsYet: "Aún no se detectan señales",
    clickSuspicious: "Haz clic en partes sospechosas del mensaje",
    goodEffort: "¡Buen intento!",
    youFound: (found, total) => `Encontraste ${found} de ${total} señales.`,
    youMissed: "Te faltó:",
    aiSafetyAssistant: "Asistente de seguridad IA",
    smartProtectionTips: "Consejos de protección",
    whatToLookFor: "Qué buscar:",
    proTip: "Consejo",

    spotTheDifference: "Detecta la diferencia",
    compareInstruction: "Compara ambos mensajes y haz clic en el que creas que es una ESTAFA",
    scoreLabel: "Puntuación",
    legitimateSigns: "SEÑALES LEGÍTIMAS:",
    redFlagsLabel: "SEÑALES DE ALERTA:",
    correct: "¡Correcto!",
    notQuite: "Casi",

    securityQuiz: "Quiz de seguridad",
    questionOf: (n, total) => `Pregunta ${n} de ${total}`,
    previous: "Anterior",
    next: "Siguiente",
  },
  HI: {
    home: "होम",
    chooseYourChallenge: "अपनी चुनौती चुनें",
    chooseSubtitle: "इंटरएक्टिव लर्निंग से साइबर सुरक्षा सीखें",
    play: "खेलें",
    spamDetector: "स्पैम डिटेक्टर",
    spamSubtitle: "स्पैम के लिए फाइल/टेक्स्ट का विश्लेषण करें",
    uploadFile: "फाइल/स्क्रीनशॉट अपलोड करें",
    pasteText: "टेक्स्ट पेस्ट करें",
    analyze: "विश्लेषण करें",

    redFlagHunter: "Soch Secure",
    spotTheScam: "स्कैम पहचानें",
    spotTheScamHelp: "मैसेज में जो भी संदिग्ध लगे उस पर क्लिक करें।",
    step1Title: "स्टेप 1: संदिग्ध चीज़ें देखें",
    step1Desc: "मैसेज पढ़ें और संदिग्ध टेक्स्ट पर क्लिक करें।",
    overallProgress: "प्रगति",
    totalScore: "कुल स्कोर",
    streak: "स्ट्रीक",
    attempts: "प्रयास",
    emailMessage: "ईमेल संदेश",
    scenario: "परिदृश्य",
    suspicious: "संदिग्ध",
    subject: "विषय:",
    from: "प्रेषक:",
    hintTitle: "हिंट",
    showHint: "हिंट दिखाएँ",
    hideHint: "हिंट छुपाएँ",
    submitAnswer: "उत्तर सबमिट करें",
    tryAgain: "फिर से कोशिश",
    nextScenario: "अगला परिदृश्य",
    detectedRedFlags: "पाए गए रेड फ़्लैग",
    noRedFlagsYet: "अभी कोई रेड फ़्लैग नहीं मिला",
    clickSuspicious: "मैसेज के संदिग्ध हिस्सों पर क्लिक करें",
    goodEffort: "अच्छी कोशिश!",
    youFound: (found, total) => `आपने ${total} में से ${found} रेड फ़्लैग पाए।`,
    youMissed: "आपने मिस किया:",
    aiSafetyAssistant: "AI सुरक्षा सहायक",
    smartProtectionTips: "स्मार्ट सुरक्षा टिप्स",
    whatToLookFor: "क्या देखें:",
    proTip: "प्रो टिप",

    spotTheDifference: "अंतर पहचानें",
    compareInstruction: "दोनों संदेशों की तुलना करें और जिस पर आपको स्कैम लगे उस पर क्लिक करें",
    scoreLabel: "स्कोर",
    legitimateSigns: "वैध संकेत:",
    redFlagsLabel: "रेड फ्लैग्स:",
    correct: "सही!",
    notQuite: "पूरी तरह नहीं",

    securityQuiz: "सिक्योरिटी क्विज़",
    questionOf: (n, total) => `प्रश्न ${n} / ${total}`,
    previous: "पिछला",
    next: "अगला",
    sochSecureDesc: "फ़िशिंग संदेशों में संदिग्ध हिस्सों पर क्लिक करें",
    securityQuizDesc: "मल्टीपल-चॉइस प्रश्नों से अपनी जानकारी जांचें",
    spotDifferenceDesc: "वैध और स्कैम संदेशों की साथ में तुलना करें",
    scamSimulator: "स्कैम सिम्युलेटर",
    scamSimulatorDesc: "AI स्कैमर से चैट करें और देखें क्या आप धोखे से बच सकते हैं",
    startSimulation: "सिम्युलेशन शुरू करें",
    assistantInfo: "इंटरएक्टिव गेम्स से साइबर खतरों से बचाव सीखें",
    securityAssistant: "सिक्योरिटी असिस्टेंट",
    spamPastePlaceholder: "अपना संदेश, ईमेल या SMS सामग्री यहां पेस्ट करें...",
    confidenceLabel: "विश्वसनीयता",
  },
  FR: {
    home: "Accueil",
    chooseYourChallenge: "Choisissez votre défi",
    chooseSubtitle: "Maîtrisez la cybersécurité par l’apprentissage interactif",
    play: "Jouer",
    spamDetector: "Détecteur de spam",
    spamSubtitle: "Téléversez un fichier ou du texte à analyser",
    uploadFile: "Téléverser fichier/capture",
    pasteText: "Coller le texte",
    analyze: "Analyser",

    redFlagHunter: "Soch Secure",
    spotTheScam: "Repère l’arnaque",
    spotTheScamHelp: "Clique sur tout ce qui paraît suspect dans le message.",
    step1Title: "Étape 1 : repérer les éléments suspects",
    step1Desc: "Lis le message et clique sur le texte suspect.",
    overallProgress: "Progression",
    totalScore: "Score total",
    streak: "Série",
    attempts: "Essais",
    emailMessage: "Email",
    scenario: "Scénario",
    suspicious: "Suspect",
    subject: "Objet :",
    from: "De :",
    hintTitle: "Indice",
    showHint: "Afficher l’indice",
    hideHint: "Masquer l’indice",
    submitAnswer: "Valider",
    tryAgain: "Réessayer",
    nextScenario: "Scénario suivant",
    detectedRedFlags: "Alertes détectées",
    noRedFlagsYet: "Aucune alerte détectée",
    clickSuspicious: "Clique sur les parties suspectes du message",
    goodEffort: "Bien joué !",
    youFound: (found, total) => `Tu as trouvé ${found} sur ${total} alertes.`,
    youMissed: "Tu as manqué :",
    aiSafetyAssistant: "Assistant sécurité IA",
    smartProtectionTips: "Conseils de protection",
    whatToLookFor: "À surveiller :",
    proTip: "Astuce",

    spotTheDifference: "Repère la différence",
    compareInstruction: "Compare les deux messages et clique sur celui qui est une ARNAQUE",
    scoreLabel: "Score",
    legitimateSigns: "SIGNES LÉGITIMES :",
    redFlagsLabel: "SIGNES D’ALERTE :",
    correct: "Correct !",
    notQuite: "Pas tout à fait",

    securityQuiz: "Quiz de sécurité",
    questionOf: (n, total) => `Question ${n} sur ${total}`,
    previous: "Précédent",
    next: "Suivant",
  },
  AR: {
    home: "الرئيسية",
    chooseYourChallenge: "اختر تحدّيك",
    chooseSubtitle: "تعلّم مهارات الأمن السيبراني بطريقة تفاعلية",
    play: "ابدأ",
    spamDetector: "كاشف الرسائل المزعجة",
    spamSubtitle: "ارفع ملفًا أو ألصق نصًا لتحليله",
    uploadFile: "رفع ملف/لقطة",
    pasteText: "لصق النص",
    analyze: "تحليل",

    redFlagHunter: "Soch Secure",
    spotTheScam: "اكشف الاحتيال",
    spotTheScamHelp: "انقر على أي شيء يبدو مشبوهاً في الرسالة.",
    step1Title: "الخطوة 1: ابحث عن عناصر مشبوهة",
    step1Desc: "اقرأ الرسالة وانقر على النص المشبوه.",
    overallProgress: "التقدم",
    totalScore: "إجمالي النقاط",
    streak: "سلسلة",
    attempts: "محاولات",
    emailMessage: "رسالة بريد",
    scenario: "السيناريو",
    suspicious: "مشبوه",
    subject: "الموضوع:",
    from: "من:",
    hintTitle: "تلميح",
    showHint: "إظهار التلميح",
    hideHint: "إخفاء التلميح",
    submitAnswer: "إرسال الإجابة",
    tryAgain: "حاول مرة أخرى",
    nextScenario: "السيناريو التالي",
    detectedRedFlags: "العلامات المكتشفة",
    noRedFlagsYet: "لم يتم اكتشاف علامات بعد",
    clickSuspicious: "انقر على الأجزاء المشبوهة من الرسالة",
    goodEffort: "محاولة جيدة!",
    youFound: (found, total) => `وجدت ${found} من أصل ${total}.`,
    youMissed: "فاتك:",
    aiSafetyAssistant: "مساعد السلامة بالذكاء",
    smartProtectionTips: "نصائح حماية",
    whatToLookFor: "ما الذي تبحث عنه:",
    proTip: "نصيحة",

    spotTheDifference: "اكتشف الفرق",
    compareInstruction: "قارن بين الرسالتين وانقر على التي تعتقد أنها احتيال",
    scoreLabel: "النتيجة",
    legitimateSigns: "إشارات شرعية:",
    redFlagsLabel: "علامات حمراء:",
    correct: "صحيح!",
    notQuite: "ليس تمامًا",

    securityQuiz: "اختبار الأمان",
    questionOf: (n, total) => `السؤال ${n} من ${total}`,
    previous: "السابق",
    next: "التالي",
  },
};

// Dedicated Marathi layer (not Hindi fallback)
I18N.MR = {
  ...I18N.HI,
  home: "मुख्यपृष्ठ",
  chooseYourChallenge: "तुमचे आव्हान निवडा",
  chooseSubtitle: "परस्परसंवादी शिक्षणातून सायबर सुरक्षा कौशल्ये आत्मसात करा",
  play: "खेळा",
  spamDetector: "स्पॅम शोधक",
  spamSubtitle: "स्पॅम विश्लेषणासाठी फाइल किंवा मजकूर तपासा",
  uploadFile: "फाइल/स्क्रीनशॉट अपलोड करा",
  pasteText: "मजकूर पेस्ट करा",
  analyze: "विश्लेषण करा",
  redFlagHunter: "Soch Secure",
  spotTheScam: "फसवणूक ओळखा",
  spotTheScamHelp: "खालील संदेशात संशयास्पद भागांवर क्लिक करा.",
  step1Title: "पायरी 1: संशयास्पद गोष्टी शोधा",
  step1Desc: "संदेश वाचा आणि संशयास्पद मजकुरावर क्लिक करा.",
  overallProgress: "एकूण प्रगती",
  totalScore: "एकूण गुण",
  streak: "सलग यश",
  attempts: "प्रयत्न",
  emailMessage: "ईमेल संदेश",
  subject: "विषय:",
  from: "पाठवणारा:",
  hintTitle: "सूचना",
  showHint: "सूचना दाखवा",
  hideHint: "सूचना लपवा",
  scenario: "परिस्थिती",
  suspicious: "संशयास्पद",
  submitAnswer: "उत्तर सबमिट करा",
  tryAgain: "पुन्हा प्रयत्न करा",
  nextScenario: "पुढील परिस्थिती",
  detectedRedFlags: "आढळलेले रेड फ्लॅग्स",
  noRedFlagsYet: "अजून रेड फ्लॅग्स आढळले नाहीत",
  clickSuspicious: "संदेशातील संशयास्पद भागांवर क्लिक करा",
  goodEffort: "छान प्रयत्न!",
  youFound: (found, total) => `तुम्ही ${total} पैकी ${found} रेड फ्लॅग्स शोधले.`,
  youMissed: "हे चुकले:",
  aiSafetyAssistant: "AI सुरक्षा सहाय्यक",
  smartProtectionTips: "स्मार्ट सुरक्षा टिप्स",
  whatToLookFor: "काय लक्षात घ्यावे:",
  proTip: "प्रो टिप",
  notQuite: "जवळपास बरोबर",
  securityQuiz: "सुरक्षा प्रश्नमंजुषा",
  questionOf: (n, total) => `प्रश्न ${n} पैकी ${total}`,
  previous: "मागील",
  next: "पुढे",
  compareInstruction: "दोन्ही संदेश तुलना करा आणि जो फसवणुकीचा वाटतो त्यावर क्लिक करा",
  sochSecureDesc: "फिशिंग संदेशांतील संशयास्पद भागांवर क्लिक करा",
  securityQuizDesc: "बहुपर्यायी प्रश्नांद्वारे तुमचे ज्ञान तपासा",
  spotDifferenceDesc: "खरे आणि फसवे संदेश एकत्र तुलना करा",
  scamSimulator: "स्कॅम सिम्युलेटर",
  scamSimulatorDesc: "AI स्कॅमरशी चॅट करा आणि फसवणूक टाळता येते का ते पाहा",
  startSimulation: "सिम्युलेशन सुरू करा",
  assistantInfo: "इंटरॅक्टिव्ह गेम्समधून सायबर धोक्यांपासून स्वतःचे संरक्षण शिकून घ्या",
  securityAssistant: "सुरक्षा सहाय्यक",
  spamPastePlaceholder: "तुमचा संदेश, ईमेल किंवा SMS मजकूर येथे पेस्ट करा...",
  confidenceLabel: "विश्वास स्तर",
};

function LanguageModal({ open, lang, onClose, onSelect }) {
  if (!open) return null;

  const options = [
    { code: "US", lang: "EN", name: "English", native: "English", sub: "For English speakers" },
    { code: "ES", lang: "ES", name: "Español", native: "Spanish", sub: "Para hispanohablantes" },
    { code: "IN", lang: "HI", name: "हिन्दी", native: "Hindi", sub: "हिन्दी भाषियों के लिए" },
    { code: "MH", lang: "MR", name: "मराठी", native: "Marathi", sub: "मराठी भाषिकांसाठी" },
    { code: "FR", lang: "FR", name: "Français", native: "French", sub: "Pour les francophones" },
    { code: "SA", lang: "AR", name: "العربية", native: "Arabic", sub: "للناطقين بالعربية" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close language modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0B1630]/90 to-[#070F25]/90 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
        >
          ×
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
            <Globe size={18} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-emerald-300">Choose Your Language</p>
            <p className="text-sm text-white/55">Select your preferred language</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {options.map((o) => {
            const active = o.lang === lang;
            return (
              <button
                key={o.lang}
                onClick={() => {
                  onSelect(o.lang);
                  onClose();
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-sky-500/30 bg-gradient-to-r from-sky-500/20 to-indigo-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/8"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 text-sm font-extrabold text-white/70">{o.code}</div>
                    <div>
                      <p className="text-sm font-extrabold text-white/90">
                        {o.name} <span className="ml-1 text-xs font-semibold text-white/45">({o.native})</span>
                      </p>
                      <p className="text-xs text-white/45">{o.sub}</p>
                    </div>
                  </div>
                  {active && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-sky-200">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3 text-xs text-white/70">
          Choosing a language updates the app, typography, listen-aloud voice, and Google&apos;s in-page translator
          (where available) so more of the site matches your choice.
        </div>
      </div>
    </div>
  );
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("UI render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

function SafeSpline() {
  const [mountSpline, setMountSpline] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Delay heavy 3D mount slightly to avoid first paint instability.
    const id = window.setTimeout(() => setMountSpline(true), 50);
    return () => window.clearTimeout(id);
  }, []);

  if (!mountSpline) {
    return <div className="h-full w-full bg-gradient-to-br from-cyan-100/40 via-blue-100/30 to-emerald-100/40 dark:from-cyan-900/10 dark:via-blue-900/10 dark:to-emerald-900/10" />;
  }

  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-3xl border border-cyan-300/30 bg-white/60 px-6 py-5 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/30">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/15">
              <Shield size={22} />
            </div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">Loading mascot…</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">If 3D fails to load, you’ll still see this helper.</p>
            <div className="mt-4 h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" />
            </div>
          </div>
        </div>
      )}
      <Spline
        scene={MASCOT_SCENE}
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

function tone(isWrong) {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return;
  const ctx = new window.AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  o.type = "square";
  o.frequency.value = isWrong ? 170 : 620;
  g.gain.value = 0.1;
  o.start();
  o.stop(ctx.currentTime + 0.13);
}

function TooltipBubble({ label, children }) {
  if (!label) return <>{children}</>;
  return (
    <span className="group relative inline-flex items-baseline">
      <span className="cursor-help">{children}</span>
      <span className="pointer-events-none absolute left-1/2 top-full z-50 hidden w-[260px] -translate-x-1/2 translate-y-2 rounded-2xl border border-slate-200/70 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xl shadow-slate-900/10 group-hover:block group-focus-within:block dark:border-white/10 dark:bg-slate-950 dark:text-white/90">
        {label}
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-950" />
      </span>
    </span>
  );
}

function Header({ dark, setDark, onOpenLanguage, sessionUser }) {
  const navigate = useNavigate();
  const welcomeName = displayNameForWelcome(sessionUser);

  const logout = () => {
    try {
      localStorage.removeItem("gp_token");
      localStorage.removeItem("gp_user");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("suraksha-auth-change"));
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-300/40 bg-white/80 px-4 py-3 backdrop-blur ui-glass dark:border-slate-700/70 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 p-2 text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]">
            <Shield size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">Suraksha Setu</p>
            <p className="text-sm text-blue-500">Digital Safety Training</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {sessionUser && welcomeName ? (
            <span className="inline-flex max-w-[min(260px,42vw)] flex-wrap items-baseline gap-x-1 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:max-w-[min(320px,50vw)] sm:text-sm">
              <span className="shrink-0 text-slate-600 dark:text-slate-300">Welcome,</span>
              <span className="min-w-0 max-w-full break-words font-bold text-slate-800 dark:text-white">{welcomeName}</span>
            </span>
          ) : null}
          {sessionUser ? (
            <button
              type="button"
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          ) : null}
          <button
            onClick={() => setDark((v) => !v)}
            className="rounded-2xl border border-slate-200 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={onOpenLanguage}
            className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            title="Change language"
          >
            <Languages size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

function HunterTopBar({ dark, onToggleDark, onOpenLanguage, onToggleHint, hintVisible, t }) {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-5">
      <button
        type="button"
        onClick={() => window.history.back()}
        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold backdrop-blur transition ${
          dark ? "border-white/10 bg-white/5 text-white/90 hover:bg-white/10" : "border-slate-200/70 bg-white/70 text-slate-800 hover:bg-white"
        }`}
      >
        ← Back
      </button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/10">
          <Shield size={18} />
        </div>
        <p className={`text-lg font-extrabold ${dark ? "text-white/90" : "text-slate-900"}`}>
          {t.redFlagHunter} <span className="ml-1 text-amber-300">★</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDark}
          className={`rounded-xl border p-2 ${
            dark ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10" : "border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white"
          }`}
          title="Theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className={`rounded-xl border p-2 ${dark ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10" : "border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white"}`} title="Text">
          <span className="text-sm font-black">T</span>
        </button>
        <button className={`rounded-xl border p-2 ${dark ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10" : "border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white"}`} title="Sound">
          <span className="text-sm font-black">♪</span>
        </button>
        <button
          onClick={onOpenLanguage}
          className={`rounded-xl border p-2 hover:bg-emerald-500/15 ${
            dark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800"
          }`}
          title="Change language"
        >
          <Languages size={16} />
        </button>
        <button
          onClick={onToggleHint}
          className={`rounded-xl border p-2 hover:bg-amber-500/15 ${
            dark ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-amber-500/30 bg-amber-500/10 text-amber-800"
          }`}
          title={hintVisible ? t.hideHint : t.showHint}
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}

function HomePage({ t }) {
  const cards = [
    {
      icon: Shield,
      title: t.redFlagHunter,
      desc: t.sochSecureDesc,
      to: "/hunter",
      color: "from-cyan-500 to-blue-600",
      button: "bg-gradient-to-r from-sky-500 to-blue-600",
    },
    {
      icon: Brain,
      title: t.securityQuiz,
      desc: t.securityQuizDesc,
      to: "/quiz",
      color: "from-fuchsia-500 to-pink-600",
      button: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: t.spotTheDifference,
      desc: t.spotDifferenceDesc,
      to: "/compare",
      color: "from-emerald-500 to-green-600",
      button: "bg-gradient-to-r from-emerald-500 to-green-600",
    },
  ];
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async () => {
    try {
      const res = await axios.post(`${API}/analyze`, { text });
      setResult(res.data);
    } catch (err) {
      console.error("Analyze request failed:", err);
      setResult({
        label: "Unable to analyze right now",
        confidence: 0,
        reasons: ["Server is unavailable. Please retry in a moment."],
      });
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
        >
          ← {t.backHome || "Back"}
        </button>
      </div>
      <section className="ui-card ui-glass relative overflow-hidden rounded-[28px] border border-sky-200/70 bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100/80 p-6 text-center shadow-[0_30px_90px_rgba(56,189,248,0.20)] dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -right-24 -bottom-20 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl animate-pulse" style={{ animationDelay: "900ms" }} />
        <div className="pointer-events-none absolute left-1/2 top-20 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-300/25 blur-2xl animate-pulse" style={{ animationDelay: "500ms" }} />
        <div className="mx-auto mb-3 flex w-fit items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-[0_14px_38px_rgba(37,99,235,0.25)]">
            <Shield size={18} />
          </span>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle size={18} />
          </span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-300 dark:to-indigo-300">
            {t.chooseYourChallenge}
          </span>
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-xl text-slate-600 dark:text-white/70">{t.chooseSubtitle}</p>

        <div className="mascot-3d ui-card relative mt-5 flex h-72 items-center justify-center overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-100 via-cyan-100/90 to-blue-100 ui-shimmer shadow-[0_25px_70px_rgba(14,165,233,0.18)] dark:border-white/10 dark:from-white/5 dark:via-white/3 dark:to-white/5 md:h-80">
          <AppErrorBoundary fallback={<div className="h-full w-full bg-gradient-to-br from-cyan-100/40 via-blue-100/30 to-emerald-100/40 dark:from-cyan-900/10 dark:via-blue-900/10 dark:to-emerald-900/10" />}>
            <div className="absolute inset-0 hidden opacity-80 md:block">
              <SafeSpline />
            </div>
          </AppErrorBoundary>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(56,189,248,0.34),transparent_58%)] dark:bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.12),transparent_55%)]" />
          <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-sky-300/35 blur-2xl animate-pulse" />
          <div className="absolute -right-10 bottom-10 h-44 w-44 rounded-full bg-indigo-300/30 blur-2xl animate-pulse" style={{ animationDelay: "700ms" }} />
          <img
            src={MascotPng}
            alt="Suraksha Setu mascot"
            className="mascot-float absolute left-1/2 top-[10%] z-10 h-[96%] w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_34px_90px_rgba(2,132,199,0.30)]"
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="ui-card ui-glass group rounded-3xl border border-slate-200/60 bg-white/70 p-5 transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(2,6,23,0.10)] dark:border-white/10 dark:bg-white/5"
          >
            <div className={`mb-4 w-fit rounded-2xl bg-gradient-to-r ${c.color} p-3 text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)]`}>
              <c.icon />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{c.title}</h3>
            <p className="mt-2 text-base text-slate-600 dark:text-white/70">{c.desc}</p>
            <button className={`mt-4 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition group-hover:brightness-110 ${c.button}`}>
              {t.play}
            </button>
          </Link>
        ))}
      </section>

      <section className="mt-7 rounded-3xl border border-orange-300/45 bg-orange-50/70 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-[0_18px_55px_rgba(244,63,94,0.20)]">
            🤖
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-slate-900">{t.scamSimulator}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">{t.scamSimulatorDesc}</p>
            <div className="mt-4">
              <Link
                to="/scam-simulator"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-500/20 hover:brightness-110"
              >
                ⚡ {t.startSimulation}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-sky-200 bg-sky-50/70 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/15 text-sky-700">
              <Shield size={18} />
            </div>
            <p className="text-sm font-semibold text-slate-700">{t.assistantInfo}</p>
          </div>
          <Link
            to="/security-assistant"
            className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110"
            aria-label={t.securityAssistant}
            title={t.securityAssistant}
          >
            💬
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-amber-300/50 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-slate-900/70">
        <h2 className="mb-1 flex items-center gap-2 text-3xl font-bold"><Upload className="text-orange-500" /> {t.spamDetector}</h2>
        <p className="mb-4 text-lg text-slate-600 dark:text-slate-300">{t.spamSubtitle}</p>
        <p className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.pasteText}</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.spamPastePlaceholder} className="h-44 w-full rounded-2xl border border-slate-300 bg-white p-3 text-lg dark:border-slate-700 dark:bg-slate-800" />
        <button onClick={analyze} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 px-4 py-3 text-xl font-semibold text-white">{t.analyze}</button>
        {result && (
          <div className="mt-4 rounded-xl border p-3">
            <p className="text-lg font-bold">{result.label}</p>
            <p>{t.confidenceLabel}: {result.confidence}%</p>
            <ul className="list-disc pl-6">{(result.reasons || []).map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        )}
      </section>
    </main>
  );
}

function HunterPage({ dark, setDark, lang, onOpenLanguage }) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [clickedWordKeys, setClickedWordKeys] = useState([]);
  const [wrongWordKeys, setWrongWordKeys] = useState([]);
  const [hintVisible, setHintVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    recordGameScore({ hunterBest: totalScore });
  }, [totalScore]);

  const scenario = hunterScenarios[scenarioIdx];
  const totalScenarios = hunterScenarios.length;
  const t = useMemo(() => I18N[lang] ?? I18N.EN, [lang]);

  const correctIds = useMemo(() => scenario.redFlags.map((f) => f.id), [scenario]);
  const detected = useMemo(() => scenario.redFlags.filter((f) => selectedIds.includes(f.id)), [scenario, selectedIds]);
  const missed = useMemo(() => scenario.redFlags.filter((f) => !selectedIds.includes(f.id)), [scenario, selectedIds]);

  const onToggleDark = () => setDark((v) => !v);

  const normalizeToken = (s) => s.toLowerCase().replace(/[^a-z0-9@._-]+/gi, "").trim();
  const glossary = useMemo(() => {
    const en = {
      phishing: "A scam message that tries to steal secrets like OTP/password via fake links.",
      scam: "A trick to steal your money or private information.",
      spam: "Unwanted or risky messages sent in bulk; sometimes used for scams.",
      suspicious: "Looks unsafe or unusual (fake links, unknown sender, urgent pressure).",
      fraud: "Deception used to steal money or information.",
      otp: "One-Time Password: never share it with anyone.",
      pin: "A secret number used to authorize payments. Never share it.",
      password: "A secret used to access your account. Never share it in messages.",
      urgent: "Trying to rush you to act without thinking.",
      verify: "Check using the official app/website, not message links.",
      identity: "Your personal details used to prove who you are (name, ID, etc.).",
      url: "A web address/link (example.com/page). Fake URLs are common in scams.",
      link: "A clickable web address. Scammers use links to take you to fake pages.",
      domain: "Website name part of a link/email (example.com).",
      sender: "The email address/number that sent the message.",
      suspended: "Temporarily disabled/blocked. Scammers threaten this to pressure you.",
      permanently: "Forever. Scammers use extreme threats to scare you.",
      malware: "Harmful software that can steal data or damage your device.",
    };
    const hi = {
      phishing: "फिशिंग: नकली लिंक/मैसेज से OTP/पासवर्ड चुराने की कोशिश।",
      scam: "स्कैम: धोखे से पैसे/जानकारी चुराने की कोशिश।",
      spam: "स्पैम: अनचाहे/जोखिम वाले मैसेज; कई बार स्कैम के लिए।",
      suspicious: "संदिग्ध: असुरक्षित/असामान्य चीज़ (फेक लिंक, दबाव)।",
      fraud: "धोखाधड़ी: धोखे से पैसे/जानकारी चुराना।",
      otp: "OTP: एक बार उपयोग वाला कोड—कभी शेयर न करें।",
      pin: "PIN: भुगतान के लिए सीक्रेट नंबर—कभी शेयर न करें।",
      password: "पासवर्ड: अकाउंट का सीक्रेट—कभी शेयर न करें।",
      urgent: "जल्दी करने का दबाव ताकि आप सोचें बिना क्लिक करें।",
      verify: "ऑफिशियल ऐप/वेबसाइट से जांचना।",
      identity: "पहचान: आपकी व्यक्तिगत जानकारी (नाम/ID आदि)।",
      url: "URL: वेबसाइट लिंक/पता। फेक URL स्कैम में आम है।",
      link: "लिंक: जिस पर क्लिक करके वेबसाइट खुलती है।",
      domain: "डोमेन: वेबसाइट नाम (example.com)।",
      sender: "प्रेषक: भेजने वाला ईमेल/नंबर।",
      suspended: "सस्पेंड: अस्थायी रूप से बंद/ब्लॉक।",
      permanently: "स्थायी रूप से (हमेशा के लिए)।",
      malware: "मैलवेयर: हानिकारक सॉफ्टवेयर जो डेटा चुरा सकता है।",
    };
    const pick = (key) => (lang === "HI" ? hi[key] : en[key]);
    return {
      regex:
        /\b(phishing|scam|spam|suspicious|fraud|otp|pin|password|urgent|verify|identity|url|link|domain|sender|suspended|permanently|malware)\b/gi,
      get: pick,
    };
  }, [lang]);

  const withTooltips = (text, keyPrefix) => {
    const s = String(text ?? "");
    const parts = s.split(glossary.regex);
    if (parts.length === 1) return s;
    const terms = [
      "phishing",
      "scam",
      "spam",
      "suspicious",
      "fraud",
      "otp",
      "pin",
      "password",
      "urgent",
      "verify",
      "identity",
      "url",
      "link",
      "domain",
      "sender",
      "suspended",
      "permanently",
      "malware",
    ];
    return parts.filter((p) => p !== "").map((p, idx) => {
      const lower = p.toLowerCase();
      if (!terms.includes(lower)) return <span key={`${keyPrefix}-${idx}`}>{p}</span>;
      return (
        <TooltipBubble key={`${keyPrefix}-${idx}`} label={glossary.get(lower)}>
          {p}
        </TooltipBubble>
      );
    });
  };

  const redFlagWordMap = useMemo(() => {
    return scenario.redFlags.reduce((acc, f) => {
      const words = String(f.highlight || "")
        .split(/\s+/)
        .map((w) => normalizeToken(w))
        .filter(Boolean);
      acc[f.id] = words;
      return acc;
    }, {});
  }, [scenario]);

  const toggleFlag = (id) => {
    setSubmitted(false);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onWordClick = (word, key) => {
    setSubmitted(false);
    setClickedWordKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

    const normalized = normalizeToken(word);
    if (!normalized) return;
    const matches = scenario.redFlags
      .filter((f) => (redFlagWordMap[f.id] || []).includes(normalized))
      .map((f) => f.id);
    if (matches.length === 0) return;
    setSelectedIds((prev) => {
      const set = new Set(prev);
      matches.forEach((id) => set.add(id));
      return Array.from(set);
    });
  };

  const renderClickableLine = (line, lineKey) =>
    line.split(/(\s+)/).map((chunk, cIdx) => {
      if (!chunk.trim()) return <span key={`${lineKey}-${cIdx}`}>{chunk}</span>;
      const key = `${lineKey}-${cIdx}`;
      const active = clickedWordKeys.includes(key);
      const wrong = wrongWordKeys.includes(key);
      const activeCls = dark
        ? "bg-blue-600/50 text-blue-50 ring-1 ring-blue-300/60"
        : "bg-blue-700/24 text-blue-900 ring-1 ring-blue-700/45";
      const wrongCls = dark
        ? "bg-rose-700/38 text-rose-50 ring-1 ring-rose-300/55"
        : "bg-rose-700/20 text-rose-900 ring-1 ring-rose-700/42";
      const idleCls = dark ? "text-white/85 hover:bg-white/10" : "text-slate-800 hover:bg-slate-900/8";
      return (
        <button
          key={key}
          onClick={() => {
            onWordClick(chunk, key);
            const normalized = normalizeToken(chunk);
            const isCorrectWord = scenario.redFlags.some((f) =>
              (redFlagWordMap[f.id] || []).includes(normalized),
            );
            setWrongWordKeys((prev) => {
              const has = prev.includes(key);
              if (isCorrectWord) return has ? prev.filter((k) => k !== key) : prev;
              if (has) return prev.filter((k) => k !== key);
              return [...prev, key];
            });
          }}
          className={`rounded px-1 py-0.5 font-medium transition ${
            wrong ? wrongCls : active ? activeCls : idleCls
          }`}
        >
          {(() => {
            const norm = normalizeToken(chunk);
            const term =
              norm.match(/^(phishing|scam|spam|suspicious|fraud|otp|pin|password|urgent|verify|identity|url|link|domain|sender|suspended|permanently|malware)$/i)?.[1]?.toLowerCase();
            return term ? <TooltipBubble label={glossary.get(term)}>{chunk}</TooltipBubble> : chunk;
          })()}
        </button>
      );
    });

  const tryAgain = () => {
    setSelectedIds([]);
    setClickedWordKeys([]);
    setWrongWordKeys([]);
    setSubmitted(false);
  };

  const submit = () => {
    const roundFound = detected.length;
    const roundTotal = scenario.redFlags.length;
    const isPerfect = roundFound === roundTotal;

    setSubmitted(true);
    setAttempts((a) => a + 1);
    setTotalScore((s) => s + roundFound);
    setStreak((s) => (isPerfect ? s + 1 : 0));
  };

  const nextScenario = () => {
    setScenarioIdx((v) => (v + 1) % totalScenarios);
    setSelectedIds([]);
    setClickedWordKeys([]);
    setWrongWordKeys([]);
    setHintVisible(false);
    setSubmitted(false);
  };

  return (
    <div
      className={`${
        dark
          ? "hunter-space-bg"
          : "hunter-light-bg bg-gradient-to-b from-sky-50 via-blue-50/40 to-white"
      } min-h-screen pb-10`}
    >
      <HunterTopBar
        dark={dark}
        onToggleDark={onToggleDark}
        onOpenLanguage={onOpenLanguage}
        onToggleHint={() => setHintVisible((v) => !v)}
        hintVisible={hintVisible}
        t={t}
      />

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        <div className="text-center">
          <h1 className={`text-6xl font-extrabold tracking-tight ${dark ? "text-sky-400" : "text-sky-700"}`}>{t.spotTheScam}</h1>
          <p className={`mt-2 text-lg ${dark ? "text-white/70" : "text-slate-800"}`}>{t.spotTheScamHelp}</p>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/10 to-sky-500/10 p-[1px] shadow-[0_10px_60px_rgba(59,130,246,0.10)]">
          <div className={`rounded-3xl px-5 py-4 backdrop-blur ${dark ? "bg-[#0B1630]/70" : "bg-white/70 border border-slate-200/60"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-white/5 text-white/80" : "bg-slate-900/5 text-slate-700"}`}>
                  <Eye size={18} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${dark ? "text-white/85" : "text-slate-900"}`}>{t.step1Title}</p>
                  <p className={`text-sm ${dark ? "text-white/60" : "text-slate-600"}`}>{withTooltips(t.step1Desc, "h-desc")}</p>
                  <ul className={`mt-2 list-disc pl-4 text-xs font-medium ${dark ? "text-white/70" : "text-slate-700"}`}>
                    <li>{withTooltips("Read from subject to signature and click words/phrases you think are suspicious.", "h-li1")}</li>
                    <li>{withTooltips("Look for urgent pressure, fake links/URLs, unknown sender clues, and OTP/PIN/password requests.", "h-li2")}</li>
                    <li>{withTooltips("After selecting, click Submit Answer to check; missed correct flags appear in the detected list.", "h-li3")}</li>
                  </ul>
                </div>
              </div>
              <button className={`rounded-xl px-3 py-2 text-xs font-semibold ${dark ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-slate-900/5 text-slate-600 hover:bg-slate-900/10"}`}>×</button>
            </div>
          </div>
        </div>

        <div className={`mt-6 rounded-3xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-slate-200/60 bg-white/70"}`}>
          <div className="flex items-center justify-between gap-4">
            <p className={`text-sm font-semibold ${dark ? "text-white/70" : "text-slate-600"}`}>{t.overallProgress}</p>
            <p className={`text-sm font-semibold ${dark ? "text-sky-300" : "text-sky-600"}`}>
              {scenarioIdx + 1} / {totalScenarios}
            </p>
          </div>
          <div className={`mt-3 h-2 w-full rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`}>
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
              style={{ width: `${Math.round(((scenarioIdx + 1) / totalScenarios) * 100)}%` }}
            />
          </div>

        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-[1px]">
          <div className={`rounded-3xl p-5 ${dark ? "bg-[#0B1630]/60" : "bg-white/70 border border-slate-200/60"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-white/85">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${dark ? "bg-white/5 text-white/80" : "bg-slate-900/5 text-slate-700"}`}>
                    <span className="text-sm">✉</span>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${dark ? "text-white/85" : "text-slate-900"}`}>{t.emailMessage}</p>
                    <p className={`text-xs ${dark ? "text-white/50" : "text-slate-500"}`}>{t.scenario} {scenarioIdx + 1}</p>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                dark ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : "border-rose-500/25 bg-rose-500/10 text-rose-700"
              }`}>
                <AlertTriangle size={14} />
                {t.suspicious}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className={`text-xs font-semibold ${dark ? "text-white/45" : "text-slate-500"}`}>{t.subject}</p>
                <p className={`text-sm font-semibold ${dark ? "text-white/85" : "text-slate-900"}`}>
                  {renderClickableLine(scenario.subject, `${scenario.id}-subject`)}
                </p>
              </div>
              <div>
                <p className={`text-xs font-semibold ${dark ? "text-white/45" : "text-slate-500"}`}>{t.from}</p>
                <p className={`text-sm font-semibold ${dark ? "text-white/85" : "text-slate-900"}`}>
                  {renderClickableLine(scenario.from, `${scenario.id}-from`)}
                </p>
              </div>
              <div className={`h-px w-full ${dark ? "bg-white/10" : "bg-slate-200"}`} />

              <div className={`text-[1.05rem] leading-8 ${dark ? "text-white/80" : "text-slate-800"}`}>
                {scenario.body.split("\n").map((line, idx) => (
                  <p key={`${scenario.id}-${idx}`} className="mb-3 last:mb-0">
                    {renderClickableLine(line, `${scenario.id}-body-${idx}`)}
                  </p>
                ))}
              </div>
            </div>

            {hintVisible && (
              <div className={`mt-5 rounded-2xl border p-4 text-sm ${
                dark ? "border-amber-500/20 bg-amber-500/10 text-amber-100/90" : "border-amber-300/50 bg-amber-100/70 text-amber-900"
              }`}>
                <p className="mb-1 font-bold">
                  <span className="mr-2">💡</span>{t.hintTitle}
                </p>
                <p className={`${dark ? "text-amber-100/80" : "text-amber-900/80"}`}>{scenario.hint}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setHintVisible((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold ${
                  dark
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
                    : "border-amber-300/50 bg-amber-100/70 text-amber-900 hover:bg-amber-100"
                }`}
              >
                <span>✨</span>
                {hintVisible ? t.hideHint : t.showHint}
              </button>
              <button
                onClick={submit}
                disabled={selectedIds.length === 0}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold shadow-lg transition ${
                  selectedIds.length === 0
                    ? "cursor-not-allowed bg-sky-500/20 text-white/40"
                    : "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/20 hover:brightness-110"
                }`}
              >
                <Trophy size={16} />
                {t.submitAnswer}
              </button>
              <button
                onClick={tryAgain}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold ${
                  dark ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10" : "border-slate-200/60 bg-white/70 text-slate-800 hover:bg-white"
                }`}
              >
                {t.tryAgain}
              </button>
              {submitted && (
                <button
                  onClick={nextScenario}
                  className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110"
                >
                  {t.nextScenario} <span>→</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`mt-6 rounded-3xl border p-5 ${dark ? "border-white/10 bg-white/5" : "border-slate-200/60 bg-white/70"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-rose-500/10 text-rose-200" : "bg-rose-500/10 text-rose-700"}`}>
                <span className="text-lg">🚩</span>
              </div>
              <div>
                <p className={`text-sm font-extrabold ${dark ? "text-white/85" : "text-slate-900"}`}>{t.detectedRedFlags}</p>
                <p className={`text-xs ${dark ? "text-white/50" : "text-slate-500"}`}>
                  {detected.length} / {scenario.redFlags.length} found
                </p>
              </div>
            </div>
          </div>

          {!submitted && detected.length === 0 ? (
            <div className={`mt-4 rounded-2xl border p-6 text-center ${
              dark ? "border-white/10 bg-white/5" : "border-slate-200/60 bg-slate-50"
            }`}>
              <AlertTriangle className={`mx-auto mb-2 ${dark ? "text-white/30" : "text-slate-400"}`} />
              <p className={`text-sm font-semibold ${dark ? "text-white/50" : "text-slate-600"}`}>{t.noRedFlagsYet}</p>
              <p className={`text-xs ${dark ? "text-white/35" : "text-slate-500"}`}>{withTooltips(t.clickSuspicious, "h-click")}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {(submitted ? scenario.redFlags : detected).map((f) => {
                const found = selectedIds.includes(f.id);
                return (
                <button
                  key={f.id}
                  onClick={() => (!submitted ? toggleFlag(f.id) : undefined)}
                  className={`w-full rounded-2xl border p-4 text-left text-sm font-semibold ${
                    found
                      ? dark
                        ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-100"
                        : "border-cyan-500/25 bg-cyan-500/10 text-cyan-800"
                      : dark
                        ? "border-rose-500/25 bg-rose-500/10 text-rose-100"
                        : "border-rose-500/25 bg-rose-500/10 text-rose-700"
                  }`}
                >
                  {withTooltips(f.label, `flag-${f.id}`)}
                  <span className={`ml-2 text-xs font-normal ${dark ? "text-cyan-100/70" : "text-cyan-800/70"}`}>“{f.highlight}”</span>
                  {submitted && !found ? (
                    <span className={`ml-2 text-xs font-bold ${dark ? "text-rose-100/80" : "text-rose-700/85"}`}>
                      (Correct answer)
                    </span>
                  ) : null}
                </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={`rounded-3xl border p-5 ${dark ? "border-white/10 bg-gradient-to-br from-sky-500/15 to-indigo-500/5" : "border-slate-200/60 bg-gradient-to-br from-sky-500/10 to-indigo-500/5"}`}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-sky-500/15 text-sky-200" : "bg-sky-500/15 text-sky-700"}`}>
              <Trophy size={18} />
            </div>
            <p className={`text-4xl font-extrabold ${dark ? "text-white" : "text-slate-900"}`}>{totalScore}</p>
            <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-slate-600"}`}>{t.totalScore}</p>
          </div>
          <div className={`rounded-3xl border p-5 ${dark ? "border-white/10 bg-gradient-to-br from-amber-500/15 to-rose-500/5" : "border-slate-200/60 bg-gradient-to-br from-amber-500/10 to-rose-500/5"}`}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-amber-500/15 text-amber-200" : "bg-amber-500/15 text-amber-700"}`}>
              <Flame size={18} />
            </div>
            <p className={`text-4xl font-extrabold ${dark ? "text-white" : "text-slate-900"}`}>{streak}</p>
            <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-slate-600"}`}>{t.streak}</p>
          </div>
          <div className={`rounded-3xl border p-5 ${dark ? "border-white/10 bg-gradient-to-br from-emerald-500/15 to-cyan-500/5" : "border-slate-200/60 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5"}`}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-emerald-500/15 text-emerald-200" : "bg-emerald-500/15 text-emerald-700"}`}>
              <Shield size={18} />
            </div>
            <p className={`text-4xl font-extrabold ${dark ? "text-white" : "text-slate-900"}`}>{attempts}</p>
            <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-slate-600"}`}>{t.attempts}</p>
          </div>
        </div>

        {submitted && (
          <div className="mt-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-[1px]">
            <div className={`rounded-3xl p-5 ${dark ? "bg-[#0B1630]/60" : "bg-white/70 border border-amber-300/40"}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-amber-500/15 text-amber-200" : "bg-amber-500/15 text-amber-700"}`}>
                  <Trophy size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-extrabold ${dark ? "text-amber-200" : "text-amber-800"}`}>
                    {detected.length === scenario.redFlags.length ? "Excellent good job" : t.goodEffort}
                  </p>
                  <p className={`mt-1 text-sm ${dark ? "text-white/65" : "text-slate-700"}`}>
                    {t.youFound(detected.length, scenario.redFlags.length)}
                  </p>
                  {missed.length > 0 && (
                    <div className="mt-3">
                      <p className={`text-sm font-bold ${dark ? "text-white/75" : "text-slate-800"}`}>{t.youMissed}</p>
                      <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${dark ? "text-white/65" : "text-slate-700"}`}>
                        {missed.map((m) => (
                          <li key={m.id}>{m.label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/10 to-sky-500/10 p-[1px]">
          <div className={`rounded-3xl p-5 ${dark ? "bg-[#0B1630]/60" : "bg-white/70 border border-slate-200/60"}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-fuchsia-500/15 text-fuchsia-200" : "bg-fuchsia-500/15 text-fuchsia-700"}`}>
                <span className="text-lg">✨</span>
              </div>
              <div>
                <p className={`text-sm font-extrabold ${dark ? "text-white/85" : "text-slate-900"}`}>{t.aiSafetyAssistant}</p>
                <p className={`text-xs ${dark ? "text-white/50" : "text-slate-500"}`}>{t.smartProtectionTips}</p>
              </div>
            </div>

            <div className={`mt-4 rounded-2xl border p-4 ${dark ? "border-white/10 bg-white/5" : "border-slate-200/60 bg-slate-50"}`}>
              <p className={`flex items-center gap-2 text-sm font-bold ${dark ? "text-white/80" : "text-slate-800"}`}>
                <Shield size={16} className="text-cyan-300" />
                {t.whatToLookFor}
              </p>
              <ul className={`mt-3 list-disc space-y-1 pl-5 text-sm ${dark ? "text-white/65" : "text-slate-700"}`}>
                <li>Misspelled URLs or domains</li>
                <li>Urgent or threatening language</li>
                <li>Requests for passwords or OTPs</li>
                <li>Unknown or suspicious senders</li>
                <li>Emotional pressure tactics</li>
              </ul>
            </div>

            <div className={`mt-4 rounded-2xl border p-4 ${dark ? "border-amber-500/20 bg-amber-500/10" : "border-amber-300/50 bg-amber-100/70"}`}>
              <p className={`flex items-center gap-2 text-sm font-bold ${dark ? "text-amber-100" : "text-amber-900"}`}>
                <AlertTriangle size={16} />
                {t.proTip}
              </p>
              <p className={`mt-2 text-sm ${dark ? "text-amber-100/80" : "text-amber-900/80"}`}>
                When in doubt, contact the organization directly using their official website or phone number. Never use
                contact information from a suspicious message.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuizPage({ t, lang }) {
  const bank = useMemo(() => QUIZ_BANK[lang] ?? QUIZ_BANK.EN, [lang]);
  const total = bank.length;
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const item = bank[i];
  const quizFinishRecorded = useRef(false);

  useEffect(() => {
    if (total === 0) return;
    if (i !== total - 1 || picked === null) return;
    if (quizFinishRecorded.current) return;
    quizFinishRecorded.current = true;
    recordGameScore({
      quizBest: score,
      quizLast: score,
      quizTotalQs: total,
      quizAt: new Date().toISOString(),
    });
  }, [i, picked, score, total]);
  const questionVisuals = useMemo(
    () => [
      { icon: AlertTriangle, emoji: "🎣", title: "Phishing Alert", sub: "Look for urgency and pressure cues", grad: "from-rose-500/20 via-fuchsia-500/15 to-orange-400/15", iconBg: "bg-rose-500/15 text-rose-600", img: QuizThumb1 },
      { icon: Shield, emoji: "🔐", title: "Keep Secrets Safe", sub: "Never share OTP, PIN, or passwords", grad: "from-emerald-500/20 via-teal-500/15 to-cyan-400/15", iconBg: "bg-emerald-500/15 text-emerald-600", img: QuizThumb2 },
      { icon: Globe, emoji: "🌐", title: "URL Check", sub: "Spot fake spellings and risky domains", grad: "from-blue-500/20 via-cyan-500/15 to-indigo-400/15", iconBg: "bg-blue-500/15 text-blue-600", img: QuizThumb3 },
      { icon: CheckCircle2, emoji: "✅", title: "Verify First", sub: "Use official app or website directly", grad: "from-violet-500/20 via-fuchsia-500/15 to-pink-400/15", iconBg: "bg-violet-500/15 text-violet-600", img: QuizThumb4 },
      { icon: Eye, emoji: "🕵️", title: "Sender Check", sub: "Inspect full sender address carefully", grad: "from-amber-500/20 via-orange-500/15 to-rose-400/15", iconBg: "bg-amber-500/15 text-amber-600", img: QuizThumb5 },
      { icon: AlertTriangle, emoji: "🚨", title: "Safe Response", sub: "Report, ignore, and verify independently", grad: "from-pink-500/20 via-rose-500/15 to-red-400/15", iconBg: "bg-pink-500/15 text-pink-600", img: QuizThumb6 },
      { icon: Globe, emoji: "🔗", title: "Link Safety", sub: "Short links can hide dangerous destinations", grad: "from-sky-500/20 via-blue-500/15 to-cyan-400/15", iconBg: "bg-sky-500/15 text-sky-600", img: QuizThumb7 },
      { icon: Brain, emoji: "🧠", title: "Scam Pattern", sub: "Sensitive data requests are major red flags", grad: "from-indigo-500/20 via-violet-500/15 to-fuchsia-400/15", iconBg: "bg-indigo-500/15 text-indigo-600", img: QuizThumb8 },
    ],
    [],
  );
  const v = questionVisuals[i % questionVisuals.length];
  const VisualIcon = v.icon;
  const glossary = useMemo(() => {
    const en = {
      phishing: "A scam message that tricks you into clicking a fake link or sharing secrets (OTP/password).",
      suspicious: "Something that looks unsafe or unusual (fake links, urgent pressure, unknown sender).",
      fraud: "A crime where someone deceives you to steal money or information.",
      otp: "One-Time Password: a code used once to confirm login/payment. Never share it.",
      password: "A secret used to access your account. Never share it in messages.",
      urgent: "Trying to rush you so you act without thinking.",
      verify: "To check if something is real using the official app/website—not message links.",
      domain: "The website name part of a link/email (example.com).",
      sender: "The email address or number that sent the message.",
    };
    const hi = {
      phishing: "फिशिंग: नकली मैसेज/लिंक से OTP/पासवर्ड चुराने की कोशिश।",
      suspicious: "संदिग्ध: जो असुरक्षित/असामान्य लगे (फेक लिंक, जल्दी करने का दबाव)।",
      fraud: "धोखाधड़ी: धोखे से पैसे/जानकारी चुराना।",
      otp: "OTP: एक बार उपयोग होने वाला कोड—कभी शेयर न करें।",
      password: "पासवर्ड: अकाउंट का सीक्रेट—कभी शेयर न करें।",
      urgent: "जल्दी/डर दिखाकर तुरंत क्लिक करवाना।",
      verify: "सत्यापित करना: ऑफिशियल ऐप/वेबसाइट से जांचना।",
      domain: "डोमेन: वेबसाइट नाम (example.com)।",
      sender: "प्रेषक: भेजने वाला ईमेल/नंबर।",
    };
    const pick = (key) => (lang === "HI" ? hi[key] : en[key]);
    return {
      regex: /\b(phishing|suspicious|fraud|otp|password|urgent|verify|domain|sender)\b/gi,
      get: pick,
    };
  }, [lang]);

  const withTooltips = (text, keyPrefix) => {
    const s = String(text ?? "");
    const parts = s.split(glossary.regex);
    if (parts.length === 1) return s;
    return parts.filter((p) => p !== "").map((p, idx) => {
      const lower = p.toLowerCase();
      const isTerm = ["phishing", "suspicious", "fraud", "otp", "password", "urgent", "verify", "domain", "sender"].includes(lower);
      if (!isTerm) return <span key={`${keyPrefix}-${idx}`}>{p}</span>;
      return (
        <TooltipBubble key={`${keyPrefix}-${idx}`} label={glossary.get(lower)}>
          {p}
        </TooltipBubble>
      );
    });
  };

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === item.correct) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 130,
        spread: 90,
        startVelocity: 42,
        scalar: 0.9,
        origin: { y: 0.62 },
      });
      tone(false);
    } else {
      tone(true);
    }
  };

  const next = () => {
    setPicked(null);
    setI((v) => Math.min(v + 1, total - 1));
  };

  const prev = () => {
    setPicked(null);
    setI((v) => Math.max(v - 1, 0));
  };

  const progress = total > 1 ? (i / (total - 1)) * 100 : 0;
  const correctPick = picked !== null ? picked === item.correct : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-100"
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Brain className="text-fuchsia-500" />
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.securityQuiz}</h2>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400">{t.questionOf(i + 1, total)}</p>
        </div>
        <div className="w-[56px]" />
      </div>

      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mb-5 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="text-emerald-600 dark:text-emerald-200" size={20} />
          <p className="text-base font-semibold text-slate-800 dark:text-white/85">
            {t.scoreLabel}: {score} / {Math.max(i, 0)}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className={`mb-5 rounded-2xl border border-white/40 bg-gradient-to-r ${v.grad} p-4`}>
          <div className="flex items-center gap-4">
            <img
              src={v.img}
              alt={v.title}
              className="h-28 w-44 rounded-xl border border-white/50 object-cover shadow-sm"
            />
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${v.iconBg}`}>
              <VisualIcon size={22} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">{v.title} {v.emoji}</p>
              <p className="text-sm text-slate-700 dark:text-white/75">{v.sub}</p>
            </div>
          </div>
        </div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{withTooltips(item.q, `q-${i}`)}</p>
        <div className="mt-5 space-y-3">
          {item.a.map((opt, idx) => {
            const isPicked = picked === idx;
            const isCorrect = idx === item.correct;
            const state =
              picked === null
                ? "border-slate-200 hover:border-slate-300 dark:border-white/10"
                : isPicked && isCorrect
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                  : isPicked && !isCorrect
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                    : "border-slate-200/70 opacity-70 dark:border-white/10";

            return (
              <button
                key={`${i}-${idx}-${opt}`}
                onClick={() => choose(idx)}
                className={`block w-full rounded-2xl border px-5 py-4 text-left text-base font-semibold text-slate-900 transition dark:text-white ${state}`}
              >
                {withTooltips(opt, `opt-${i}-${idx}`)}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className={`mt-5 rounded-2xl border px-4 py-4 ${correctPick ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"} dark:border-white/10 dark:bg-white/5`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {correctPick ? <CheckCircle2 className="text-emerald-600" /> : <AlertTriangle className="text-rose-600" />}
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">{correctPick ? t.correct : t.notQuite}</p>
                <p className="mt-1 text-base text-slate-700 dark:text-white/70">{withTooltips(item.explain, `ex-${i}`)}</p>
                {!correctPick ? (
                  <p className="mt-2 text-base font-bold text-emerald-700 dark:text-emerald-300">
                    Correct answer: {item.a[item.correct]}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={i === 0}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
              i === 0
                ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/30"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            }`}
          >
            ← {t.previous}
          </button>
          <button
            onClick={next}
            disabled={picked === null || i === total - 1}
            className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg ${
              picked === null || i === total - 1
                ? "cursor-not-allowed bg-fuchsia-500/30"
                : "bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:brightness-110"
            }`}
          >
            {t.next} →
          </button>
        </div>
      </div>
    </main>
  );
}

function ComparePage({ t }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null); // "left" | "right"
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    recordGameScore({ compareBest: score, compareAnswered: answered });
  }, [score, answered]);

  const scenarios = useMemo(
    () => [
      {
        id: "c1",
        legit: {
          from: "support@amazon.com",
          subject: "Your Order #123-4567890-1234567 has shipped",
          body:
            "Hello [Your Name],\n\nYour order has shipped and will arrive by April 12, 2026.\n\nTracking number: 1Z999AA10123456784\n\nView order details in your account.\n\nBest regards,\nAmazon Customer Service",
          signs: ["Official domain", "Personalized greeting", "Real order number", "No urgent pressure"],
        },
        scam: {
          from: "security@amaz0n-verify.tk",
          subject: "URGENT: Verify Your Account NOW!",
          body:
            "Dear Customer,\n\nYour Amazon account will be SUSPENDED in 24 hours unless you verify immediately!\n\nClick here: http://amaz0n-secure.tk/verify\n\nEnter your password and credit card details to prevent account closure.\n\nAmazon Security",
          flags: ["Fake domain (.tk)", "Generic greeting", "Urgent threat", "Requests sensitive info", "Suspicious URL"],
          highlights: [
            "security@amaz0n-verify.tk",
            "URGENT",
            "SUSPENDED",
            "24 hours",
            "verify immediately",
            "http://amaz0n-secure.tk/verify",
            "password",
            "credit card",
            "account closure",
          ],
          explanation:
            "The scam uses urgent language, fake domains with misspellings (0 instead of o), and requests sensitive information. Legitimate companies never ask for passwords via email.",
        },
        scamOn: "right",
      },
      {
        id: "c2",
        legit: {
          from: "Bank of America <alerts@bankofamerica.com>",
          subject: "Transaction Alert: $150.00",
          body:
            "A transaction of $150.00 was made on your account ending in 1234.\n\nDate: April 9, 2026\nMerchant: Target Store #2345\n\nIf you don't recognize this, log into your account or call the number on the back of your card.\n\nDo not reply to this email.",
          signs: ["Legitimate domain", "Specific details", "Clear instructions", "No links or requests"],
        },
        scam: {
          from: "Bank Security <no-reply@bank-secure.ml>",
          subject: "FRAUD ALERT: Respond Immediately!",
          body:
            "URGENT! Suspicious activity detected on your account!\n\nUnauthorized transaction of $2,450.00 detected.\n\nCLICK HERE to verify: http://bank-verify-now.ml\n\nReply YES with your PIN and card number to block this transaction.\n\nYou have 2 hours to respond!",
          flags: ["Suspicious domain (.ml)", "Creates panic", "Fake URL", "Requests PIN/card", "Time pressure"],
          highlights: [
            "bank-secure.ml",
            "FRAUD ALERT",
            "URGENT",
            "$2,450.00",
            "CLICK HERE",
            "http://bank-verify-now.ml",
            "Reply YES",
            "PIN",
            "card number",
            "2 hours",
          ],
          explanation:
            "Real banks NEVER ask for PINs, passwords, or full card numbers via email or text. They provide official contact methods and don't use urgent threats.",
        },
        scamOn: "right",
      },
      {
        id: "c3",
        legit: {
          from: "Netflix <info@netflix.com>",
          subject: "Your subscription was renewed",
          body:
            "Hi,\n\nYour Netflix subscription has been renewed successfully.\n\nTo manage billing, visit netflix.com/account.\n\nThanks,\nNetflix",
          signs: ["Official domain", "No shortened links", "No urgent pressure", "No sensitive requests"],
        },
        scam: {
          from: "Netflix Billing <billing@netflix-renewal.support>",
          subject: "Payment Failed: Update Now",
          body:
            "Dear user,\n\nYour payment failed. Update your card now to avoid account cancellation.\n\nUpdate: http://netflix-renewal.support/pay\n\nEnter your card and password to continue.\n\nNetflix Billing",
          flags: ["Unusual domain", "Threatening cancellation", "Suspicious URL", "Generic greeting", "Asks for password"],
          highlights: [
            "billing@netflix-renewal.support",
            "Payment Failed",
            "Update Now",
            "avoid account cancellation",
            "http://netflix-renewal.support/pay",
            "card",
            "password",
            "Dear user",
          ],
          explanation:
            "Scams often use non-official domains and threaten cancellation. Legit services direct you to their official website and never ask for your password by email.",
        },
        scamOn: "right",
      },
    ],
    [],
  );

  const s = scenarios[i];
  const isCorrectPick = useMemo(() => {
    if (!picked) return null;
    return picked === s.scamOn;
  }, [picked, s]);

  const pick = (side) => {
    if (picked) return;
    setPicked(side);
    setAnswered((v) => v + 1);
    if (side === s.scamOn) {
      setScore((v) => v + 1);
      confetti({
        particleCount: 120,
        spread: 85,
        startVelocity: 40,
        scalar: 0.95,
        origin: { y: 0.62 },
      });
    }
  };

  const next = () => {
    setPicked(null);
    setI((v) => (v + 1) % scenarios.length);
  };

  return (
    <ComparePageView
      scenariosCount={scenarios.length}
      scenarioIndex={i}
      score={score}
      answered={answered}
      scenario={s}
      picked={picked}
      isCorrectPick={isCorrectPick}
      onPick={pick}
      onNext={next}
      t={t}
    />
  );
}

function ComparePageView({ scenariosCount, scenarioIndex, score, answered, scenario, picked, isCorrectPick, onPick, onNext, t }) {
  const isDark = document.documentElement.classList.contains("dark");

  const left = scenario.scamOn === "left" ? scenario.scam : scenario.legit;
  const right = scenario.scamOn === "right" ? scenario.scam : scenario.legit;
  const leftKind = scenario.scamOn === "left" ? "scam" : "legit";
  const rightKind = scenario.scamOn === "right" ? "scam" : "legit";

  const cardBase =
    "rounded-3xl border p-6 text-left shadow-sm transition";
  const cardLight = "border-slate-200/70 bg-white";
  const cardDark = "border-white/10 bg-white/5 text-white";

  const bannerBase = "rounded-3xl border px-6 py-5 text-center";
  const bannerInstructionLight = "border-blue-200/70 bg-gradient-to-r from-cyan-50 via-blue-50 to-fuchsia-50";
  const bannerInstructionDark = "border-white/10 bg-white/5 text-white/85";
  const bannerScoreLight = "border-emerald-200/70 bg-emerald-50";
  const bannerScoreDark = "border-emerald-500/20 bg-emerald-500/10 text-white/85";
  const scamSide = scenario.scamOn === "left" ? "Left" : "Right";
  const legitSide = scenario.scamOn === "left" ? "Right" : "Left";
  const pickedSide = picked ? (picked === "left" ? "Left" : "Right") : null;

  const selectedFrame = (side, kind) => {
    if (!picked) return "";
    const pickedThis = picked === side;
    if (!pickedThis) return "opacity-95";
    if (kind === "scam") return "ring-2 ring-rose-500/70 border-rose-500/60 bg-rose-500/10";
    return "ring-2 ring-emerald-500/60 border-emerald-500/60 bg-emerald-500/10";
  };

  const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlightParts = (text, tokens) => {
    const uniq = Array.from(new Set((tokens || []).filter(Boolean))).sort((a, b) => b.length - a.length);
    if (uniq.length === 0) return [text];
    const re = new RegExp(`(${uniq.map(escapeRegExp).join("|")})`, "gi");
    return String(text).split(re).filter(Boolean);
  };
  const ScamHighlight = ({ children }) => (
    <span
      className={`rounded px-1 py-0.5 font-semibold ${
        isDark
          ? "bg-rose-600/45 text-rose-50 ring-1 ring-rose-300/55"
          : "bg-rose-600/22 text-rose-900 ring-1 ring-rose-600/45"
      }`}
    >
      {children}
    </span>
  );

  return (
    <main className={`mx-auto max-w-6xl px-4 py-8 ${isDark ? "" : "rounded-[28px] bg-gradient-to-b from-cyan-50/70 via-indigo-50/40 to-fuchsia-50/30 shadow-[0_30px_80px_rgba(59,130,246,0.10)]"}`}>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold ${
            isDark ? "border-white/10 bg-white/5 text-white/90 hover:bg-white/10" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          }`}
        >
          ← Back
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className={`${isDark ? "text-emerald-200" : "text-emerald-600"}`}>⚖</span>
            <h2 className={`text-2xl font-extrabold ${isDark ? "text-white/90" : "text-slate-900"}`}>{t.spotTheDifference}</h2>
          </div>
          <p className={`text-sm ${isDark ? "text-white/55" : "text-slate-500"}`}>
            {t.scenario} {scenarioIndex + 1} of {scenariosCount}
          </p>
        </div>

        <div className="w-[90px]" />
      </div>

      <div className={`mb-4 ${bannerBase} ${isDark ? bannerInstructionDark : bannerInstructionLight}`}>
        <div className="mb-2 flex justify-center">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? "bg-white/5 text-white/80" : "bg-white text-blue-600 shadow-sm"}`}>
            <Eye size={18} />
          </div>
        </div>
        <p className={`${isDark ? "text-white/75" : "text-slate-700"}`}>
          <span className="mr-2">👁</span> {t.compareInstruction}
        </p>
      </div>

      <div className={`mb-6 rounded-3xl border px-6 py-5 ${isDark ? "border-white/10 bg-white/5" : "border-violet-200/60 bg-gradient-to-r from-violet-50 to-sky-50"}`}>
        <p className={`text-sm font-extrabold ${isDark ? "text-white/85" : "text-slate-900"}`}>How to play</p>
        <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-white/70" : "text-slate-700"}`}>
          <li>Read both messages carefully: sender, subject, links, and tone.</li>
          <li>Tap the card you think is the scam message.</li>
          <li>After choosing, check the red flags and legit signs to understand why.</li>
        </ul>
      </div>

      <div className={`mb-6 ${bannerBase} ${isDark ? bannerScoreDark : bannerScoreLight}`}>
        <div className="flex items-center justify-center gap-2">
          <Trophy className={`${isDark ? "text-emerald-200" : "text-emerald-600"}`} size={18} />
          <p className={`${isDark ? "text-white/85" : "text-slate-800"}`}>
            {t.scoreLabel}: {score} / {answered}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <button
          onClick={() => onPick("left")}
          className={[
            cardBase,
            isDark ? cardDark : `${cardLight} bg-gradient-to-b from-white to-sky-50/60`,
            picked ? "" : "hover:-translate-y-0.5 hover:shadow-md",
            selectedFrame("left", leftKind),
          ].join(" ")}
        >
          {picked ? (
            <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${leftKind === "scam" ? "bg-rose-500/15 text-rose-700" : "bg-emerald-500/15 text-emerald-700"}`}>
              {leftKind === "scam" ? "Spam message" : "Legitimate message"}
            </div>
          ) : null}
          <div className="mb-4">
            <p className={`${isDark ? "text-white/50" : "text-slate-500"} text-xs font-semibold`}>From:</p>
            <p className={`${isDark ? "text-white/90" : "text-slate-900"} text-sm font-semibold`}>
              {picked && leftKind === "scam"
                ? highlightParts(left.from, scenario.scam.highlights).map((p, idx) => {
                    const hit = scenario.scam.highlights?.some((h) => String(h).toLowerCase() === String(p).toLowerCase());
                    return hit ? <ScamHighlight key={`lfh-${idx}`}>{p}</ScamHighlight> : <span key={`lfh-${idx}`}>{p}</span>;
                  })
                : left.from}
            </p>
          </div>
          <div className="mb-4">
            <p className={`${isDark ? "text-white/50" : "text-slate-500"} text-xs font-semibold`}>Subject:</p>
            <p className={`${isDark ? "text-white/90" : "text-slate-900"} text-sm font-semibold`}>
              {picked && leftKind === "scam"
                ? highlightParts(left.subject, scenario.scam.highlights).map((p, idx) => {
                    const hit = scenario.scam.highlights?.some((h) => String(h).toLowerCase() === String(p).toLowerCase());
                    return hit ? <ScamHighlight key={`lsh-${idx}`}>{p}</ScamHighlight> : <span key={`lsh-${idx}`}>{p}</span>;
                  })
                : left.subject}
            </p>
          </div>
          <div className={`${isDark ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200/60"} rounded-2xl border p-4 text-sm leading-relaxed`}>
            {left.body.split("\n").map((line, idx) => (
              <p key={`l-${scenario.id}-${idx}`} className="mb-3 last:mb-0">
                {picked && leftKind === "scam"
                  ? highlightParts(line, scenario.scam.highlights).map((p, pIdx) => {
                      const hit = scenario.scam.highlights?.some((h) => String(h).toLowerCase() === String(p).toLowerCase());
                      return hit ? <ScamHighlight key={`lbh-${idx}-${pIdx}`}>{p}</ScamHighlight> : <span key={`lbh-${idx}-${pIdx}`}>{p}</span>;
                    })
                  : line}
              </p>
            ))}
          </div>

          {picked && leftKind === "legit" && (
            <div className="mt-5 text-left">
              <p className={`text-xs font-bold ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>✓ {t.legitimateSigns}</p>
              <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${isDark ? "text-white/70" : "text-slate-600"}`}>
                {scenario.legit.signs.map((x) => (
                  <li key={`ls-${x}`}>{x}</li>
                ))}
              </ul>
            </div>
          )}

          {picked && leftKind === "scam" && (
            <div className="mt-5 text-left">
              <p className={`text-xs font-bold ${isDark ? "text-amber-200" : "text-amber-700"}`}>⚠ {t.redFlagsLabel}</p>
              <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${isDark ? "text-white/70" : "text-slate-600"}`}>
                {scenario.scam.flags.map((x) => (
                  <li key={`lf-${x}`}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </button>

        <button
          onClick={() => onPick("right")}
          className={[
            cardBase,
            isDark ? cardDark : `${cardLight} bg-gradient-to-b from-white to-fuchsia-50/45`,
            picked ? "" : "hover:-translate-y-0.5 hover:shadow-md",
            selectedFrame("right", rightKind),
          ].join(" ")}
        >
          {picked ? (
            <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${rightKind === "scam" ? "bg-rose-500/15 text-rose-700" : "bg-emerald-500/15 text-emerald-700"}`}>
              {rightKind === "scam" ? "Spam message" : "Legitimate message"}
            </div>
          ) : null}
          <div className="mb-4">
            <p className={`${isDark ? "text-white/50" : "text-slate-500"} text-xs font-semibold`}>From:</p>
            <p className={`${isDark ? "text-white/90" : "text-slate-900"} text-sm font-semibold`}>
              {picked && rightKind === "scam"
                ? highlightParts(right.from, scenario.scam.highlights).map((p, idx) => {
                    const hit = scenario.scam.highlights?.some((h) => String(h).toLowerCase() === String(p).toLowerCase());
                    return hit ? <ScamHighlight key={`rfh-${idx}`}>{p}</ScamHighlight> : <span key={`rfh-${idx}`}>{p}</span>;
                  })
                : right.from}
            </p>
          </div>
          <div className="mb-4">
            <p className={`${isDark ? "text-white/50" : "text-slate-500"} text-xs font-semibold`}>Subject:</p>
            <p className={`${isDark ? "text-white/90" : "text-slate-900"} text-sm font-semibold`}>
              {picked && rightKind === "scam"
                ? highlightParts(right.subject, scenario.scam.highlights).map((p, idx) => {
                    const hit = scenario.scam.highlights?.some((h) => String(h).toLowerCase() === String(p).toLowerCase());
                    return hit ? <ScamHighlight key={`rsh-${idx}`}>{p}</ScamHighlight> : <span key={`rsh-${idx}`}>{p}</span>;
                  })
                : right.subject}
            </p>
          </div>
          <div className={`${isDark ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200/60"} rounded-2xl border p-4 text-sm leading-relaxed`}>
            {right.body.split("\n").map((line, idx) => (
              <p key={`r-${scenario.id}-${idx}`} className="mb-3 last:mb-0">
                {picked && rightKind === "scam"
                  ? highlightParts(line, scenario.scam.highlights).map((p, pIdx) => {
                      const hit = scenario.scam.highlights?.some((h) => String(h).toLowerCase() === String(p).toLowerCase());
                      return hit ? <ScamHighlight key={`rbh-${idx}-${pIdx}`}>{p}</ScamHighlight> : <span key={`rbh-${idx}-${pIdx}`}>{p}</span>;
                    })
                  : line}
              </p>
            ))}
          </div>

          {picked && rightKind === "legit" && (
            <div className="mt-5 text-left">
              <p className={`text-xs font-bold ${isDark ? "text-emerald-200" : "text-emerald-700"}`}>✓ {t.legitimateSigns}</p>
              <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${isDark ? "text-white/70" : "text-slate-600"}`}>
                {scenario.legit.signs.map((x) => (
                  <li key={`rs-${x}`}>{x}</li>
                ))}
              </ul>
            </div>
          )}

          {picked && rightKind === "scam" && (
            <div className="mt-5 text-left">
              <p className={`text-xs font-bold ${isDark ? "text-amber-200" : "text-amber-700"}`}>⚠ {t.redFlagsLabel}</p>
              <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${isDark ? "text-white/70" : "text-slate-600"}`}>
                {scenario.scam.flags.map((x) => (
                  <li key={`rf-${x}`}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </button>
      </div>

      {picked && (
        <div className="mt-6">
          <div
            className={`rounded-2xl border px-5 py-4 ${
              isCorrectPick
                ? "border-emerald-300/70 bg-emerald-50 text-emerald-900"
                : "border-amber-300/70 bg-amber-50 text-amber-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isCorrectPick ? <CheckCircle2 className="text-emerald-600" /> : <AlertTriangle className="text-amber-600" />}
              </div>
              <div>
                <p className="text-sm font-extrabold">{isCorrectPick ? t.correct : t.notQuite}</p>
                <p className="mt-1 text-sm opacity-80">{scenario.scam.explanation}</p>
                <div className="mt-3 space-y-1 text-sm font-semibold">
                  <p>Your choice: {pickedSide}</p>
                  <p>Spam message: {scamSide}</p>
                  <p>Not spam (legitimate): {legitSide}</p>
                  {!isCorrectPick ? <p className="text-amber-700">Reason: You selected the legitimate side; the spam side contains the listed red flags.</p> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110"
            >
              {t.nextScenario} <span>→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState(() => {
    try {
      const s = localStorage.getItem("suraksha-lang");
      if (s && ["EN", "HI", "MR", "ES", "FR", "AR"].includes(s)) return s;
    } catch {
      /* ignore */
    }
    return "EN";
  });
  const [langOpen, setLangOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(() => {
    try {
      const raw = localStorage.getItem("gp_user");
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return null;
  });
  const location = useLocation();
  const isHunter = location.pathname.startsWith("/hunter");
  const isSetuConnect = location.pathname === "/setu-connect";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isLanding = location.pathname === "/";

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem("gp_token");
    if (!token) {
      setSessionUser(null);
      return;
    }
    try {
      const r = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (r.status === 401) {
        setSessionUser(null);
        try {
          localStorage.removeItem("gp_token");
          localStorage.removeItem("gp_user");
        } catch {
          /* ignore */
        }
        return;
      }
      if (!r.ok) return;
      const d = await r.json();
      if (d?.user) {
        setSessionUser(d.user);
        localStorage.setItem("gp_user", JSON.stringify(d.user));
      }
    } catch {
      /* offline or server down — keep sessionUser from gp_user in state/localStorage */
      try {
        const raw = localStorage.getItem("gp_user");
        if (raw) setSessionUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [location.pathname, refreshSession]);

  useEffect(() => {
    const onAuth = () => refreshSession();
    window.addEventListener("suraksha-auth-change", onAuth);
    return () => window.removeEventListener("suraksha-auth-change", onAuth);
  }, [refreshSession]);

  useEffect(() => {
    try {
      localStorage.setItem("suraksha-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    const htmlLang = { EN: "en", HI: "hi", MR: "mr", ES: "es", FR: "fr", AR: "ar" }[lang] || "en";
    document.documentElement.lang = htmlLang;
    document.documentElement.setAttribute("data-app-lang", lang);
    document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleTranslateScript()
      .then(() => {
        if (!cancelled) applyGoogleTranslateLanguage(lang);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    const open = () => setLangOpen(true);
    window.addEventListener("suraksha:open-language", open);
    return () => window.removeEventListener("suraksha:open-language", open);
  }, []);
  const t = useMemo(() => {
    if (lang === "MR") return I18N.HI;
    return I18N[lang] ?? I18N.EN;
  }, [lang]);
  const tLanding = useMemo(() => {
    const en = {
      brand: "SurakshaSetu",
      navHome: "Seekho Hub",
      navLearn: "Trick or Trap?",
      navPractice: "RakshaDesk?",
      navDetect: "Setu Connect",
      navSetuConnect: "Setu Connect",
      navLogin: "Login",
      badge1: "Train safe. Click smart.",
      heroTitle: "SurakshaSetu",
      heroSub:
        "Master digital skills while staying safe from cyber threats. Our elite cyber safety guidance protects you every step of the way.",
      badge2: "Awareness is your first line of defence.",
      ctaPrimary: "Choose Protection Now",
      ctaSecondary: "Explore Modules",
      tripleTitle: "Triple-Layer Defense",
      tripleSub:
        "Experience cutting-edge cyber security through immersive training scenarios. Your cyber safety team guides you through every challenge.",
      card1Title: "Seekho Hub",
      card1Text: "Learn safely inside controlled simulations. Build confidence with real-world tasks—without real-world risk.",
      card2Title: "Trick or Trap?",
      card2Text: "Spot phishing, scams, and malware patterns instantly with smart hints and AI-assisted checks.",
      card3Title: "RakshaDesk",
      card3Text: "Real-time verification and friendly reminders from cyber police.",
      startSimulation: "Start Simulation",
      ctaTrickTrap: "Open Red-Flag Lab →",
      ctaRakshaDesk: "Open RakshaDesk →",
      activeProtection: "Active Protection",
      metric1Value: "22.68L",
      metric1Label: "Complaints registered on cybercrime.gov.in (NCRP), India — 2024",
      metric2Value: "86,420",
      metric2Label: "Cybercrime cases registered in India (NCRB police records), 2023",
      metric3Value: "1,107",
      metric3Label: "Persons convicted in cybercrime cases (India), 2022",
      metricFootnote:
        "Sources: MHA / Lok Sabha & press citing NCRP totals (2024); NCRB Crime in India 2023; conviction totals from NCRB-based press reports. NCRP and NCRB measure different flows.",
      dangerTitle: "The Danger Zone",
      safeTitle: "The Protected Zone",
      footerAbout: "Empowering users with next-gen cyber safety training. Protected by trusted guidance available 24/7.",
      footerQuickLinks: "Quick Links",
      footerContact: "Contact",
      contactEmail: "support@surakshasetu.app",
      contactPhone: "1930",
      
    };
    const hi = {
      brand: "SurakshaSetu",
      navHome: "होम",
      navLearn: "सीखें",
      navPractice: "अभ्यास",
      navDetect: "जोखिम पहचानें",
      navSetuConnect: "Setu Connect",
      navLogin: "लॉगिन",
      badge1: "सुरक्षित सीखें, समझदारी से क्लिक करें।",
      heroTitle: "SurakshaSetu",
      heroSub:
        "डिजिटल कौशल सीखें और साइबर खतरों से सुरक्षित रहें। हमारी साइबर सुरक्षा गाइडेंस हर कदम पर आपकी रक्षा करती है।",
      badge2: "जागरूकता ही आपकी सबसे मजबूत सुरक्षा है।",
      ctaPrimary: "सुरक्षा चुनें",
      ctaSecondary: "मॉड्यूल देखें",
      tripleTitle: "तीन-स्तरीय सुरक्षा",
      tripleSub:
        "इमर्सिव प्रशिक्षण परिदृश्यों के जरिए आधुनिक साइबर सुरक्षा अनुभव करें। हर चुनौती में हमारा मार्गदर्शन साथ है।",
      card1Title: "Seekho Hub",
      card1Text: "कंट्रोल्ड सिमुलेशन्स में सुरक्षित अभ्यास करें। बिना जोखिम के आत्मविश्वास बढ़ाएँ।",
      card2Title: "Trick or Trap?",
      card2Text: "फ़िशिंग/स्कैम संकेत तुरंत पहचानें—स्मार्ट हिंट्स और AI चेक के साथ।",
      card3Title: "RakshaDesk",
      card3Text: "रीयल-टाइम वेरिफिकेशन और मददगार रिमाइंडर्स।",
      startSimulation: "सिमुलेशन शुरू करें",
      ctaTrickTrap: "रेड-फ़्लैग लैब खोलें →",
      ctaRakshaDesk: "रक्षा डेस्क खोलें →",
      activeProtection: "Active Protection",
      metric1Value: "22.68L",
      metric1Label: "cybercrime.gov.in पर दर्ज शिकायतें (NCRP), भारत — 2024",
      metric2Value: "86,420",
      metric2Label: "भारत में दर्ज साइबर अपराध मामले (NCRB / पुलिस), 2023",
      metric3Value: "1,107",
      metric3Label: "साइबर अपराधों में दोषसिद्ध व्यक्ति (भारत), 2022",
      metricFootnote:
        "स्रोत: MHA / लोकसभा व राष्ट्रीय प्रेस में NCRP आँकड़े; NCRB Crime in India 2023; दोषसिद्धि आँकड़े NCRB आधारित रिपोर्ट। NCRP व NCRB अलग प्रणालियाँ हैं।",
      dangerTitle: "खतरे का क्षेत्र",
      safeTitle: "सुरक्षित क्षेत्र",
      footerAbout: "नेक्स्ट-जेन साइबर सेफ्टी ट्रेनिंग के साथ सशक्त बनाएं। 24/7 विश्वसनीय गाइडेंस।",
      footerQuickLinks: "क्विक लिंक्स",
      footerContact: "संपर्क",
      contactEmail: "support@surakshasetu.app",
      contactPhone: "1930",
      
    };
    const mr = {
      ...hi,
      badge1: "सुरक्षित शिका, विचारपूर्वक क्लिक करा.",
      badge2: "जागृतीच आपली पहिली ढाल आहे.",
      ctaTrickTrap: "रेड-फ्लॅग लॅब उघडा →",
      ctaRakshaDesk: "रक्षा डेस्क उघडा →",
      navHome: "मुख्यपृष्ठ",
      navLearn: "शिका",
      navPractice: "सराव",
      navDetect: "जोखीम ओळखा",
      navSetuConnect: "Setu Connect",
      navLogin: "लॉगिन",
      card3Title: "RakshaDesk",
      heroSub: "डिजिटल कौशल्ये शिका आणि सायबर धोक्यांपासून सुरक्षित रहा. आमचे मार्गदर्शन प्रत्येक टप्प्यावर तुमची मदत करते.",
      tripleTitle: "त्रिस्तरीय संरक्षण",
      tripleSub: "इंटरॅक्टिव्ह प्रशिक्षणातून आधुनिक सायबर सुरक्षिततेचा अनुभव घ्या.",
    };
    const dict = lang === "HI" ? hi : lang === "MR" ? mr : en;
    return (k) => dict[k] ?? k;
  }, [lang]);
  const tFn = useMemo(() => {
    const en = {
      backHome: "Back",
      listening: "Listening",
      hubTitle: "Seekho Hub",
      hubSub: "Choose a safe simulation. You can take these steps at your own pace.",
      gsTitle: "UPI Password Setup",
      gsCardSub: "Practice creating a secure UPI PIN with step-by-step guidance.",
      kycTitle: "Digital ID/KYC Renewal",
      kycCardSub: "Learn the safe KYC renewal flow and how to spot scams.",
      continue: "Continue",
      startSetup: "Start Setup Process",
      upiIntroLine1: "In this interactive simulation, you will learn how to set up a secure UPI PIN step by step.",
      upiIntroLine2: "We will guide you through the process and teach you how to avoid common security mistakes.",
      upiLearnTitle: "What you'll learn:",
      upiLearn1: "How to create a strong, secure UPI PIN",
      upiLearn2: "Common PIN patterns to avoid (1234, 1111, etc.)",
      upiLearn3: "Real-time validation and security feedback",
      upiLearn4: "Best practices for mobile banking security",
      pinCreateTitle: "Create UPI PIN",
      pinCreateSub: "Choose a secure 4 or 6-digit PIN",
      showPin: "Show",
      hidePin: "Hide",
      pinClear: "Clear",
      pinBack: "Back",
      pinHintEnter: "Enter your PIN using the keypad below.",
      pinHintChoose4or6: "Choose a 4 or 6-digit PIN. Avoid easy patterns.",
      pinHintGood: "Looks good. This PIN is harder to guess.",
      pinHintWeakSeq: "Avoid sequences like 1234 or 4321. Choose random digits.",
      pinHintWeakRepeat: "Avoid repeated digits like 1111 or patterns like 1212.",
      pinHintBirthYear: "Avoid using birth years like 1990 or 2000.",
      pinStrong: "Strong PIN",
      pinWeak: "Weak PIN — choose a stronger one",
      pinConfirmMatch: "PINs match! Ready to complete setup.",
      pinConfirmNoMatch: "PINs don't match. Please try again.",
      pinErrLength: "Please enter exactly 4 or 6 digits to continue.",
      pinErrWeak: "This PIN is too easy to guess. Please choose a stronger PIN.",
      pinConfirmTitle: "Confirm UPI PIN",
      pinConfirmSub: "Re-enter your PIN to confirm",
      pinConfirmHint: "Re-enter the same PIN to confirm.",
      pinMissingHint: "Please create your PIN first.",
      pinErrLengthConfirm: "Please enter the full PIN to continue.",
      pinMismatch: "PINs do not match. Please try again.",
      pinsMatch: "PINs match! Ready to complete setup.",
      completeSetup: "Complete Setup",
      setupDoneTitle: "Setup Complete!",
      setupDoneSub: "Congratulations! You've successfully set up a secure UPI PIN.",
      takeawaysTitle: "Key Takeaways:",
      take1: "Never use sequential numbers like 1234 or 4321",
      take2: "Avoid repeated digits like 1111 or 2222",
      take3: "Don't use birth years or common patterns",
      take4: "Always keep your UPI PIN private and secure",
      kycIntroTitle: "Digital ID/KYC Renewal",
      kycIntroSub:
        "Learn the secure process of renewing your digital identity and KYC (Know Your Customer) documents. This simulation teaches you to identify legitimate requests and spot potential scams.",
      kycLearnTitle: "What you'll learn:",
      kycLearn1: "Proper KYC document submission process",
      kycLearn2: "How to verify legitimate renewal requests",
      kycLearn3: "Red flags that indicate potential fraud",
      kycLearn4: "Safe practices for sharing personal information",
      kycWarnTitle: "Security Reminder:",
      kycWarnText:
        "This is a simulated environment. Never share your real KYC documents or personal information unless you're on an official, verified government or banking website.",
      kycStartBtn: "Start KYC Renewal",
      kycTermsTitle: "Terms & Conditions",
      kycTermsSub: "Please read and accept before continuing.",
      kycTermsHeading: "Your privacy and safety",
      kycTermsBody:
        "This is a training simulation. Do not enter real Aadhaar, PAN, or bank details.\n\nWe keep this module on-device during your session (session storage) and do not require an account.\n\nDo not upload real documents. Use sample images only.\n\nIf you receive suspicious KYC calls or messages, do not share OTPs and contact your bank or cyber police.",
      kycTermsAccept: "I accept the Terms & Conditions and understand this is a simulation.",
      kycPersonalTitle: "Personal Information",
      kycPersonalSub: "Enter your basic details as per your ID document",
      kycPersonalHint: "You're in control. You can review and edit before continuing.",
      kycLblFullName: "Full Name",
      kycLblDob: "Date of Birth",
      kycLblGender: "Gender",
      kycGenderSelect: "Select",
      kycGenderFemale: "Female",
      kycGenderMale: "Male",
      kycGenderOther: "Other",
      kycGenderPreferNot: "Prefer not to say",
      kycLblEmail: "Email Address",
      kycLblPhone: "Phone Number",
      kycPhFullName: "Enter your full name",
      kycPhEmail: "your.email@example.com",
      kycPhPhone: "Enter 10-digit mobile number",
      kycPhAadhaar: "Enter 12-digit Aadhaar number",
      kycPhoneHelp: "For your privacy, we show only the last 4 digits while not focused. Tap the field to edit, or use the eye to keep digits visible.",
      kycLblAadhaar: "Aadhaar Number",
      kycAadhaarHelp: "Aadhaar must be 12 digits.",
      kycErrName: "Full name is required.",
      kycErrDob: "Please choose a valid date of birth.",
      kycErrGender: "Gender is required.",
      kycErrEmail: "Enter a valid email.",
      kycErrPhone: "Phone must be 10 digits.",
      kycErrAadhaar: "Aadhaar must be 12 digits.",
      kycAddrTitle: "Address Details",
      kycAddrSub: "Provide your current residential address",
      kycLblStreet: "Street Address",
      kycPhStreet: "Enter your street address",
      kycErrStreet: "Street address is required.",
      kycLblCity: "City",
      kycPhCity: "Enter city",
      kycErrCity: "City is required.",
      kycLblState: "State",
      kycPhState: "Enter state",
      kycErrState: "State is required.",
      kycLblPin: "PIN Code",
      kycPhPin: "6-digit PIN code",
      kycErrPin: "PIN code must be 6 digits.",
      kycUploadTitle: "Upload Documents",
      kycUploadSub: "Upload required documents for verification",
      kycUploadWarn: "Use sample files only. Never upload real personal documents here.",
      kycUploadTipsTitle: "Security Tips:",
      kycUploadTip1: "Only upload on official, verified websites",
      kycUploadTip2: "Check for HTTPS and secure connection",
      kycUploadTip3: "Never share documents via email or messaging apps",
      kycUploadTip4: "Ensure good lighting and clarity in photos",
      kycUploadPassportTitle: "Passport Photo",
      kycUploadPassportSub: "Recent color photograph",
      kycUploadIdProof: "ID Proof",
      kycUploadIdSub: "Clear photo of selected ID document",
      kycUploadAddrTitle: "Address Proof",
      kycUploadAddrSub: "Utility bill or rental agreement",
      kycUploadBtnPhoto: "Upload Photo",
      kycUploadBtnPhotoDone: "Photo Added",
      kycUploadBtnId: "Upload ID Proof",
      kycUploadBtnIdDone: "ID Added",
      kycUploadBtnAddr: "Upload Address Proof",
      kycUploadBtnAddrDone: "Address Added",
      kycUploadSubmit: "Submit for Verification",
      kycIdTitle: "Select ID Proof Type",
      kycIdSub: "Choose your primary identification document",
      kycIdHint: "Tap an option to select. You can change it anytime.",
      kycIdAadhaarTitle: "Aadhaar Card",
      kycIdAadhaarSub: "Most commonly used ID in India",
      kycIdPanTitle: "PAN Card",
      kycIdPanSub: "Required for financial transactions",
      kycIdPassportTitle: "Passport",
      kycIdPassportSub: "Valid government-issued ID",
      kycIdVoterTitle: "Voter ID",
      kycIdVoterSub: "Election commission ID card",
      kycDoneTitle: "KYC Renewal Complete! 🎉",
      kycDoneSub:
        "Congratulations! You've successfully completed the KYC renewal process. You now understand the proper steps and security measures for updating your digital identity.",
      kycDoneLessonsTitle: "Key Security Lessons:",
      kycDoneLesson1: "Always use official government/banking websites for KYC",
      kycDoneLesson2: "Verify HTTPS connection before uploading documents",
      kycDoneLesson3: "Never share KYC documents via email or messaging apps",
      kycDoneLesson4: "Be cautious of unsolicited KYC update requests",
      kycDoneLesson5: "Banks never ask for KYC updates via phone calls",
      kycDoneTryAgain: "Try Again",
      kycDoneBackHome: "Back to Home",
      utHubTitle: "UPI Registration Tutorial",
      utHubSub: "Learn UPI registration step by step in a safe practice sandbox.",
      utBrand: "Suraksha Setu",
      utModuleTitle: "UPI Registration Tutorial - New User",
      utSandboxWarn:
        "This is a safe practice sandbox. Do NOT enter real personal or banking information.",
      utStepOf: "Step {n} of 5",
      utPercentComplete: "{p}% Complete",
      utAudio: "Audio",
      utMascotPlaceholder: "Suraksha guide",
      utBack: "Back",
      utNext: "Next →",
      utDoneHub: "Back to modules",
      utS1Guide:
        "I'll guide you step by step through the UPI registration process. Let's start by selecting your bank.",
      utS1Tip: "Choose the bank where you have an active account",
      utBankTitle: "Select Your Bank",
      utBankSub: "Choose your bank to link with UPI",
      utBankSbi: "State Bank of India",
      utBankHdfc: "HDFC Bank",
      utBankIcici: "ICICI Bank",
      utBankAxis: "Axis Bank",
      utBankSelected: "Bank selected successfully!",
      utS2Guide: "Enter your mobile number carefully. This will be linked to your UPI account.",
      utS2GuideOk: "Great! That mobile number looks correct. Make sure it's registered with your bank.",
      utS2Tip: "Use the number registered with your bank account",
      utMobileTitle: "Enter Mobile Number",
      utMobileSub: "This number will be linked to your UPI account",
      utMobileLabel: "Mobile Number",
      utMobilePh: "Enter 10 digit number",
      utMobileTip: "Tip: Make sure this is the number registered with your bank account",
      utMobileValidated: "Mobile number validated successfully!",
      utS3Guide: "Please verify that these account details match your bank records.",
      utS3Tip: "Double-check the account holder name",
      utS3GuideOk: "Perfect! Your account details have been verified.",
      utVerifyTitle: "Verify Bank Account",
      utVerifySub: "Please confirm these details match your account",
      utLblHolder: "Account Holder Name",
      utDemoHolder: "Rajesh Kumar",
      utLblBankName: "Bank Name",
      utLblAccount: "Account Number",
      utDemoAccount: "XXXX XXXX 4521",
      utVerifyQuestion: "Is this your account?",
      utBtnNo: "No",
      utBtnYes: "Yes",
      utS4Guide: "Create a secure 4-digit PIN. Avoid common patterns like 1234 or repeated digits.",
      utS4Tip: "Never share your PIN with anyone, including bank staff",
      utS4GuideOk: "Excellent! You've created a strong PIN. Remember to keep it secret.",
      utPinTitle: "Set UPI PIN",
      utPinSub: "Create a secure 4-digit PIN",
      utEnterPin: "Enter PIN",
      utConfirmPin: "Confirm PIN",
      utPinTip:
        "Tip: Choose a PIN that's unique and easy for you to remember, but hard for others to guess",
      utPinStrong: "Strong",
      utPinWeak: "Weak",
      utPinSuccess: "PIN created successfully!",
      utS5Guide:
        "Congratulations! You've successfully completed the UPI registration process. You're now ready to make secure digital payments!",
      utS5Footer: "Practice makes perfect! Try this simulation again anytime",
      utPhoneCompleteTitle: "Setup Complete!",
      utPhoneCompleteSub: "Your UPI account has been registered successfully",
      utStatusLabel: "Status",
      utStatusActive: "Active",
      utUpiIdLabel: "UPI ID",
      utDemoUpiId: "user@bank",
      utLinkedBankLabel: "Linked Bank",
      utTutorialDoneBanner: "Great job! You've successfully completed the UPI registration tutorial",
    };
    const hi = {
      ...en,
      backHome: "वापस",
      listening: "सुन रहा है",
      hubTitle: "सीखो हब",
      hubSub: "सुरक्षित सिमुलेशन चुनें। आप इन चरणों को अपनी गति से कर सकते हैं।",
      gsTitle: "UPI पासवर्ड सेटअप",
      gsCardSub: "चरण-दर-चरण मार्गदर्शन के साथ सुरक्षित UPI PIN बनाना सीखें।",
      kycTitle: "डिजिटल आईडी / KYC नवीनीकरण",
      kycCardSub: "सुरक्षित KYC नवीनीकरण प्रक्रिया और धोखाधड़ी पहचानना सीखें।",
      continue: "जारी रखें",
      startSetup: "सेटअप प्रक्रिया शुरू करें",
      upiIntroLine1: "इस इंटरैक्टिव सिमुलेशन में आप सुरक्षित UPI PIN सेट करना सीखेंगे।",
      upiIntroLine2: "हम आपको पूरी प्रक्रिया में मार्गदर्शन देंगे और सामान्य सुरक्षा गलतियों से बचना सिखाएंगे।",
      upiLearnTitle: "आप क्या सीखेंगे:",
      upiLearn1: "मजबूत और सुरक्षित UPI PIN कैसे बनाएं",
      upiLearn2: "कमजोर PIN पैटर्न से कैसे बचें (1234, 1111, आदि)",
      upiLearn3: "रीयल-टाइम वेलिडेशन और सुरक्षा फीडबैक",
      upiLearn4: "मोबाइल बैंकिंग सुरक्षा की सर्वोत्तम प्रथाएं",
      pinCreateTitle: "UPI PIN बनाएं",
      pinCreateSub: "सुरक्षित 4 या 6 अंकों का PIN चुनें",
      showPin: "दिखाएं",
      hidePin: "छिपाएं",
      pinClear: "साफ करें",
      pinBack: "पीछे",
      completeSetup: "सेटअप पूरा करें",
      setupDoneTitle: "सेटअप पूरा हुआ!",
      setupDoneSub: "बधाई हो! आपने सफलतापूर्वक सुरक्षित UPI PIN सेट किया है।",
      takeawaysTitle: "मुख्य बातें:",
      kycIntroTitle: "डिजिटल आईडी / KYC नवीनीकरण",
      kycIntroSub:
        "अपनी डिजिटल पहचान और KYC (Know Your Customer) दस्तावेज़ों को सुरक्षित रूप से नवीनीकृत करने की प्रक्रिया सीखें। यह सिमुलेशन वैध अनुरोध पहचानने और संभावित घोटालों से बचने में मदद करता है।",
      kycLearnTitle: "आप क्या सीखेंगे:",
      kycLearn1: "सही KYC दस्तावेज़ जमा करने की प्रक्रिया",
      kycLearn2: "वैध नवीनीकरण अनुरोध कैसे सत्यापित करें",
      kycLearn3: "संभावित धोखाधड़ी के लाल झंडे",
      kycLearn4: "व्यक्तिगत जानकारी साझा करने की सुरक्षित प्रथाएँ",
      kycWarnTitle: "सुरक्षा अनुस्मारक:",
      kycWarnText:
        "यह एक सिमुलेटेड वातावरण है। कभी भी असली KYC दस्तावेज़ या व्यक्तिगत जानकारी साझा न करें जब तक आप आधिकारिक, सत्यापित सरकारी या बैंकिंग वेबसाइट पर न हों।",
      kycStartBtn: "KYC नवीनीकरण शुरू करें",
      kycTermsTitle: "नियम और शर्तें",
      kycTermsSub: "जारी रखने से पहले कृपया पढ़ें और स्वीकार करें।",
      kycTermsHeading: "आपकी गोपनीयता और सुरक्षा",
      kycTermsBody:
        "यह प्रशिक्षण सिमुलेशन है। असली आधार, PAN या बैंक विवरण न दर्ज करें।\n\nहम इस मॉड्यूल को आपके सत्र के दौरान डिवाइस पर रखते हैं (सेशन स्टोरेज) और खाता आवश्यक नहीं है।\n\nवास्तविक दस्तावेज़ अपलोड न करें—केवल नमूना छवियाँ उपयोग करें।\n\nयदि संदिग्ध KYC कॉल/संदेश मिलें, OTP साझा न करें और अपने बैंक या साइबर पुलिस से संपर्क करें।",
      kycTermsAccept: "मैं नियम और शर्तें स्वीकार करता/करती हूँ और समझता/समझती हूँ कि यह सिमुलेशन है।",
      kycPersonalTitle: "व्यक्तिगत जानकारी",
      kycPersonalSub: "अपने ID दस्तावेज़ के अनुसार मूल विवरण दर्ज करें",
      kycPersonalHint: "नियंत्रण आपके पास है। जारी रखने से पहले समीक्षा और संपादन कर सकते हैं।",
      kycLblFullName: "पूरा नाम",
      kycLblDob: "जन्म तिथि",
      kycLblGender: "लिंग",
      kycGenderSelect: "चुनें",
      kycGenderFemale: "महिला",
      kycGenderMale: "पुरुष",
      kycGenderOther: "अन्य",
      kycGenderPreferNot: "बताना नहीं चाहते",
      kycLblEmail: "ईमेल पता",
      kycLblPhone: "फ़ोन नंबर",
      kycPhFullName: "अपना पूरा नाम दर्ज करें",
      kycPhEmail: "your.email@example.com",
      kycPhPhone: "10 अंकों का मोबाइल नंबर दर्ज करें",
      kycPhAadhaar: "12 अंकों का आधार नंबर दर्ज करें",
      kycPhoneHelp: "गोपनीयता के लिए फ़ोकस न होने पर केवल अंतिम 4 अंक दिखते हैं। संपादन के लिए फ़ील्ड पर टैप करें, या आँख आइकन से अंक दिखाए रखें।",
      kycLblAadhaar: "आधार नंबर",
      kycAadhaarHelp: "आधार 12 अंकों का होना चाहिए।",
      kycErrName: "पूरा नाम आवश्यक है।",
      kycErrDob: "कृपया वैध जन्म तिथि चुनें।",
      kycErrGender: "लिंग आवश्यक है।",
      kycErrEmail: "वैध ईमेल दर्ज करें।",
      kycErrPhone: "फ़ोन 10 अंकों का होना चाहिए।",
      kycErrAadhaar: "आधार 12 अंकों का होना चाहिए।",
      kycAddrTitle: "पता विवरण",
      kycAddrSub: "अपना वर्तमान निवास पता दर्ज करें",
      kycLblStreet: "गली / मोहल्ला का पता",
      kycPhStreet: "अपना सड़क पता दर्ज करें",
      kycErrStreet: "सड़क पता आवश्यक है।",
      kycLblCity: "शहर",
      kycPhCity: "शहर दर्ज करें",
      kycErrCity: "शहर आवश्यक है।",
      kycLblState: "राज्य",
      kycPhState: "राज्य दर्ज करें",
      kycErrState: "राज्य आवश्यक है।",
      kycLblPin: "पिन कोड",
      kycPhPin: "6 अंकों का पिन कोड",
      kycErrPin: "पिन कोड 6 अंकों का होना चाहिए।",
      kycUploadTitle: "दस्तावेज़ अपलोड करें",
      kycUploadSub: "सत्यापन के लिए आवश्यक दस्तावेज़ अपलोड करें",
      kycUploadWarn: "केवल नमूना फ़ाइलें उपयोग करें। यहाँ वास्तविक व्यक्तिगत दस्तावेज़ कभी अपलोड न करें।",
      kycUploadTipsTitle: "सुरक्षा सुझाव:",
      kycUploadTip1: "केवल आधिकारिक, सत्यापित वेबसाइटों पर अपलोड करें",
      kycUploadTip2: "HTTPS और सुरक्षित कनेक्शन जाँचें",
      kycUploadTip3: "ईमेल या मैसेजिंग ऐप से दस्तावेज़ साझा न करें",
      kycUploadTip4: "फ़ोटो में अच्छी रोशनी और स्पष्टता सुनिश्चित करें",
      kycUploadPassportTitle: "पासपोर्ट फ़ोटो",
      kycUploadPassportSub: "हाल का रंगीन फ़ोटोग्राफ",
      kycUploadIdProof: "पहचान प्रमाण",
      kycUploadIdSub: "चयनित आईडी दस्तावेज़ की स्पष्ट फ़ोटो",
      kycUploadAddrTitle: "पते का प्रमाण",
      kycUploadAddrSub: "बिजली बिल या किराया समझौता",
      kycUploadBtnPhoto: "फ़ोटो अपलोड करें",
      kycUploadBtnPhotoDone: "फ़ोटो जोड़ा गया",
      kycUploadBtnId: "आईडी प्रमाण अपलोड करें",
      kycUploadBtnIdDone: "आईडी जोड़ी गई",
      kycUploadBtnAddr: "पता प्रमाण अपलोड करें",
      kycUploadBtnAddrDone: "पता प्रमाण जोड़ा गया",
      kycUploadSubmit: "सत्यापन के लिए जमा करें",
      kycIdTitle: "पहचान प्रमाण का प्रकार चुनें",
      kycIdSub: "अपना मुख्य पहचान दस्तावेज़ चुनें",
      kycIdHint: "चुनने के लिए विकल्प पर टैप करें। आप कभी भी बदल सकते हैं।",
      kycIdAadhaarTitle: "आधार कार्ड",
      kycIdAadhaarSub: "भारत में सबसे अधिक उपयोग की जाने वाली आईडी",
      kycIdPanTitle: "पैन कार्ड",
      kycIdPanSub: "वित्तीय लेनदेन के लिए आवश्यक",
      kycIdPassportTitle: "पासपोर्ट",
      kycIdPassportSub: "वैध सरकारी आईडी",
      kycIdVoterTitle: "मतदाता पहचान पत्र",
      kycIdVoterSub: "चुनाव आयोग का पहचान पत्र",
      kycDoneTitle: "KYC नवीनीकरण पूर्ण! 🎉",
      kycDoneSub:
        "बधाई हो! आपने KYC नवीनीकरण प्रक्रिया सफलतापूर्वक पूरी की। अब आप अपनी डिजिटल पहचान अपडेट करने के सही चरण और सुरक्षा उपाय समझते हैं।",
      kycDoneLessonsTitle: "मुख्य सुरक्षा सबक:",
      kycDoneLesson1: "KYC के लिए हमेशा आधिकारिक सरकारी/बैंकिंग वेबसाइटें उपयोग करें",
      kycDoneLesson2: "दस्तावेज़ अपलोड करने से पहले HTTPS कनेक्शन सत्यापित करें",
      kycDoneLesson3: "ईमेल या मैसेजिंग ऐप से KYC दस्तावेज़ साझा न करें",
      kycDoneLesson4: "अनचाहे KYC अपडेट अनुरोधों से सावधान रहें",
      kycDoneLesson5: "बैंक फोन कॉल से KYC अपडेट नहीं मांगते",
      kycDoneTryAgain: "फिर से प्रयास करें",
      kycDoneBackHome: "होम पर वापस",
      utHubTitle: "UPI पंजीकरण ट्यूटोरियल",
      utHubSub: "सुरक्षित अभ्यास सैंडबॉक्स में चरण-दर-चरण UPI पंजीकरण सीखें।",
      utBrand: "सुरक्षा सेतु",
      utModuleTitle: "UPI पंजीकरण ट्यूटोरियल — नया उपयोगकर्ता",
      utSandboxWarn:
        "यह सुरक्षित अभ्यास सैंडबॉक्स है। वास्तविक व्यक्तिगत या बैंकिंग जानकारी यहाँ न दर्ज करें।",
      utStepOf: "चरण {n} / 5",
      utPercentComplete: "{p}% पूर्ण",
      utAudio: "ऑडियो",
      utMascotPlaceholder: "सुरक्षा मार्गदर्शक",
      utBack: "पीछे",
      utNext: "आगे →",
      utDoneHub: "मॉड्यूल पर वापस",
      utS1Guide:
        "मैं आपको चरण-दर-चरण UPI पंजीकरण में मार्गदर्शन दूँगा। आइए अपना बैंक चुनकर शुरू करें।",
      utS1Tip: "वह बैंक चुनें जहाँ आपका सक्रिय खाता है",
      utBankTitle: "अपना बैंक चुनें",
      utBankSub: "UPI से जोड़ने के लिए अपना बैंक चुनें",
      utBankSbi: "स्टेट बैंक ऑफ इंडिया",
      utBankHdfc: "एचडीएफसी बैंक",
      utBankIcici: "आईसीआईसीआई बैंक",
      utBankAxis: "ऐक्सिस बैंक",
      utBankSelected: "बैंक सफलतापूर्वक चुना गया!",
      utS2Guide: "अपना मोबाइल नंबर सावधानी से दर्ज करें। यह आपके UPI खाते से जुड़ेगा।",
      utS2GuideOk: "बढ़िया! यह मोबाइल नंबर सही लगता है। सुनिश्चित करें कि यह आपके बैंक में पंजीकृत हो।",
      utS2Tip: "वह नंबर उपयोग करें जो आपके बैंक खाते में पंजीकृत है",
      utMobileTitle: "मोबाइल नंबर दर्ज करें",
      utMobileSub: "यह नंबर आपके UPI खाते से लिंक होगा",
      utMobileLabel: "मोबाइल नंबर",
      utMobilePh: "10 अंकों का नंबर दर्ज करें",
      utMobileTip: "सुझाव: सुनिश्चित करें कि यह नंबर आपके बैंक खाते में पंजीकृत है",
      utMobileValidated: "मोबाइल नंबर सफलतापूर्वक सत्यापित!",
      utS3Guide: "कृपया सुनिश्चित करें कि ये खाता विवरण आपके बैंक रिकॉर्ड से मेल खाते हैं।",
      utS3Tip: "खाताधारक का नाम दोबारा जाँचें",
      utS3GuideOk: "उत्तम! आपके खाता विवरण सत्यापित हो गए।",
      utVerifyTitle: "बैंक खाता सत्यापित करें",
      utVerifySub: "कृपया पुष्टि करें कि ये विवरण आपके खाते से मेल खाते हैं",
      utLblHolder: "खाताधारक का नाम",
      utDemoHolder: "राजेश कुमार",
      utLblBankName: "बैंक का नाम",
      utLblAccount: "खाता संख्या",
      utDemoAccount: "XXXX XXXX 4521",
      utVerifyQuestion: "क्या यह आपका खाता है?",
      utBtnNo: "नहीं",
      utBtnYes: "हाँ",
      utS4Guide:
        "सुरक्षित 4 अंकों का PIN बनाएं। 1234 या दोहराए गए अंकों जैसे सामान्य पैटर्न से बचें।",
      utS4Tip: "अपना PIN किसी के साथ साझा न करें, बैंक कर्मचारियों सहित",
      utS4GuideOk: "शानदार! आपने मजबूत PIN बनाया है। इसे गुप्त रखें।",
      utPinTitle: "UPI PIN सेट करें",
      utPinSub: "सुरक्षित 4 अंकों का PIN बनाएं",
      utEnterPin: "PIN दर्ज करें",
      utConfirmPin: "PIN की पुष्टि करें",
      utPinTip:
        "सुझाव: ऐसा PIN चुनें जो आपके लिए याद रखना आसान हो और दूसरों के लिए अनुमान लगाना मुश्किल।",
      utPinStrong: "मजबूत",
      utPinWeak: "कमजोर",
      utPinSuccess: "PIN सफलतापूर्वक बनाया गया!",
      utS5Guide:
        "बधाई हो! आपने UPI पंजीकरण प्रक्रिया सफलतापूर्वक पूरी की। अब आप सुरक्षित डिजिटल भुगतान के लिए तैयार हैं!",
      utS5Footer: "अभ्यास से निपुणता आती है! यह सिमुलेशन कभी भी दोबारा आज़माएँ",
      utPhoneCompleteTitle: "सेटअप पूर्ण!",
      utPhoneCompleteSub: "आपका UPI खाता सफलतापूर्वक पंजीकृत हो गया है",
      utStatusLabel: "स्थिति",
      utStatusActive: "सक्रिय",
      utUpiIdLabel: "UPI ID",
      utDemoUpiId: "user@bank",
      utLinkedBankLabel: "लिंक्ड बैंक",
      utTutorialDoneBanner: "शाबाश! आपने UPI पंजीकरण ट्यूटोरियल सफलतापूर्वक पूरा किया",
    };
    /** Marathi — hub + cards (voice reads these; Google TTS uses mr-IN) */
    const mr = {
      ...hi,
      backHome: "मागे",
      listening: "ऐकत आहे",
      hubTitle: "शिकू हब",
      hubSub: "सुरक्षित सिम्युलेशन निवडा. हे पायऱ्या तुमच्या गतीने पूर्ण करा.",
      utHubTitle: "UPI नोंदणी ट्यूटोरियल",
      utHubSub: "सुरक्षित सराव सँडबॉक्समध्ये पायऱ्यानुपायऱ्या UPI नोंदणी शिका.",
      kycTitle: "डिजिटल आयडी / KYC नूतनीकरण",
      kycCardSub: "सुरक्षित KYC नूतनीकरण प्रक्रिया आणि फसवणूक ओळखणे शिका.",
      gsTitle: "UPI पासवर्ड सेटअप",
      gsCardSub: "पायऱ्यानुपायऱ्या मार्गदर्शनासह सुरक्षित UPI PIN तयार करणे शिका.",
    };
    const es = {
      ...en,
      backHome: "Atras",
      listening: "Escuchando",
      hubTitle: "Seekho Hub",
      hubSub: "Elige una simulacion segura. Puedes completar estos pasos a tu ritmo.",
      gsTitle: "Configuracion de clave UPI",
      gsCardSub: "Practica crear un PIN UPI seguro con guia paso a paso.",
      kycTitle: "Renovacion de ID/KYC digital",
      kycCardSub: "Aprende el flujo seguro de renovacion KYC y como detectar fraudes.",
      continue: "Continuar",
      startSetup: "Iniciar proceso de configuracion",
      upiIntroLine1: "En esta simulacion interactiva, aprenderas a configurar un PIN UPI seguro paso a paso.",
      upiIntroLine2: "Te guiaremos durante el proceso y te ensenaremos a evitar errores de seguridad comunes.",
      upiLearnTitle: "Lo que aprenderas:",
      completeSetup: "Completar configuracion",
      setupDoneTitle: "Configuracion completada",
    };
    const fr = {
      ...en,
      backHome: "Retour",
      listening: "Ecoute",
      hubTitle: "Seekho Hub",
      hubSub: "Choisissez une simulation sure. Vous pouvez suivre ces etapes a votre rythme.",
      gsTitle: "Configuration du mot de passe UPI",
      continue: "Continuer",
      startSetup: "Demarrer la configuration",
      upiIntroLine1: "Dans cette simulation interactive, vous apprendrez a configurer un code UPI securise.",
      upiIntroLine2: "Nous vous guiderons et vous aiderons a eviter les erreurs de securite courantes.",
      upiLearnTitle: "Ce que vous allez apprendre :",
      completeSetup: "Terminer la configuration",
      setupDoneTitle: "Configuration terminee !",
    };
    const ar = {
      ...en,
      backHome: "رجوع",
      listening: "جار الاستماع",
      hubTitle: "Seekho Hub",
      hubSub: "اختر محاكاة امنة. يمكنك تنفيذ هذه الخطوات حسب وتيرتك.",
      gsTitle: "اعداد كلمة مرور UPI",
      continue: "متابعة",
      startSetup: "ابدأ عملية الاعداد",
      upiIntroLine1: "في هذه المحاكاة التفاعلية ستتعلم كيفية اعداد رقم UPI امن خطوة بخطوة.",
      upiIntroLine2: "سنرشدك خلال العملية ونعلمك كيفية تجنب اخطاء الامان الشائعة.",
      upiLearnTitle: "ماذا ستتعلم:",
      completeSetup: "اكمال الاعداد",
      setupDoneTitle: "اكتمل الاعداد!",
    };
    const dict = { EN: en, HI: hi, ES: es, FR: fr, AR: ar, MR: mr }[lang] || en;
    return (k) => dict[k] ?? en[k] ?? k;
  }, [lang]);
  const cls = useMemo(() => {
    if (isAuthPage || isSetuConnect) return "bg-slate-50 text-slate-900";
    return dark ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  }, [dark, isAuthPage, isSetuConnect]);

  return (
    <div className={`${cls} ${isHunter ? "" : dark ? "dark-app-bg" : "light-app-bg"} min-h-screen`}>
      <LanguageModal
        open={langOpen}
        lang={lang}
        onClose={() => setLangOpen(false)}
        onSelect={(next) => setLang(next)}
      />

      {!isLanding && !isHunter && !isSetuConnect && !isAuthPage && (
        <Header
          dark={dark}
          setDark={setDark}
          onOpenLanguage={() => setLangOpen(true)}
          sessionUser={sessionUser}
        />
      )}
      <Routes>
        {/* Landing page becomes the entry; keep Choose Challenge unchanged at /challenge */}
        <Route
          path="/"
          element={<Landing lang={lang} setLang={setLang} t={tLanding} sessionUser={sessionUser} refreshSession={refreshSession} />}
        />
        <Route path="/challenge" element={<HomePage t={t} />} />
        <Route path="/scam-simulator" element={<ScamSimulator />} />
        <Route path="/security-assistant" element={<SecurityAssistant />} />
        <Route path="/deepfake-recognition" element={<DeepfakeRecognition />} />
        <Route path="/bot" element={<DeepfakeRecognition lang={lang} />} />
        <Route path="/cyber-police" element={<CyberPolice />} />
        <Route path="/setu-connect" element={<SetuConnect />} />
        <Route path="/login" element={<GuardianAuth />} />
        <Route path="/signup" element={<GuardianAuth />} />
        <Route path="/account" element={<Navigate to="/" replace />} />
        <Route path="/profile" element={<Navigate to="/" replace />} />
        <Route
          path="/hunter"
          element={<HunterPage dark={dark} setDark={setDark} lang={lang} onOpenLanguage={() => setLangOpen(true)} />}
        />
        <Route path="/quiz" element={<QuizPage t={t} lang={lang} />} />
        <Route path="/compare" element={<ComparePage t={t} />} />

        {/* Guided Sandbox module flow */}
        <Route path="/modules/guided-sandbox" element={<GuidedSandboxIntro lang={lang} t={tFn} />} />
        <Route path="/modules/guided-sandbox/upi-setup" element={<UpiSetupIntro lang={lang} t={tFn} />} />
        <Route path="/modules/guided-sandbox/bank-select" element={<Navigate to="/modules/guided-sandbox/create-pin" replace />} />
        <Route path="/modules/guided-sandbox/create-pin" element={<CreatePin lang={lang} t={tFn} />} />
        <Route path="/modules/guided-sandbox/confirm-pin" element={<ConfirmPin lang={lang} t={tFn} />} />
        <Route path="/modules/guided-sandbox/complete" element={<SetupComplete lang={lang} t={tFn} />} />

        <Route path="/modules/kyc" element={<KycIntro lang={lang} t={tFn} />} />
        <Route path="/modules/kyc/terms" element={<KycTerms lang={lang} t={tFn} />} />
        <Route path="/modules/kyc/id-proof" element={<KycIdProof lang={lang} t={tFn} />} />
        <Route path="/modules/kyc/personal" element={<KycPersonal lang={lang} t={tFn} />} />
        <Route path="/modules/kyc/address" element={<KycAddress lang={lang} t={tFn} />} />
        <Route path="/modules/kyc/upload" element={<KycUpload lang={lang} t={tFn} />} />
        <Route path="/modules/kyc/complete" element={<KycComplete lang={lang} t={tFn} />} />
        <Route path="/modules/upi-registration-tutorial" element={<UpiTutorial lang={lang} t={tFn} />} />
      </Routes>
    </div>
  );
}
