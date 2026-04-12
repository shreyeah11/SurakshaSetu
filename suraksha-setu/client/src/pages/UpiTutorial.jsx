import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, EyeOff, Globe, Lock, Shield, Smartphone, Volume2 } from "lucide-react";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

const BANKS = [
  { id: "sbi", color: "#2563eb" },
  { id: "hdfc", color: "#dc2626" },
  { id: "icici", color: "#ea580c" },
  { id: "axis", color: "#9333ea" },
];

const LANG_NAMES = { EN: "English", HI: "हिन्दी", ES: "Español", FR: "Français", AR: "العربية" };

function bankNameKey(id) {
  const m = { sbi: "utBankSbi", hdfc: "utBankHdfc", icici: "utBankIcici", axis: "utBankAxis" };
  return m[id] || "utBankSbi";
}

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

function pinAnalysis(pin) {
  const len = pin.length;
  const okLen = len === 4;
  const weakSeq = isSequential(pin);
  const weakSame = isAllSame(pin);
  const weakTriple = hasTripleRepeat(pin);
  const birthYear = len === 4 && (pin.startsWith("19") || pin.startsWith("20"));
  const strongEnough = okLen && !weakSeq && !weakSame && !weakTriple && !birthYear;
  return { okLen, strongEnough };
}

function BankGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10h18v2H3v-2zm0 4h18v8H3v-8zm2 2v4h14v-4H5zm2-8V6h10v2H7zm4-4V2h2v2h-2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function UpiTutorial({ lang, t }) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [bankId, setBankId] = useState("sbi");
  const [mobile, setMobile] = useState("");
  const [verifyYes, setVerifyYes] = useState(false);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showPin2, setShowPin2] = useState(false);

  const mobileOk = /^[0-9]{10}$/.test(mobile);
  const pa = pinAnalysis(pin);
  const pinsMatch = pin.length === 4 && pin2.length === 4 && pin === pin2;
  const pinFlowOk = pa.strongEnough && pinsMatch;

  const percent = Math.min(100, Math.round((step / 5) * 100));

  const openLanguage = () => window.dispatchEvent(new CustomEvent("suraksha:open-language"));

  const voicePieces = useCallback(() => {
    const parts = [
      t("utBrand"),
      t("utModuleTitle"),
      t("utSandboxWarn"),
      t("utStepOf").replace("{n}", String(step)),
      t("utPercentComplete").replace("{p}", String(percent)),
    ];
    if (step === 1) {
      parts.push(t("utS1Guide"), t("utS1Tip"), t("utBankTitle"), t("utBankSub"));
      BANKS.forEach((b) => parts.push(t(bankNameKey(b.id))));
      parts.push(t("utBankSelected"));
    } else if (step === 2) {
      parts.push(mobileOk ? t("utS2GuideOk") : t("utS2Guide"), t("utS2Tip"));
      parts.push(t("utMobileTitle"), t("utMobileSub"), t("utMobileTip"));
      if (mobileOk) parts.push(t("utMobileValidated"));
    } else if (step === 3) {
      parts.push(verifyYes ? t("utS3GuideOk") : t("utS3Guide"), t("utS3Tip"));
      parts.push(t("utVerifyTitle"), t("utVerifySub"), t("utLblHolder"), t("utDemoHolder"));
      parts.push(t("utLblBankName"), t(bankNameKey(bankId)), t("utLblAccount"), t("utDemoAccount"));
      parts.push(t("utVerifyQuestion"), t("utBtnNo"), t("utBtnYes"));
    } else if (step === 4) {
      parts.push(pinFlowOk ? t("utS4GuideOk") : t("utS4Guide"), t("utS4Tip"));
      parts.push(t("utPinTitle"), t("utPinSub"), t("utEnterPin"), t("utConfirmPin"), t("utPinTip"));
      if (pin.length === 4) parts.push(t("utPinStrong"), t("utPinWeak"));
      if (pinFlowOk) parts.push(t("utPinSuccess"));
    } else {
      parts.push(t("utS5Guide"), t("utS5Footer"));
      parts.push(t("utPhoneCompleteTitle"), t("utPhoneCompleteSub"));
      parts.push(t("utStatusLabel"), t("utStatusActive"), t("utUpiIdLabel"), t("utDemoUpiId"));
      parts.push(t("utLinkedBankLabel"), t(bankNameKey(bankId)), t("utTutorialDoneBanner"));
    }
    return parts.join(" ");
  }, [step, mobileOk, verifyYes, bankId, pinFlowOk, pin.length, pin2.length, percent, t]);

  const va = useVoiceAssistant({ lang, getText: voicePieces });

  const guideTone = useMemo(() => {
    if (step === 2 && mobileOk) return "success";
    if (step === 3 && verifyYes) return "success";
    if (step === 4 && pinFlowOk) return "success";
    if (step === 5) return "success";
    return "info";
  }, [step, mobileOk, verifyYes, pinFlowOk]);

  const guideMain = useMemo(() => {
    if (step === 1) return t("utS1Guide");
    if (step === 2) return mobileOk ? t("utS2GuideOk") : t("utS2Guide");
    if (step === 3) return verifyYes ? t("utS3GuideOk") : t("utS3Guide");
    if (step === 4) return pinFlowOk ? t("utS4GuideOk") : t("utS4Guide");
    return t("utS5Guide");
  }, [step, mobileOk, verifyYes, pinFlowOk, t]);

  const guideTip = useMemo(() => {
    if (step === 1) return t("utS1Tip");
    if (step === 2) return t("utS2Tip");
    if (step === 3) return verifyYes ? t("utS3Tip") : t("utS3Tip");
    if (step === 4) return t("utS4Tip");
    return t("utS5Footer");
  }, [step, verifyYes, t]);

  const canNext =
    (step === 1 && bankId) ||
    (step === 2 && mobileOk) ||
    (step === 3 && verifyYes) ||
    (step === 4 && pinFlowOk);

  const goNext = () => {
    if (!canNext) return;
    if (step < 5) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const onMobileInput = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(v);
  };

  const onPinInput = (setter) => (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setter(v);
  };

  const langLabel = LANG_NAMES[lang] || LANG_NAMES.EN;

  useEffect(() => {
    if (step !== 5) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const colors = ["#22c55e", "#3b82f6", "#facc15", "#fb923c", "#a855f7", "#06b6d4"];
    const burst = (opts) =>
      confetti({
        colors,
        ticks: 240,
        gravity: 0.95,
        ...opts,
      });

    burst({ particleCount: 130, spread: 78, origin: { y: 0.72 } });

    const t1 = window.setTimeout(() => {
      burst({ particleCount: 70, angle: 60, spread: 58, origin: { x: 0, y: 0.68 } });
      burst({ particleCount: 70, angle: 120, spread: 58, origin: { x: 1, y: 0.68 } });
    }, 200);

    const t2 = window.setTimeout(() => {
      burst({ particleCount: 100, spread: 110, decay: 0.9, scalar: 0.82, origin: { y: 0.58 } });
    }, 450);

    const t3 = window.setTimeout(() => {
      burst({ particleCount: 85, spread: 95, startVelocity: 32, origin: { y: 0.5 } });
    }, 700);

    const until = Date.now() + 2600;
    const iv = window.setInterval(() => {
      if (Date.now() > until) {
        window.clearInterval(iv);
        return;
      }
      burst({
        particleCount: 14,
        spread: 52,
        origin: { x: Math.random() * 0.2 + 0.4, y: Math.random() * 0.25 + 0.15 },
        startVelocity: 22,
      });
    }, 280);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearInterval(iv);
    };
  }, [step]);

  return (
    <div className="utPage">
      <div className="utBgOrbs" aria-hidden="true">
        <span className="utOrb utOrb1" />
        <span className="utOrb utOrb2" />
        <span className="utOrb utOrb3" />
      </div>
      <div className="utTopBar">
        <Link className="utBackLink" to="/modules/guided-sandbox">
          ← {t("backHome")}
        </Link>
      </div>

      <motion.header className="utHeader" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="utBrand">{t("utBrand")}</h1>
        <p className="utModuleSub">{t("utModuleTitle")}</p>
      </motion.header>

      <div className="utSandboxBanner" role="status">
        <div className="utSandboxIcon" aria-hidden="true">
          <Shield size={18} strokeWidth={2.2} />
        </div>
        <p className="utSandboxText">
          <span className="utWarnDot" aria-hidden="true">
            !
          </span>
          {t("utSandboxWarn")}
        </p>
      </div>

      <div className="utProgressRow">
        <span className="utStepLabel">{t("utStepOf").replace("{n}", String(step))}</span>
        <div className="utStepDots" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`utDot ${i < step ? "utDotDone" : ""} ${i === step ? "utDotCurrent" : ""} ${i > step ? "utDotTodo" : ""}`}
            >
              {i < step ? <Check size={14} strokeWidth={3} /> : i === step ? i : ""}
            </div>
          ))}
        </div>
        <span className="utPercent">{t("utPercentComplete").replace("{p}", String(percent))}</span>
      </div>

      <div className="utToolbar">
        <button type="button" className="utPillBtn" onClick={va.toggle} aria-label={t("utAudio")}>
          <Volume2 size={18} strokeWidth={2} />
          <span>{t("utAudio")}</span>
        </button>
        <button type="button" className="utPillBtn" onClick={openLanguage} aria-label={langLabel}>
          <span>{langLabel}</span>
          <Globe size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="utColumns">
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            className="utGuideCard"
            aria-labelledby="ut-guide-heading"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <motion.div
              className={`utMascot utMascot--${guideTone}`}
              animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
              transition={reduceMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FloatingMascot compact />
            </motion.div>
            <div className={`utBubble utBubble--${guideTone}`}>
              <div className="utBubbleMain">
                {guideTone === "success" ? (
                  <span className="utCheckMini" aria-hidden="true">
                    <Check size={16} strokeWidth={3} />
                  </span>
                ) : (
                  <Shield className="utShieldMini" size={18} strokeWidth={2} aria-hidden="true" />
                )}
                <p id="ut-guide-heading">{guideMain}</p>
              </div>
              <hr className="utBubbleRule" />
              <p className="utBubbleTip">
                <span className="utBulb" aria-hidden="true">
                  💡
                </span>
                <em>{guideTip}</em>
              </p>
            </div>
          </motion.section>
        </AnimatePresence>

        <section className="utPhoneWrap" aria-label="Phone preview">
          <motion.div
            className="utPhone"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.22 } }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="utPhoneInner"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="utPhoneBar">
                  <span>9:41</span>
                  <span className="utPhoneIcons" aria-hidden="true">
                    ▮▮▮▁
                  </span>
                </div>

                {step === 1 && (
                  <>
                    <div className="utScreen utScreenScroll">
                      <h2 className="utScreenTitle">{t("utBankTitle")}</h2>
                      <p className="utScreenSub">{t("utBankSub")}</p>
                      <ul className="utBankList">
                        {BANKS.map((b) => {
                          const sel = bankId === b.id;
                          return (
                            <li key={b.id}>
                              <button
                                type="button"
                                className={`utBankRow ${sel ? "utBankRow--sel" : ""}`}
                                onClick={() => setBankId(b.id)}
                              >
                                <span className="utBankIcon" style={{ background: b.color }}>
                                  <BankGlyph />
                                </span>
                                <span className="utBankName">{t(bankNameKey(b.id))}</span>
                                {sel ? (
                                  <span className="utBankCheck" aria-hidden="true">
                                    <Check size={16} strokeWidth={3} />
                                  </span>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="utToastOk">{t("utBankSelected")}</div>
                    </div>
                    <div className="utPhoneNav">
                      <button type="button" className="utNavBtn utNavBtn--ghost" disabled>
                        {t("utBack")}
                      </button>
                      <button type="button" className="utNavBtn utNavBtn--primary" onClick={goNext}>
                        {t("utNext")}
                      </button>
                    </div>
                  </>
                )}

              {step === 2 && (
                <div className="utScreen">
                  <h2 className="utScreenTitle">{t("utMobileTitle")}</h2>
                  <p className="utScreenSub">{t("utMobileSub")}</p>
                  <div className={`utField utFieldPhone ${mobileOk ? "utField--ok" : ""}`}>
                    <span className="utFieldIcon utFieldIconPhone">
                      <Smartphone size={20} strokeWidth={2} />
                    </span>
                    <div className="utFieldBody">
                      <label className="utFieldLbl" htmlFor="ut-mobile">
                        {t("utMobileLabel")}
                      </label>
                      <input
                        id="ut-mobile"
                        className="utFieldInput"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={t("utMobilePh")}
                        value={mobile}
                        onChange={onMobileInput}
                      />
                    </div>
                    {mobileOk ? (
                      <span className="utFieldCheck" aria-hidden="true">
                        <Check size={18} strokeWidth={3} />
                      </span>
                    ) : null}
                  </div>
                  {mobileOk ? <div className="utInlineOk">{t("utMobileValidated")}</div> : null}
                  <div className="utTipBox">{t("utMobileTip")}</div>
                  <div className="utPhoneNav">
                    <button type="button" className="utNavBtn utNavBtn--ghost" disabled={step <= 1} onClick={goBack}>
                      {t("utBack")}
                    </button>
                    <button type="button" className="utNavBtn utNavBtn--primary" disabled={!mobileOk} onClick={goNext}>
                      {t("utNext")}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="utScreen utScreenScroll">
                  <h2 className="utScreenTitle">{t("utVerifyTitle")}</h2>
                  <p className="utScreenSub">{t("utVerifySub")}</p>
                  <div className="utVerifyBox">
                    <div className="utDetailCard">
                      <span className="utDIcon utDIcon--blue">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 12a3 3 0 100-6 3 3 0 000 6zm0 2c-3.33 0-6 1.67-6 3v1h12v-1c0-1.33-2.67-3-6-3z" />
                        </svg>
                      </span>
                      <div>
                        <div className="utDLbl">{t("utLblHolder")}</div>
                        <div className="utDVal">{t("utDemoHolder")}</div>
                      </div>
                    </div>
                    <div className="utDetailCard">
                      <span className="utDIcon utDIcon--purple">
                        <BankGlyph />
                      </span>
                      <div>
                        <div className="utDLbl">{t("utLblBankName")}</div>
                        <div className="utDVal">{t(bankNameKey(bankId))}</div>
                      </div>
                    </div>
                    <div className="utDetailCard">
                      <span className="utDIcon utDIcon--green">#</span>
                      <div>
                        <div className="utDLbl">{t("utLblAccount")}</div>
                        <div className="utDVal">{t("utDemoAccount")}</div>
                      </div>
                    </div>
                  </div>
                  <p className="utVerifyQ">{t("utVerifyQuestion")}</p>
                  <div className="utYesNo">
                    <button type="button" className="utYn utYn--no" onClick={() => setVerifyYes(false)}>
                      {t("utBtnNo")}
                    </button>
                    <button type="button" className={`utYn utYn--yes ${verifyYes ? "utYn--yesOn" : ""}`} onClick={() => setVerifyYes(true)}>
                      {t("utBtnYes")}
                    </button>
                  </div>
                  <div className="utPhoneNav">
                    <button type="button" className="utNavBtn utNavBtn--ghost" onClick={goBack}>
                      {t("utBack")}
                    </button>
                    <button type="button" className="utNavBtn utNavBtn--primary" disabled={!verifyYes} onClick={goNext}>
                      {t("utNext")}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="utScreen utScreenScroll">
                  <h2 className="utScreenTitle">{t("utPinTitle")}</h2>
                  <p className="utScreenSub">{t("utPinSub")}</p>
                  <div className={`utField utFieldPin ${pa.okLen && pa.strongEnough ? "utField--ok" : pin.length ? "utField--focus" : ""}`}>
                    <span className="utFieldIcon utFieldIconLock">
                      <Lock size={18} strokeWidth={2} />
                    </span>
                    <div className="utFieldBody">
                      <label className="utFieldLbl" htmlFor="ut-pin1">
                        {t("utEnterPin")}
                      </label>
                      <input
                        id="ut-pin1"
                        className="utFieldInput utMono"
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="off"
                        value={pin}
                        onChange={onPinInput(setPin)}
                        maxLength={4}
                      />
                    </div>
                    <button type="button" className="utEye" onClick={() => setShowPin((s) => !s)} aria-label={showPin ? t("hidePin") : t("showPin")}>
                      <EyeIcon open={showPin} />
                    </button>
                  </div>
                  {pin.length === 4 ? (
                    <div className="utStrengthRow">
                      <div className={`utStrengthBar ${pa.strongEnough ? "utStrengthBar--on" : ""}`} />
                      <span className={pa.strongEnough ? "utStrongLbl" : "utWeakLbl"}>{pa.strongEnough ? t("utPinStrong") : t("utPinWeak")}</span>
                    </div>
                  ) : null}
                  <div className={`utField utFieldPin ${pinsMatch && pin2.length === 4 ? "utField--ok" : ""}`}>
                    <span className="utFieldIcon utFieldIconLock">
                      <Lock size={18} strokeWidth={2} />
                    </span>
                    <div className="utFieldBody">
                      <label className="utFieldLbl" htmlFor="ut-pin2">
                        {t("utConfirmPin")}
                      </label>
                      <input
                        id="ut-pin2"
                        className="utFieldInput utMono"
                        type={showPin2 ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="off"
                        value={pin2}
                        onChange={onPinInput(setPin2)}
                        maxLength={4}
                      />
                    </div>
                    {pinsMatch ? (
                      <span className="utFieldCheck" aria-hidden="true">
                        <Check size={18} strokeWidth={3} />
                      </span>
                    ) : (
                      <button type="button" className="utEye" onClick={() => setShowPin2((s) => !s)} aria-label={showPin2 ? t("hidePin") : t("showPin")}>
                        <EyeIcon open={showPin2} />
                      </button>
                    )}
                  </div>
                  {pinFlowOk ? <div className="utInlineOk">{t("utPinSuccess")}</div> : null}
                  <div className="utTipBox">{t("utPinTip")}</div>
                  <div className="utPhoneNav">
                    <button type="button" className="utNavBtn utNavBtn--ghost" onClick={goBack}>
                      {t("utBack")}
                    </button>
                    <button type="button" className="utNavBtn utNavBtn--primary" disabled={!pinFlowOk} onClick={goNext}>
                      {t("utNext")}
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="utScreen utScreen--celebrate">
                  <motion.div
                    className="utBigSuccess"
                    initial={{ scale: 0.45, opacity: 0, rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  >
                    <Check size={42} strokeWidth={3} className="utBigCheck" />
                    <span className="utSpark" aria-hidden="true">
                      ✦
                    </span>
                    <span className="utSpark utSpark2" aria-hidden="true">
                      ✦
                    </span>
                  </motion.div>
                  <motion.h2 className="utDoneTitle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                    {t("utPhoneCompleteTitle")}
                  </motion.h2>
                  <motion.p className="utDoneSub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    {t("utPhoneCompleteSub")}
                  </motion.p>
                  <div className="utStatusCard">
                    <div className="utStatusRow">
                      <span className="utSLbl">{t("utStatusLabel")}</span>
                      <span className="utSVal utSVal--green">{t("utStatusActive")}</span>
                    </div>
                    <div className="utStatusRow">
                      <span className="utSLbl">{t("utUpiIdLabel")}</span>
                      <span className="utSVal">{t("utDemoUpiId")}</span>
                    </div>
                    <div className="utStatusRow">
                      <span className="utSLbl">{t("utLinkedBankLabel")}</span>
                      <span className="utSVal">{t(bankNameKey(bankId))}</span>
                    </div>
                  </div>
                  <div className="utBannerBlue">
                    <span aria-hidden="true">🎉</span> {t("utTutorialDoneBanner")}
                  </div>
                  <Link className="utNavBtn utNavBtn--primary utNavBtn--block" to="/modules/guided-sandbox">
                    {t("utDoneHub")}
                  </Link>
                </div>
              )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? <Eye size={20} strokeWidth={2} /> : <EyeOff size={20} strokeWidth={2} />;
}
