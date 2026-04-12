import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function UpiSetupIntro({ lang, t }) {
  const navigate = useNavigate();
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [
        t("gsTitle"),
        t("upiIntroLine1"),
        t("upiIntroLine2"),
      ].join(". "),
  });

  return (
    <div className="moduleShell">
      <ModuleDecor variant="blue" />
      <div className="moduleTop">
        <Link className="backLink" to="/modules/guided-sandbox">
          ← {t("backHome")}
        </Link>
        <button className="voiceMini" type="button" onClick={va.toggle} aria-label="Voice assistant">
          {va.speaking && !va.paused ? "⏸" : "🔊"}
        </button>
      </div>

      <div className="moduleProgress" aria-hidden="true">
        <div className="seg on" />
        <div className="seg" />
        <div className="seg" />
        <div className="seg" />
      </div>

      <div className="moduleLayout">
        <aside className="mascotSpace" aria-hidden="true">
          <FloatingMascot />
        </aside>

        <main className="moduleCardWrap">
          <div className="moduleCard wide">
            <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 26,
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontSize: 34,
                  background: "linear-gradient(180deg, rgba(0, 194, 255, 0.92), rgba(26, 123, 255, 0.92))",
                  boxShadow: "0 18px 55px rgba(26, 123, 255, 0.18)",
                }}
              >
                🔒
              </div>

              <div className="moduleTitleRow" style={{ justifyContent: "center" }}>
                <h1 className="stepTitle">{t("gsTitle")}</h1>
                <button className="voicePill" type="button" onClick={va.toggle} aria-label="Voice assistant">
                  <span className="voiceDot" aria-hidden="true" />
                  <span className="voiceText">{t("listening")}</span>
                  <span className="voiceIcon" aria-hidden="true">
                    {va.speaking && !va.paused ? "⏸" : "🔊"}
                  </span>
                </button>
              </div>

              <p className="stepSub">
                {t("upiIntroLine1")} {t("upiIntroLine2")}
              </p>
            </div>

            <div className="tipBox" style={{ maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
              <div className="tipTitle">
                <span aria-hidden="true">🛡️</span>
                <span>{t("upiLearnTitle")}</span>
              </div>
              <ul className="tipList">
                <li>{t("upiLearn1")}</li>
                <li>{t("upiLearn2")}</li>
                <li>{t("upiLearn3")}</li>
                <li>{t("upiLearn4")}</li>
              </ul>
            </div>

            <div className="moduleCtaRow">
              <button className="gradBtn" type="button" onClick={() => navigate("/modules/guided-sandbox/create-pin")}>
                {t("startSetup")}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

