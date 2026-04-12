import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";

export default function GuardianAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === "/signup";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const goMode = (signup) => {
    setErr("");
    navigate(signup ? "/signup" : "/login", { replace: true });
  };

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const url = isSignup ? "/api/auth/register" : "/api/auth/login";
      const body = isSignup ? { phone, password, fullName, dob } : { phone, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {
          error:
            raw?.slice(0, 180) ||
            (res.status === 404
              ? "API not found — start the server (npm run dev in suraksha-setu/server) and use the Vite dev URL so /api proxies to port 5000."
              : `Server error (${res.status})`),
        };
      }
      if (!res.ok) {
        setErr(data.error || data.message || `Request failed (${res.status})`);
        return;
      }
      if (data.token) localStorage.setItem("gp_token", data.token);
      if (data.user) localStorage.setItem("gp_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("suraksha-auth-change"));
      navigate("/", { replace: true });
    } catch {
      setErr("Network error — is the API server running on port 5000?");
    } finally {
      setBusy(false);
    }
  }

  const formValid = isSignup
    ? phone.replace(/\D/g, "").length >= 10 &&
        password.length >= 6 &&
        fullName.trim().length >= 2 &&
        dob.trim().length >= 8
    : phone.replace(/\D/g, "").length >= 10 && password.length >= 1;

  return (
    <div className="gpAuthRoot">
      <div className="gpAuthSplit">
        <aside className="gpAuthLeft">
          <div className="gpBrandRow">
            <div className="gpBrandLogo" aria-hidden="true">
              <Shield size={26} strokeWidth={2.2} color="#0284c7" />
            </div>
            <div>
              <div className="gpBrandName">SurakshaSetu</div>
              <div className="gpBrandTag">Stay Safe Online</div>
            </div>
          </div>

          <h2 className="gpHowTitle">{isSignup ? "How to sign up for SurakshaSetu" : "How to log in to SurakshaSetu"}</h2>

          {isSignup ? (
            <div className="gpStepCard">
              <div className="gpStepBadge">3</div>
              <h3>Select Your Date of Birth</h3>
              <p>Click the field and select your birth date.</p>
              <div className="gpMockField">Choose month, day, and year.</div>
            </div>
          ) : null}

          <div className="gpTipCard" style={{ marginTop: isSignup ? 14 : 0 }}>
            <div className="gpTipTitle">💡 Helpful Tip</div>
            <p className="gpTipBody">
              Take your time! There&apos;s no rush. Fill in each field carefully and we&apos;ll guide you through every
              step.
            </p>
          </div>
        </aside>

        <section className="gpAuthRight">
          <Link className="gpBack" to="/">
            ← Back to SurakshaSetu
          </Link>

          <div className="gpHeroIcon" aria-hidden="true">
            <Shield size={36} strokeWidth={2} />
          </div>

          <div className="gpWelcome">
            <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p>{isSignup ? "Sign up in SurakshaSetu — fill in the form below" : "Log in to SurakshaSetu — fill in the form below"}</p>
          </div>

          <div className="gpToggle" role="tablist" aria-label="Login or sign up in SurakshaSetu">
            <button type="button" className={!isSignup ? "gpToggleOn" : "gpToggleOff"} onClick={() => goMode(false)}>
              Login in SurakshaSetu
            </button>
            <button type="button" className={isSignup ? "gpToggleOn" : "gpToggleOff"} onClick={() => goMode(true)}>
              Sign up in SurakshaSetu
            </button>
          </div>

          {err ? <div className="gpErr">{err}</div> : null}

          <form onSubmit={submit}>
            {isSignup ? (
              <div className="gpField">
                <label htmlFor="gp-full">Full Name</label>
                <input
                  id="gp-full"
                  className="gpInput"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            ) : null}

            <div className="gpField">
              <label htmlFor="gp-phone">Phone Number</label>
              <input
                id="gp-phone"
                className="gpInput"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {isSignup ? <p className="gpFieldHint">Example: 9876543210 (10-digit Indian mobile)</p> : null}
            </div>

            {isSignup ? (
              <div className="gpField">
                <label htmlFor="gp-dob">Date of Birth</label>
                <input
                  id="gp-dob"
                  className="gpInput"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            ) : null}

            <div className="gpField">
              <label htmlFor="gp-pw">{isSignup ? "Create Password" : "Password"}</label>
              <div className="gpInputWrap">
                <input
                  id="gp-pw"
                  className="gpInput"
                  style={{ paddingRight: 44 }}
                  type={showPw ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder={isSignup ? "Create a strong password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="gpEyeBtn"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isSignup ? <p className="gpFieldHint">At least 6 characters</p> : null}
            </div>

            <button type="submit" className="gpSubmit" disabled={!formValid || busy}>
              <CheckCircle2 size={22} strokeWidth={2.2} aria-hidden />
              {isSignup ? "Create account in SurakshaSetu" : "Login to SurakshaSetu"}
            </button>
          </form>

          <div className="gpFooterLink">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => goMode(false)}>
                  Login
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => goMode(true)}>
                  Sign Up
                </button>
              </>
            )}
          </div>

          <div className="gpSecureBar">
            <Shield size={18} aria-hidden />
            Your information is safe and secure
          </div>
        </section>
      </div>
    </div>
  );
}
