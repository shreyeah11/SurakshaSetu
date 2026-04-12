import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import MaskedInput from "../components/MaskedInput";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

function onlyDigits(s) {
  return (s || "").replace(/\D+/g, "");
}

/** Stored format dd-mm-yyyy → yyyy-mm-dd for <input type="date"> */
function ddmmyyyyToIso(s) {
  if (!s || !/^\d{2}-\d{2}-\d{4}$/.test(s)) return "";
  const [dd, mm, yyyy] = s.split("-");
  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return "";
  return `${yyyy}-${mm}-${dd}`;
}

function isoToDdmmyyyy(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function isValidDobIso(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [ys, ms, ds] = iso.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return false;
  if (y < 1900 || y > 2100) return false;
  const cap = new Date();
  cap.setHours(23, 59, 59, 999);
  if (dt > cap) return false;
  return true;
}

const dobMax = new Date().toISOString().slice(0, 10);

export default function KycPersonal({ lang, t }) {
  const navigate = useNavigate();
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [
        t("kycPersonalTitle"),
        t("kycPersonalSub"),
        t("kycPersonalHint"),
        t("kycLblFullName"),
        t("kycLblDob"),
        t("kycLblGender"),
        t("kycLblPhone"),
        t("kycLblAadhaar"),
      ].join(". "),
  });

  const [name, setName] = useState(sessionStorage.getItem("kyc.name") || "");
  const [dobIso, setDobIso] = useState(() => ddmmyyyyToIso(sessionStorage.getItem("kyc.dob") || "") || "");
  const [gender, setGender] = useState(sessionStorage.getItem("kyc.gender") || "");
  const [email, setEmail] = useState(sessionStorage.getItem("kyc.email") || "");
  const [phone, setPhone] = useState(sessionStorage.getItem("kyc.phone") || "");
  const [aadhaar, setAadhaar] = useState(sessionStorage.getItem("kyc.aadhaar") || "");

  const errors = useMemo(() => {
    const e = {};
    if (!name.trim()) e.name = t("kycErrName");
    if (!isValidDobIso(dobIso)) e.dob = t("kycErrDob");
    if (!gender) e.gender = t("kycErrGender");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t("kycErrEmail");
    const p = onlyDigits(phone);
    if (p && p.length !== 10) e.phone = t("kycErrPhone");
    const a = onlyDigits(aadhaar);
    if (!a || a.length !== 12) e.aadhaar = t("kycErrAadhaar");
    return e;
  }, [name, dobIso, gender, email, phone, aadhaar, t]);

  const canContinue = Object.keys(errors).length === 0;

  return (
    <div className="moduleShell">
      <ModuleDecor variant="pink" />

      <div className="moduleTop">
        <Link className="backLink" to="/modules/kyc/id-proof">
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
        <div className="seg" />
      </div>

      <div className="moduleLayout">
        <aside className="mascotSpace" aria-hidden="true">
          <FloatingMascot />
        </aside>

        <main className="moduleCardWrap">
          <div className="moduleCard wide left">
            <div className="stepIconTop" aria-hidden="true">
              👤
            </div>
            <h1 className="stepTitle" style={{ marginTop: 18 }}>
              {t("kycPersonalTitle")}
            </h1>
            <p className="stepSub" style={{ marginLeft: 0 }}>
              {t("kycPersonalSub")}
            </p>

            <div className="stepHint" style={{ maxWidth: 760 }}>
              <span className="stepHintDot" aria-hidden="true" />
              <span>{t("kycPersonalHint")}</span>
            </div>

            <div className="formGrid">
              <div className="field span2">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblFullName")} <span className="fieldReq">*</span>
                  </div>
                  {errors.name && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.name}</div>}
                </div>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("kycPhFullName")} />
              </div>

              <div className="field">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblDob")} <span className="fieldReq">*</span>
                  </div>
                  {errors.dob && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.dob}</div>}
                </div>
                <input
                  className="input inputDate"
                  type="date"
                  value={dobIso}
                  min="1900-01-01"
                  max={dobMax}
                  onChange={(e) => setDobIso(e.target.value)}
                  aria-label={t("kycLblDob")}
                />
              </div>

              <div className="field">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblGender")} <span className="fieldReq">*</span>
                  </div>
                  {errors.gender && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.gender}</div>}
                </div>
                <select className="select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">{t("kycGenderSelect")}</option>
                  <option value="female">{t("kycGenderFemale")}</option>
                  <option value="male">{t("kycGenderMale")}</option>
                  <option value="other">{t("kycGenderOther")}</option>
                  <option value="prefer_not">{t("kycGenderPreferNot")}</option>
                </select>
              </div>

              <div className="field span2">
                <div className="labelRow">
                  <div className="fieldLabel">{t("kycLblEmail")}</div>
                  {errors.email && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.email}</div>}
                </div>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("kycPhEmail")} />
              </div>

              <div className="field span2">
                <div className="labelRow">
                  <div className="fieldLabel">{t("kycLblPhone")}</div>
                  {errors.phone && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.phone}</div>}
                </div>
                <MaskedInput
                  className="input"
                  value={phone}
                  onChange={setPhone}
                  placeholder={t("kycPhPhone")}
                  maxLength={10}
                  aria-label={t("kycLblPhone")}
                />
                <div className="helperRow">
                  <span>{t("kycPhoneHelp")}</span>
                </div>
              </div>

              <div className="field span2">
                <div className="labelRow">
                  <div className="fieldLabel">
                    {t("kycLblAadhaar")} <span className="fieldReq">*</span>
                  </div>
                  {errors.aadhaar && <div style={{ color: "rgba(220,38,38,.75)", fontWeight: 900, fontSize: 12 }}>{errors.aadhaar}</div>}
                </div>
                <MaskedInput
                  className="input"
                  value={aadhaar}
                  onChange={setAadhaar}
                  placeholder={t("kycPhAadhaar")}
                  maxLength={12}
                  aria-label={t("kycLblAadhaar")}
                />
                <div className="helperRow">
                  <span>{t("kycAadhaarHelp")}</span>
                </div>
              </div>
            </div>

            <div className="moduleCtaRow">
              <button
                className="gradBtn pink soft"
                type="button"
                disabled={!canContinue}
                onClick={() => {
                  sessionStorage.setItem("kyc.name", name);
                  sessionStorage.setItem("kyc.dob", isoToDdmmyyyy(dobIso));
                  sessionStorage.setItem("kyc.gender", gender);
                  sessionStorage.setItem("kyc.email", email);
                  sessionStorage.setItem("kyc.phone", onlyDigits(phone));
                  sessionStorage.setItem("kyc.aadhaar", onlyDigits(aadhaar));
                  navigate("/modules/kyc/address");
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
