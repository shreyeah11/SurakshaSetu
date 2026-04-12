import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModuleDecor from "../components/ModuleDecor";
import FloatingMascot from "../components/FloatingMascot";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";

function fakeName(file) {
  if (!file) return "";
  const base = file.name || "sample.jpg";
  const parts = base.split(".");
  const ext = parts.length > 1 ? parts.pop() : "jpg";
  return `${parts.join(".") || "sample"}.${ext}`;
}

const ID_LABEL_KEYS = {
  aadhaar: "kycIdAadhaarTitle",
  pan: "kycIdPanTitle",
  passport: "kycIdPassportTitle",
  voter: "kycIdVoterTitle",
};

export default function KycUpload({ lang, t }) {
  const navigate = useNavigate();
  const va = useVoiceAssistant({
    lang,
    getText: () =>
      [
        t("kycUploadTitle"),
        t("kycUploadSub"),
        t("kycUploadWarn"),
        t("kycUploadTipsTitle"),
        t("kycUploadTip1"),
        t("kycUploadTip2"),
        t("kycUploadTip3"),
        t("kycUploadTip4"),
        t("kycUploadPassportTitle"),
        t("kycUploadIdProof"),
        t("kycUploadAddrTitle"),
      ].join(". "),
  });

  const [passportPhoto, setPassportPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);

  const canSubmit = useMemo(() => !!(passportPhoto && idProof && addressProof), [passportPhoto, idProof, addressProof]);

  const idProofKey = sessionStorage.getItem("kyc.idProof") || "aadhaar";
  const idTypeLabel = t(ID_LABEL_KEYS[idProofKey] || "kycIdAadhaarTitle");

  return (
    <div className="moduleShell">
      <ModuleDecor variant="pink" />

      <div className="moduleTop">
        <Link className="backLink" to="/modules/kyc/address">
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
              ⬆️
            </div>
            <h1 className="stepTitle" style={{ marginTop: 18 }}>
              {t("kycUploadTitle")}
            </h1>
            <p className="stepSub" style={{ marginLeft: 0 }}>
              {t("kycUploadSub")}
            </p>

            <div className="stepHint warn" style={{ maxWidth: 760 }}>
              <span className="stepHintDot" aria-hidden="true" style={{ background: "rgba(255, 170, 60, 0.8)" }} />
              <span>{t("kycUploadWarn")}</span>
            </div>

            <div className="tipBox">
              <div className="tipTitle">
                <span aria-hidden="true">🛡️</span>
                <span>{t("kycUploadTipsTitle")}</span>
              </div>
              <ul className="tipList">
                <li>{t("kycUploadTip1")}</li>
                <li>{t("kycUploadTip2")}</li>
                <li>{t("kycUploadTip3")}</li>
                <li>{t("kycUploadTip4")}</li>
              </ul>
            </div>

            <div className="uploadList">
              <div className="uploadItem">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div aria-hidden="true" style={{ fontSize: 22 }}>
                    📷
                  </div>
                  <div className="uploadMeta">
                    <div className="uploadTitle">{t("kycUploadPassportTitle")}</div>
                    <div className="uploadSub">{passportPhoto ? fakeName(passportPhoto) : t("kycUploadPassportSub")}</div>
                  </div>
                </div>
                <label className="uploadBar">
                  {passportPhoto ? t("kycUploadBtnPhotoDone") : t("kycUploadBtnPhoto")}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setPassportPhoto(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="uploadItem">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div aria-hidden="true" style={{ fontSize: 22 }}>
                    🧾
                  </div>
                  <div className="uploadMeta">
                    <div className="uploadTitle">
                      {t("kycUploadIdProof")} ({idTypeLabel})
                    </div>
                    <div className="uploadSub">{idProof ? fakeName(idProof) : t("kycUploadIdSub")}</div>
                  </div>
                </div>
                <label className="uploadBar">
                  {idProof ? t("kycUploadBtnIdDone") : t("kycUploadBtnId")}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setIdProof(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="uploadItem">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div aria-hidden="true" style={{ fontSize: 22 }}>
                    📍
                  </div>
                  <div className="uploadMeta">
                    <div className="uploadTitle">{t("kycUploadAddrTitle")}</div>
                    <div className="uploadSub">{addressProof ? fakeName(addressProof) : t("kycUploadAddrSub")}</div>
                  </div>
                </div>
                <label className="uploadBar">
                  {addressProof ? t("kycUploadBtnAddrDone") : t("kycUploadBtnAddr")}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setAddressProof(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="moduleCtaRow">
              <button
                className="gradBtn pink soft"
                type="button"
                disabled={!canSubmit}
                onClick={() => navigate("/modules/kyc/complete")}
                style={{ opacity: canSubmit ? 1 : 0.55, cursor: canSubmit ? "pointer" : "not-allowed" }}
              >
                {t("kycUploadSubmit")}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
