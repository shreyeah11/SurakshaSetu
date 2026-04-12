import { Link } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function SetupComplete({ lang, t }) {
  const va = useVoiceAssistant({
    lang,
    getText: () => [t("setupDoneTitle"), t("setupDoneSub"), t("takeawaysTitle")].join(". "),
  });

  return (
    <div className="moduleShell">
      <ModuleDecor variant="blue" />
      <div className="moduleTop">
        <Link className="backLink" to="/challenge">
          ← {t("backHome")}
        </Link>
        <button className="voiceMini" type="button" onClick={va.toggle} aria-label="Voice assistant">
          {va.speaking && !va.paused ? "⏸" : "🔊"}
        </button>
      </div>

      <div className="moduleProgress" aria-hidden="true">
        <div className="seg on" />
        <div className="seg on" />
        <div className="seg on" />
        <div className="seg on" />
      </div>

      <div className="moduleLayout">
        <aside className="mascotSpace" aria-hidden="true">
          <FloatingMascot />
        </aside>

        <main className="moduleCardWrap">
          <div className="moduleCard wide">
            <div className="phoneShell">
              <div className="phoneInner">
                <div className="phoneStatus" aria-hidden="true">
                  <span className="phoneStatusTime">9:41</span>
                  <span className="phoneStatusIcons">
                    <span className="phoneStatusDot" />
                    <span className="phoneStatusDot" />
                    <span className="phoneStatusBar" />
                  </span>
                </div>
                <div className="phoneContent">
                  <h1 className="stepTitle">{t("setupDoneTitle")}</h1>
                  <p className="stepSub">{t("setupDoneSub")}</p>

                  <div className="takeBox">
                    <div className="takeTitle">
                      <span aria-hidden="true">🛡️</span> {t("takeawaysTitle")}
                    </div>
                    <ul className="learnList">
                      <li>✓ {t("take1")}</li>
                      <li>✓ {t("take2")}</li>
                      <li>✓ {t("take3")}</li>
                      <li>✓ {t("take4")}</li>
                    </ul>
                  </div>

                  <div className="moduleCtaRow">
                    <Link className="btn moduleCta wideBtn" to="/modules/guided-sandbox">
                      {t("backHome")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

