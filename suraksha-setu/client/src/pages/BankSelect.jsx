import { Link } from "react-router-dom";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function BankSelect({ lang, t }) {
  const va = useVoiceAssistant({
    lang,
    getText: () => [t("bankTitle"), t("bankSub"), t("bank1"), t("bank2"), t("bank3"), t("bank4"), t("continue")].join(". "),
  });

  return (
    <div className="moduleShell">
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
        <div className="seg on" />
        <div className="seg" />
        <div className="seg" />
      </div>

      <div className="moduleLayout">
        <aside className="mascotSpace" aria-hidden="true" />

        <main className="moduleCardWrap">
          <div className="moduleCard wide">
            <h1 className="stepTitle">{t("bankTitle")}</h1>
            <p className="stepSub">{t("bankSub")}</p>

            <div className="bankList">
              {[t("bank1"), t("bank2"), t("bank3"), t("bank4")].map((name) => (
                <button key={name} className="bankItem" type="button">
                  <span className="bankIcon" aria-hidden="true">
                    🏦
                  </span>
                  <span>{name}</span>
                </button>
              ))}
            </div>

            <div className="moduleCtaRow">
              <Link className="btn moduleCta wideBtn" to="/modules/guided-sandbox/create-pin">
                {t("continue")}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

