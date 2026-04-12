import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function KycTerms({ lang, t }) {
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  const bodyText = useMemo(() => t("kycTermsBody"), [t]);

  const va = useVoiceAssistant({
    lang,
    getText: () => [t("kycTermsTitle"), t("kycTermsSub"), t("kycTermsHeading"), bodyText].join(". "),
  });

  return (
    <div className="moduleShell">
      <ModuleDecor variant="pink" />

      <div className="moduleTop">
        <Link className="backLink" to="/modules/kyc">
          ← {t("backHome")}
        </Link>
        <button className="voiceMini" type="button" onClick={va.toggle} aria-label={t("listening")}>
          {va.speaking && !va.paused ? "⏸" : "🔊"}
        </button>
      </div>

      <div className="moduleProgress" aria-hidden="true">
        <div className="seg pink on" />
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
            <h1 className="stepTitle">{t("kycTermsTitle")}</h1>
            <p className="stepSub">{t("kycTermsSub")}</p>

            <div
              style={{
                margin: "16px auto 0",
                maxWidth: 760,
                borderRadius: 18,
                border: "1px solid rgba(13, 124, 168, 0.14)",
                background: "rgba(255,255,255,0.72)",
                padding: 14,
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 950, color: "rgba(11, 29, 42, 0.82)", marginBottom: 10 }}>{t("kycTermsHeading")}</div>
              <div style={{ color: "rgba(11, 29, 42, 0.66)", fontWeight: 750, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{bodyText}</div>
            </div>

            <label
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontWeight: 850,
                color: "rgba(11, 29, 42, 0.72)",
              }}
            >
              <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
              <span>{t("kycTermsAccept")}</span>
            </label>

            <div className="moduleCtaRow">
              <button
                className="gradBtn pink"
                type="button"
                disabled={!ok}
                onClick={() => navigate("/modules/kyc/id-proof")}
                style={{ opacity: ok ? 1 : 0.55, cursor: ok ? "pointer" : "not-allowed" }}
              >
                {t("continue")}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
