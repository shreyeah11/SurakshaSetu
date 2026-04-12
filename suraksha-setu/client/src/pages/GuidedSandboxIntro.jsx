import { Link } from "react-router-dom";
import {
  Fingerprint,
  IdCard,
  KeyRound,
  Lock,
  Pause,
  ScanLine,
  Shield,
  ShieldCheck,
  Smartphone,
  Volume2,
} from "lucide-react";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function GuidedSandboxIntro({ lang, t }) {
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [t("hubTitle"), t("hubSub"), t("utHubTitle"), t("kycTitle"), t("gsTitle")].join(". "),
  });

  return (
    <div className="moduleShell moduleShell--hub">
      <ModuleDecor variant="blue" />
      <div className="hubFloatLayer" aria-hidden="true">
        <Shield className="hubSecIcon h1" strokeWidth={1.35} />
        <Lock className="hubSecIcon h2" strokeWidth={1.35} />
        <ShieldCheck className="hubSecIcon h3" strokeWidth={1.35} />
        <KeyRound className="hubSecIcon h4" strokeWidth={1.35} />
        <Fingerprint className="hubSecIcon h5" strokeWidth={1.35} />
        <Shield className="hubSecIcon h6" strokeWidth={1.35} />
        <ScanLine className="hubSecIcon h7" strokeWidth={1.35} />
        <Lock className="hubSecIcon h8" strokeWidth={1.35} />
        <ShieldCheck className="hubSecIcon h9" strokeWidth={1.35} />
        <KeyRound className="hubSecIcon h10" strokeWidth={1.35} />
      </div>
      <div className="moduleTop">
        <Link className="backLink" to="/">
          ← {t("backHome")}
        </Link>
      </div>

      <div className="moduleLayout">
        <aside className="mascotSpace" aria-hidden="true">
          <FloatingMascot />
        </aside>

        <main className="moduleCardWrap">
          <div className="moduleCard wide">
            <div className="moduleTitleRow">
              <h1 className="moduleTitle">{t("hubTitle")}</h1>
              <button className="voicePill" type="button" onClick={va.toggle} aria-label="Voice assistant">
                <span className="voiceDot" aria-hidden="true" />
                <span className="voiceText">{t("listening")}</span>
                <span className="voiceIcon" aria-hidden="true">
                  {va.speaking && !va.paused ? <Pause size={16} /> : <Volume2 size={16} />}
                </span>
              </button>
            </div>
            <p className="moduleDesc">{t("hubSub")}</p>

            <div className="moduleHubGrid">
              <Link className="hubCard utHubCard" to="/modules/upi-registration-tutorial">
                <div className="hubIcon utHubIcon" aria-hidden="true">
                  <Smartphone size={26} strokeWidth={1.6} />
                </div>
                <div className="hubText">
                  <div className="hubTitle">{t("utHubTitle")}</div>
                  <div className="hubSub">{t("utHubSub")}</div>
                </div>
                <div className="hubGo" aria-hidden="true">
                  →
                </div>
              </Link>

              <Link className="hubCard pink" to="/modules/kyc">
                <div className="hubIcon pink" aria-hidden="true">
                  <IdCard size={26} strokeWidth={1.6} />
                </div>
                <div className="hubText">
                  <div className="hubTitle">{t("kycTitle")}</div>
                  <div className="hubSub">{t("kycCardSub")}</div>
                </div>
                <div className="hubGo" aria-hidden="true">
                  →
                </div>
              </Link>

              <Link className="hubCard" to="/modules/guided-sandbox/upi-setup">
                <div className="hubIcon blue" aria-hidden="true">
                  <Lock size={26} strokeWidth={1.6} />
                </div>
                <div className="hubText">
                  <div className="hubTitle">{t("gsTitle")}</div>
                  <div className="hubSub">{t("gsCardSub")}</div>
                </div>
                <div className="hubGo" aria-hidden="true">
                  →
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
