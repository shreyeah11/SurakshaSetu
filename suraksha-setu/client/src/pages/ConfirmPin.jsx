import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

export default function ConfirmPin({ lang, t }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [banner, setBanner] = useState(null);
  const expected = sessionStorage.getItem("gs_pin") || "";

  const okLen = useMemo(
    () => pin.length === expected.length && (pin.length === 4 || pin.length === 6),
    [expected.length, pin.length],
  );
  const matches = useMemo(() => okLen && expected && pin === expected, [expected, okLen, pin]);
  const mismatchReady = useMemo(() => okLen && expected && pin !== expected, [expected, okLen, pin]);

  const va = useVoiceAssistant({
    lang,
    getText: () => [t("pinConfirmTitle"), t("pinConfirmSub"), expected ? t("pinConfirmHint") : t("pinMissingHint")].join(". "),
  });

  const pressDigit = (d) => {
    setBanner(null);
    setPin((p) => (expected && p.length >= expected.length ? p : `${p}${d}`));
  };
  const backspace = () => {
    setBanner(null);
    setPin((p) => p.slice(0, -1));
  };
  const clear = () => {
    setBanner(null);
    setPin("");
  };

  const onComplete = () => {
    if (!expected) {
      setBanner({ type: "err", text: t("pinMissingHint") });
      return;
    }
    if (!okLen) {
      setBanner({ type: "err", text: t("pinErrLengthConfirm") });
      return;
    }
    if (!matches) {
      setBanner({ type: "err", text: t("pinMismatch") });
      return;
    }
    navigate("/modules/guided-sandbox/complete");
  };

  return (
    <div className="moduleShell">
      <ModuleDecor variant="blue" />
      <div className="moduleTop">
        <Link className="backLink" to="/modules/guided-sandbox/create-pin">
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
        <div className="seg" />
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
                  <h1 className="stepTitle">{t("pinConfirmTitle")}</h1>
                  <p className="stepSub">{t("pinConfirmSub")}</p>

                  <div className="pinRow">
                    {Array.from({ length: expected ? expected.length : 6 }).map((_, i) => {
                      const filled = pin[i] != null;
                      return (
                        <div key={i} className={`pinBox ${i === pin.length - 1 && filled ? "active" : ""}`}>
                          {filled ? (show ? pin[i] : "•") : ""}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`stepHint ${matches ? "ok" : "info"}`}>
                    <span className="stepHintDot" aria-hidden="true" />
                    <span>{expected ? t("pinConfirmHint") : t("pinMissingHint")}</span>
                    <button className="hintToggle" type="button" onClick={() => setShow((s) => !s)}>
                      {show ? t("hidePin") : t("showPin")}
                    </button>
                  </div>

                  <div className="keypad" role="group" aria-label="PIN keypad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <button key={n} className="keyBtn" type="button" onClick={() => pressDigit(String(n))}>
                        {n}
                      </button>
                    ))}
                    <button className="keyBtn ghost" type="button" onClick={clear}>
                      {t("pinClear")}
                    </button>
                    <button className="keyBtn" type="button" onClick={() => pressDigit("0")}>
                      0
                    </button>
                    <button className="keyBtn ghost" type="button" onClick={backspace}>
                      {t("pinBack")}
                    </button>
                  </div>

                  {matches ? (
                    <div className="successBox">
                      <span className="successIcon" aria-hidden="true">
                        ✅
                      </span>
                      <span>{t("pinsMatch")}</span>
                    </div>
                  ) : null}

                  {mismatchReady ? <div className="inlineBanner err">{t("pinConfirmNoMatch")}</div> : null}

                  {banner ? <div className={`inlineBanner ${banner.type}`}>{banner.text}</div> : null}

                  <div className="moduleCtaRow">
                    <button className="btn moduleCta wideBtn" type="button" onClick={onComplete}>
                      {t("completeSetup")}
                    </button>
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

