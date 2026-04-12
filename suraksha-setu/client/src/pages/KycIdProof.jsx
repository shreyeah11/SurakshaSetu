import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

const ITEMS = [
  { id: "aadhaar", titleKey: "kycIdAadhaarTitle", subKey: "kycIdAadhaarSub", icon: "🪪" },
  { id: "pan", titleKey: "kycIdPanTitle", subKey: "kycIdPanSub", icon: "💳" },
  { id: "passport", titleKey: "kycIdPassportTitle", subKey: "kycIdPassportSub", icon: "📘" },
  { id: "voter", titleKey: "kycIdVoterTitle", subKey: "kycIdVoterSub", icon: "🗳️" },
];

export default function KycIdProof({ lang, t }) {
  const [picked, setPicked] = useState("aadhaar");
  const navigate = useNavigate();
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [
        t("kycIdTitle"),
        t("kycIdSub"),
        t("kycIdHint"),
        ...ITEMS.flatMap((x) => [t(x.titleKey), t(x.subKey)]),
      ].join(". "),
  });

  const cardStyle = useMemo(
    () => ({
      borderRadius: 18,
      border: "1px solid rgba(13, 124, 168, 0.14)",
      background: "rgba(255,255,255,0.72)",
      padding: 14,
      display: "flex",
      alignItems: "center",
      gap: 12,
      cursor: "pointer",
    }),
    [],
  );

  return (
    <div className="moduleShell">
      <ModuleDecor variant="pink" />

      <div className="moduleTop">
        <Link className="backLink" to="/modules/kyc/terms">
          ← {t("backHome")}
        </Link>
        <button className="voiceMini" type="button" onClick={va.toggle} aria-label={t("listening")}>
          {va.speaking && !va.paused ? "⏸" : "🔊"}
        </button>
      </div>

      <div className="moduleProgress" aria-hidden="true">
        <div className="seg pink on" />
        <div className="seg pink on" />
        <div className="seg" />
        <div className="seg" />
      </div>

      <div className="moduleLayout">
        <aside className="mascotSpace" aria-hidden="true">
          <FloatingMascot />
        </aside>

        <main className="moduleCardWrap">
          <div className="moduleCard wide">
            <h1 className="stepTitle">{t("kycIdTitle")}</h1>
            <p className="stepSub">{t("kycIdSub")}</p>

            <div className="stepHint" style={{ maxWidth: 760 }}>
              <span className="stepHintDot" aria-hidden="true" />
              <span>{t("kycIdHint")}</span>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {ITEMS.map((x) => {
                const on = picked === x.id;
                return (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => setPicked(x.id)}
                    style={{
                      ...cardStyle,
                      borderColor: on ? "rgba(210, 80, 220, 0.40)" : "rgba(13, 124, 168, 0.14)",
                      boxShadow: on ? "0 0 0 4px rgba(210, 80, 220, 0.12)" : "none",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 16,
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(180deg, rgba(0, 194, 255, 0.14), rgba(26, 123, 255, 0.06))",
                        border: "1px solid rgba(26, 123, 255, 0.14)",
                        fontSize: 20,
                      }}
                    >
                      {x.icon}
                    </div>
                    <div style={{ textAlign: "left", minWidth: 0 }}>
                      <div style={{ fontWeight: 950, color: "rgba(11, 29, 42, 0.86)" }}>{t(x.titleKey)}</div>
                      <div style={{ marginTop: 2, fontWeight: 750, color: "rgba(11, 29, 42, 0.56)", fontSize: 13.5 }}>{t(x.subKey)}</div>
                    </div>
                    <div
                      style={{ marginLeft: "auto", fontWeight: 950, color: on ? "rgba(164, 75, 255, 0.92)" : "rgba(148, 163, 184, 0.95)" }}
                      aria-hidden="true"
                    >
                      {on ? "✓" : "○"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="moduleCtaRow">
              <button
                className="gradBtn pink"
                type="button"
                onClick={() => {
                  sessionStorage.setItem("kyc.idProof", picked);
                  navigate("/modules/kyc/personal");
                }}
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
