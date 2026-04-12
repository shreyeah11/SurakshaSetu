import { Link } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function KycComplete({ lang, t }) {
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [
        t("kycDoneTitle"),
        t("kycDoneSub"),
        t("kycDoneLessonsTitle"),
        t("kycDoneLesson1"),
        t("kycDoneLesson2"),
        t("kycDoneLesson3"),
        t("kycDoneLesson4"),
        t("kycDoneLesson5"),
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
                  width: 84,
                  height: 84,
                  borderRadius: 26,
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontSize: 34,
                  background: "linear-gradient(180deg, rgba(0, 210, 120, 0.92), rgba(16, 185, 129, 0.92))",
                  boxShadow: "0 18px 55px rgba(16, 185, 129, 0.18)",
                }}
              >
                ✅
              </div>

              <h1 className="stepTitle">{t("kycDoneTitle")}</h1>
              <p className="stepSub">{t("kycDoneSub")}</p>
            </div>

            <div className="tipBox" style={{ borderColor: "rgba(0, 210, 120, 0.22)", background: "rgba(0, 210, 120, 0.06)" }}>
              <div className="tipTitle">
                <span aria-hidden="true">🛡️</span>
                <span>{t("kycDoneLessonsTitle")}</span>
              </div>
              <ul className="tipList">
                <li>{t("kycDoneLesson1")}</li>
                <li>{t("kycDoneLesson2")}</li>
                <li>{t("kycDoneLesson3")}</li>
                <li>{t("kycDoneLesson4")}</li>
                <li>{t("kycDoneLesson5")}</li>
              </ul>
            </div>

            <div className="moduleCtaRow" style={{ gridAutoFlow: "column", gap: 12, alignItems: "center" }}>
              <Link className="gradBtn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }} to="/modules/kyc">
                {t("kycDoneTryAgain")}
              </Link>
              <Link className="gradBtn pink" style={{ display: "grid", placeItems: "center", textDecoration: "none" }} to="/modules/guided-sandbox">
                {t("kycDoneBackHome")}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
