import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

function isSequential(s) {
  if (s.length < 4) return false;
  const nums = s.split("").map((c) => Number(c));
  if (nums.some((n) => Number.isNaN(n))) return false;
  let up = true;
  let down = true;
  for (let i = 1; i < nums.length; i += 1) {
    up = up && nums[i] === nums[i - 1] + 1;
    down = down && nums[i] === nums[i - 1] - 1;
  }
  return up || down;
}

function isAllSame(s) {
  return s.length >= 4 && s.split("").every((c) => c === s[0]);
}

function hasTripleRepeat(s) {
  if (s.length < 3) return false;
  for (let i = 2; i < s.length; i += 1) {
    if (s[i] === s[i - 1] && s[i] === s[i - 2]) return true;
  }
  return false;
}

export default function CreatePin({ lang, t }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => setBanner(null), [lang]);

  const analysis = useMemo(() => {
    const len = pin.length;
    const okLen = len === 4 || len === 6;
    const weakSeq = isSequential(pin);
    const weakSame = isAllSame(pin);
    const weakTriple = hasTripleRepeat(pin);
    const birthYear = len === 4 && (pin.startsWith("19") || pin.startsWith("20"));
    const strongEnough = okLen && !weakSeq && !weakSame && !weakTriple && !birthYear;
    return { len, okLen, weakSeq, weakSame, weakTriple, birthYear, strongEnough };
  }, [pin]);

  const hint = useMemo(() => {
    if (!pin) return { type: "info", text: t("pinHintEnter") };
    if (analysis.birthYear) return { type: "warn", text: t("pinHintBirthYear") };
    if (analysis.weakSeq) return { type: "warn", text: t("pinHintWeakSeq") };
    if (analysis.weakSame || analysis.weakTriple) return { type: "warn", text: t("pinHintWeakRepeat") };
    if (analysis.okLen && analysis.strongEnough) return { type: "ok", text: t("pinHintGood") };
    return { type: "info", text: t("pinHintChoose4or6") };
  }, [analysis, pin, t]);

  const va = useVoiceAssistant({
    lang,
    getText: () => [t("pinCreateTitle"), t("pinCreateSub"), hint.text, t("tipsTitle")].join(". "),
  });

  const pressDigit = (d) => {
    setBanner(null);
    setPin((p) => (p.length >= 6 ? p : `${p}${d}`));
  };
  const backspace = () => {
    setBanner(null);
    setPin((p) => p.slice(0, -1));
  };
  const clear = () => {
    setBanner(null);
    setPin("");
  };

  const onContinue = () => {
    if (!analysis.okLen) {
      setBanner({ type: "err", text: t("pinErrLength") });
      return;
    }
    if (!analysis.strongEnough) {
      setBanner({ type: "warn", text: t("pinErrWeak") });
      return;
    }
    sessionStorage.setItem("gs_pin", pin);
    navigate("/modules/guided-sandbox/confirm-pin");
  };

  return (
    <div className="moduleShell">
      <ModuleDecor variant="blue" />
      <div className="moduleTop">
        <Link className="backLink" to="/modules/guided-sandbox/upi-setup">
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
                  <h1 className="stepTitle">{t("pinCreateTitle")}</h1>
                  <p className="stepSub">{t("pinCreateSub")}</p>

                  <div className={`stepHint ${hint.type}`}>
                    <span className="stepHintDot" aria-hidden="true" />
                    <span>{hint.text}</span>
                    <button className="hintToggle" type="button" onClick={() => setShow((s) => !s)}>
                      {show ? t("hidePin") : t("showPin")}
                    </button>
                  </div>

                  <div className="pinRow">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const filled = pin[i] != null;
                      return (
                        <div key={i} className={`pinBox ${i === pin.length - 1 && filled ? "active" : ""}`}>
                          {filled ? (show ? pin[i] : "•") : ""}
                        </div>
                      );
                    })}
                  </div>

                  {analysis.okLen ? (
                    <div className={`inlineBanner ${analysis.strongEnough ? "" : "warn"}`} style={{ maxWidth: 760 }}>
                      {analysis.strongEnough ? t("pinStrong") : t("pinWeak")}
                    </div>
                  ) : null}

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

                  {banner ? <div className={`inlineBanner ${banner.type}`}>{banner.text}</div> : null}

                  <div className="moduleCtaRow">
                    <button className="btn moduleCta wideBtn" type="button" onClick={onContinue}>
                      {t("continue")}
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

