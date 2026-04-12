import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

function onlyDigits(s) {
  return (s || "").replace(/\D+/g, "");
}

export default function KycAddress({ lang, t }) {
  const navigate = useNavigate();
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [
        t("kycAddrTitle"),
        t("kycAddrSub"),
        t("kycPersonalHint"),
        t("kycLblStreet"),
        t("kycLblCity"),
        t("kycLblState"),
        t("kycLblPin"),
      ].join(". "),
  });

  const [street, setStreet] = useState(sessionStorage.getItem("kyc.street") || "");
  const [city, setCity] = useState(sessionStorage.getItem("kyc.city") || "");
  const [state, setState] = useState(sessionStorage.getItem("kyc.state") || "");
  const [pin, setPin] = useState(sessionStorage.getItem("kyc.pin") || "");

  const errors = useMemo(() => {
    const e = {};
    if (!street.trim()) e.street = t("kycErrStreet");
    if (!city.trim()) e.city = t("kycErrCity");
    if (!state.trim()) e.state = t("kycErrState");
    const p = onlyDigits(pin);
    if (!p || p.length !== 6) e.pin = t("kycErrPin");
    return e;
  }, [street, city, state, pin, t]);

  const canContinue = Object.keys(errors).length === 0;

  return (
    <div className="moduleShell">
      <ModuleDecor variant="pink" />

      <div className="moduleTop">
        <Link className="backLink" to="/modules/kyc/personal">
          ← {t("backHome")}
        </Link>
        <button className="voiceMini" type="button" onClick={va.toggle} aria-label={t("listening")}>
          {va.speaking && !va.paused ? "⏸" : "🔊"}
        </button>
      </div>

      <div className="moduleProgress" aria-hidden="true">
        <div className="seg pink on" />
        <div className="seg pink on" />
        <div className="seg pink on" />
        <div className="seg pink on" />
      </div>

      <div className="moduleLayout">
        <aside className="mascotSpace" aria-hidden="true">
          <FloatingMascot />
        </aside>

        <main className="moduleCardWrap">
          <div className="moduleCard wide left">
            <div className="stepIconTop" aria-hidden="true">
              📍
            </div>
            <h1 className="stepTitle" style={{ marginTop: 18 }}>
              {t("kycAddrTitle")}
            </h1>
            <p className="stepSub" style={{ marginLeft: 0 }}>
              {t("kycAddrSub")}
            </p>

            <div className="stepHint" style={{ maxWidth: 760 }}>
              <span className="stepHintDot" aria-hidden="true" />
              <span>{t("kycPersonalHint")}</span>
            </div>

            <div className="formGrid">
              <div className="field span2">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblStreet")} <span className="fieldReq">*</span>
                  </div>
                  {errors.street && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.street}</div>}
                </div>
                <input className="input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder={t("kycPhStreet")} />
              </div>

              <div className="field">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblCity")} <span className="fieldReq">*</span>
                  </div>
                  {errors.city && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.city}</div>}
                </div>
                <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("kycPhCity")} />
              </div>

              <div className="field">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblState")} <span className="fieldReq">*</span>
                  </div>
                  {errors.state && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.state}</div>}
                </div>
                <input className="input" value={state} onChange={(e) => setState(e.target.value)} placeholder={t("kycPhState")} />
              </div>

              <div className="field span2">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblPin")} <span className="fieldReq">*</span>
                  </div>
                  {errors.pin && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.pin}</div>}
                </div>
                <input className="input" value={pin} onChange={(e) => setPin(e.target.value)} placeholder={t("kycPhPin")} inputMode="numeric" />
              </div>
            </div>

            <div className="moduleCtaRow">
              <button
                className="gradBtn pink soft"
                type="button"
                disabled={!canContinue}
                onClick={() => {
                  sessionStorage.setItem("kyc.street", street);
                  sessionStorage.setItem("kyc.city", city);
                  sessionStorage.setItem("kyc.state", state);
                  sessionStorage.setItem("kyc.pin", onlyDigits(pin));
                  navigate("/modules/kyc/upload");
                }}
                style={{ opacity: canContinue ? 1 : 0.55, cursor: canContinue ? "pointer" : "not-allowed" }}
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
