import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function KycIntro({ lang, t }) {
  const navigate = useNavigate();
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [
        t("kycIntroTitle"),
        t("kycIntroSub"),
        t("kycLearn1"),
        t("kycLearn2"),
        t("kycLearn3"),
        t("kycLearn4"),
        t("kycWarnText"),
      ].join(". "),
  });

  return (
    <div className="moduleShell">
      <ModuleDecor variant="pink" />
      <div className="moduleTop">
        <Link className="backLink" to="/modules/guided-sandbox">
          ← {t("backHome")}
        </Link>
        <button className="voiceMini" type="button" onClick={va.toggle} aria-label={t("listening")}>
          {va.speaking && !va.paused ? "⏸" : "🔊"}
        </button>
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
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontSize: 28,
                  background: "linear-gradient(180deg, rgba(164, 75, 255, 0.92), rgba(255, 72, 200, 0.92))",
                  boxShadow: "0 18px 50px rgba(255, 72, 200, 0.18)",
                }}
              >
                🪪
              </div>
              <h1 className="stepTitle">{t("kycIntroTitle")}</h1>
              <p className="stepSub">{t("kycIntroSub")}</p>
            </div>

            <div className="tipBox">
              <div className="tipTitle">
                <span aria-hidden="true">🛡️</span>
                <span>{t("kycLearnTitle")}</span>
              </div>
              <ul className="tipList">
                <li>{t("kycLearn1")}</li>
                <li>{t("kycLearn2")}</li>
                <li>{t("kycLearn3")}</li>
                <li>{t("kycLearn4")}</li>
              </ul>
            </div>

            <div className="warnBox">
              <div className="warnTitle">
                <span aria-hidden="true">⚠️</span>
                <span>{t("kycWarnTitle")}</span>
              </div>
              <div className="warnText">{t("kycWarnText")}</div>
            </div>

            <div className="moduleCtaRow">
              <button className="gradBtn pink" type="button" onClick={() => navigate("/modules/kyc/terms")}>
                {t("kycStartBtn")}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
