import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Fingerprint,
  KeyRound,
  Lock,
  ScanEye,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const VIDEOS = [
  {
    title: "Cyber Security Basics for Beginners",
    channel: "National Cyber Crime",
    views: "1.2M views",
    thumb:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    url: "https://www.youtube.com/watch?v=AetH9AXUCZY",
  },
  {
    title: "How to Identify Phishing Attacks",
    channel: "Cyber Safety India",
    views: "850K views",
    thumb:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    url: "https://www.youtube.com/watch?v=cWWkZgXqmd8",
  },
  {
    title: "Protecting Your Personal Data Online",
    channel: "Digital India",
    views: "2.1M views",
    thumb:
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=900&q=80",
    url: "https://www.youtube.com/watch?v=T5h-pMsScjE",
  },
  {
    title: "Social Media Security Tips",
    channel: "Cyber Police",
    views: "675K views",
    thumb:
      "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=900&q=80",
    url: "https://www.youtube.com/watch?v=eBsfCSZh9aM",
  },
];

const HELPLINES = [
  {
    title: "National Cyber Crime Reporting Portal",
    sub: "Report cybercrimes and track your complaint status online",
    icon: "🚨",
    href: "https://cybercrime.gov.in/",
  },
  {
    title: "Cyber Help Desk",
    sub: "Get assistance from cyber experts 24/7",
    icon: "🗨️",
    href: "https://www.cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx",
  },
  {
    title: "Financial Fraud Reporting",
    sub: "Report financial frauds and online banking scams",
    icon: "💳",
    href: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53822",
  },
  {
    title: "National Cyber Crime Helpline — 1930",
    sub: "Dial 1930 24×7 to report online financial fraud and get guidance",
    icon: "📞",
    href: "tel:1930",
  },
];

const STEPS = [
  {
    title: "Open the portal",
    sub: "Visit cybercrime.gov.in — National Cyber Crime Reporting Portal homepage.",
    cardTip: "Bookmark the official site; avoid look-alike links.",
    emoji: "🔒",
    image: "/raksha-tutorial/step-1.png",
    pageUrl: "https://cybercrime.gov.in/",
  },
  {
    title: "Register a complaint",
    sub: "Use the menu: Register a Complaint → choose Financial Fraud, Other Cyber Crime, or the category that fits your case.",
    cardTip: "Choose the path that matches your incident.",
    emoji: "⚠️",
    image: "/raksha-tutorial/step-2.png",
    pageUrl: "https://cybercrime.gov.in/",
  },
  {
    title: "Choose category",
    sub: "Select the right category (e.g. Other Cyber Crime) and continue.",
    cardTip: "Read each option carefully before you tap Register.",
    emoji: "⚡",
    image: "/raksha-tutorial/step-3.png",
    pageUrl: "https://cybercrime.gov.in/Webform/Index.aspx",
  },
  {
    title: "File a complaint",
    sub: "Review the filing information, then tap File a complaint when you are ready.",
    cardTip: "You can open Learn about cyber crime first if you need context.",
    emoji: "🛡️",
    image: "/raksha-tutorial/step-4.png",
    pageUrl: "https://cybercrime.gov.in/Webform/Accept.aspx",
  },
  {
    title: "Submit details",
    sub: "Complete mandatory fields, solve captcha if shown, then use the green Submit button.",
    cardTip: "Save your acknowledgement / reference number after submit.",
    emoji: "✅",
    image: "/raksha-tutorial/step-5.png",
    pageUrl: "https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx",
  },
];

export default function CyberPolice() {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const step = useMemo(() => STEPS[activeStep], [activeStep]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [autoPlay]);

  return (
    <div className="cpPage">
      <div className="cpJailGrid" aria-hidden="true" />
      <div className="cpFloatLayer" aria-hidden="true">
        <Shield className="cpShield cpShieldSvg s1" strokeWidth={1.35} />
        <Lock className="cpShield cpShieldSvg s2" strokeWidth={1.35} />
        <ShieldCheck className="cpShield cpShieldSvg s3" strokeWidth={1.35} />
        <KeyRound className="cpShield cpShieldSvg s4" strokeWidth={1.35} />
        <Fingerprint className="cpShield cpShieldSvg s5" strokeWidth={1.35} />
        <Shield className="cpShield cpShieldSvg s6" strokeWidth={1.35} />
        <ScanEye className="cpShield cpShieldSvg s7" strokeWidth={1.35} />
        <BadgeCheck className="cpShield cpShieldSvg s8" strokeWidth={1.35} />
        <Lock className="cpShield cpShieldSvg s9" strokeWidth={1.35} />
        <ShieldCheck className="cpShield cpShieldSvg s10" strokeWidth={1.35} />
        <KeyRound className="cpShield cpShieldSvg s11" strokeWidth={1.35} />
        <Fingerprint className="cpShield cpShieldSvg s12" strokeWidth={1.35} />
      </div>
      <div className="cpWrap">
        <div className="cpTop">
          <Link className="cpBack" to="/">
            ← Back
          </Link>
        </div>

        <header className="cpHead">
          <h1 className="cpTitle">RakshaDesk</h1>
          <p className="cpSub">
            Your trusted resource for cyber safety education, helplines, and complaint registration.
            <br />
            Stay protected in the digital world.
          </p>
        </header>

        <section className="cpSection">
          <h2 className="cpSecTitle">Learn</h2>
          <p className="cpSecSub">Educational resources to stay cyber safe</p>
          <div className="cpVideoGrid">
            {VIDEOS.map((v) => (
              <a key={v.url} className="cpVideoCard" href={v.url} target="_blank" rel="noreferrer">
                <div className="cpThumb" style={{ backgroundImage: `url(${v.thumb})` }}>
                  <span className="cpPlay">▶</span>
                </div>
                <div className="cpVTitle">{v.title}</div>
                <div className="cpVMeta">{v.channel}</div>
                <div className="cpVMeta">{v.views}</div>
              </a>
            ))}
          </div>
        </section>

        <section className="cpSection">
          <h2 className="cpSecTitle">Helplines</h2>
          <p className="cpSecSub">Quick access to cyber complaint services</p>
          <div className="cpHelpGrid">
            {HELPLINES.map((h) => (
              <a key={h.title} className="cpHelpCard" href={h.href} target="_blank" rel="noreferrer">
                <div className="cpHelpIcon" aria-hidden="true">
                  {h.icon}
                </div>
                <div>
                  <div className="cpHelpTitle">
                    {h.title} <span aria-hidden="true">↗</span>
                  </div>
                  <div className="cpHelpSub">{h.sub}</div>
                </div>
                <div className="cpOnlineDot" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="cpSection">
          <h2 className="cpSecTitle">Report Complaint</h2>
          <p className="cpSecSub">Step-by-step guide to file your cyber crime complaint</p>
          <div className="cpReport">
            <aside
              className="cpPhoneMock"
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
            >
              <div className="cpPhoneTop" />
              <div className="cpPhoneStep" aria-live="polite">
                <span>
                  Step {activeStep + 1} of {STEPS.length}
                </span>
                <strong>{step.title}</strong>
              </div>
              <div className="cpBrowserChrome">
                <div className="cpBrowserStatus" aria-hidden="true">
                  <span className="cpBrowserTime">9:41</span>
                  <span className="cpBrowserIcons">
                    <span className="cpSig" />
                    <span className="cpWifi" />
                    <span className="cpBatt" />
                  </span>
                </div>
                <div className="cpUrlBar" role="group" aria-label={`Page address: ${step.pageUrl}`}>
                  <span className="cpUrlLock" title="Connection is secure">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 2a4 4 0 00-4 4v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm-2 7V6a2 2 0 114 0v3h-4z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <p className="cpUrlText">{step.pageUrl}</p>
                </div>
              </div>
              <div className="cpPhoneViewport">
                <div className="cpPhoneTrack" style={{ transform: `translateX(-${activeStep * 20}%)` }}>
                  {STEPS.map((s, idx) => (
                    <section className="cpPhoneScreen" key={s.title} aria-hidden={idx !== activeStep}>
                      <div className="cpPhoneImgWrap">
                        <img
                          className="cpPhoneShot"
                          src={s.image}
                          alt={`cybercrime.gov.in — ${s.title}`}
                          loading={idx === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </div>
                    </section>
                  ))}
                </div>
              </div>
              <p className="cpPhoneSub">{step.sub}</p>
              <div className="cpPhoneTip">{step.cardTip}</div>
              <div className="cpPhoneDots" role="tablist" aria-label="Tutorial step">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === activeStep}
                    aria-label={`Step ${i + 1}`}
                    className={`cpPhoneDot ${i === activeStep ? "on" : ""}`}
                    onClick={() => setActiveStep(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="cpAutoBtn"
                onClick={() => setAutoPlay((v) => !v)}
                aria-label={autoPlay ? "Pause auto step preview" : "Resume auto step preview"}
              >
                {autoPlay ? "⏸ Auto" : "▶ Auto"}
              </button>
            </aside>

            <div className="cpSteps">
              {STEPS.map((s, idx) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`cpStepRow ${idx === activeStep ? "on" : ""}`}
                >
                  <div className="cpStepNum">{idx + 1}</div>
                  <div className="cpStepBody">
                    <div className="cpStepTitle">
                      {idx === activeStep ? `${s.emoji} ` : ""}
                      {s.title}
                    </div>
                    <div className="cpStepSub">{s.sub}</div>
                  </div>
                  <div className="cpStepArrow">›</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="cpFooter">
          <p className="cpFooterTagline">
            <strong>Think before you click. Verify before you trust — awareness is your strongest firewall.</strong>
          </p>
          <div className="cpFooterHelplines">
            <h3 className="cpFooterTitle">Helpline numbers — India (cyber)</h3>
            <ul className="cpFooterList">
              <li>
                <strong>National Cyber Crime Helpline:</strong>{" "}
                <a href="tel:1930" className="cpFooterLink">
                  1930
                </a>{" "}
                (24×7 — online financial fraud &amp; cybercrime guidance)
              </li>
              <li>
                <strong>Report online:</strong>{" "}
                <a href="https://cybercrime.gov.in/" className="cpFooterLink" target="_blank" rel="noreferrer">
                  cybercrime.gov.in
                </a>{" "}
                — National Cyber Crime Reporting Portal
              </li>
              <li>
                <strong>Regional / state cyber cells:</strong> visit your{" "}
                <strong>State Police official website</strong> and look for &quot;Cyber Crime&quot; or &quot;Cyber Cell&quot;
                for local numbers and email IDs; many states publish district-wise contacts.
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}

