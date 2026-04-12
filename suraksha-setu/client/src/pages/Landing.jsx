import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, UserCircle } from "lucide-react";
import { displayNameForWelcome } from "../lib/userDisplay.js";
import { ProfilePanel } from "./Profile.jsx";

const LANG_LABEL = { EN: "English", HI: "हिन्दी", MR: "मराठी", ES: "Español", FR: "Français", AR: "العربية" };

export default function Landing({ lang, setLang, t, sessionUser, refreshSession }) {
  const [langOpen, setLangOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cyberStats, setCyberStats] = useState(null);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const welcomeName = sessionUser ? displayNameForWelcome(sessionUser) || "User" : "";

  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const openProfile = useCallback(() => {
    setNavOpen(false);
    setProfileOpen(true);
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("gp_token");
      localStorage.removeItem("gp_user");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("suraksha-auth-change"));
    navigate("/", { replace: true });
  };

  const go = (path) => {
    setNavOpen(false);
    navigate(path);
  };

  useEffect(() => {
    function onDocClick() {
      setLangOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setLangOpen(false);
    }
    if (langOpen) {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }
  }, [langOpen]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/cyber-stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!cancelled) setCyberStats(d);
      })
      .catch(() => {
        if (!cancelled) setCyberStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    function onDocClick(e) {
      const bar = document.querySelector(".landingNavBar");
      if (bar && !bar.contains(e.target)) setNavOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setNavOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  useEffect(() => {
    if (!sessionUser) setProfileOpen(false);
  }, [sessionUser]);

  useEffect(() => {
    if (!profileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    function onKey(e) {
      if (e.key === "Escape") closeProfile();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [profileOpen, closeProfile]);

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefersCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || prefersCoarse) return;

    const root = rootRef.current || document;
    const elements = Array.from(root.querySelectorAll("[data-tilt]"));
    if (!elements.length) return;

    const max = 10;
    const damp = 18;

    function onMove(e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * -max;
      const ry = (x - 0.5) * max;
      this.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      this.style.transition = "transform 40ms linear";
    }

    function onLeave() {
      this.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      this.style.transition = `transform ${damp * 10}ms ease`;
    }

    elements.forEach((el) => {
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    });
    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current || document;
    const cards = Array.from(root.querySelectorAll(".motionCard"));
    if (!cards.length) return;

    if (prefersReduced) {
      cards.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    root.querySelectorAll("[data-motion-group]").forEach((group) => {
      const kids = Array.from(group.querySelectorAll(".motionStagger"));
      kids.forEach((el, idx) => el.style.setProperty("--stagger", `${idx * 110}ms`));
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "20px 0px -10% 0px" },
    );

    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const onAnchor = (e, id) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const langItems = useMemo(() => ["EN", "HI", "MR", "ES", "FR", "AR"], []);

  return (
    <div ref={rootRef}>
      <div className="wrap">
        <div className="topbar landingTopNav" role="banner">
          <nav className="nav landingNavBar" aria-label="Main" data-nav-open={navOpen ? "true" : "false"}>
            <a
              className="brand"
              href="#home"
              aria-label="SurakshaSetu"
              onClick={(e) => {
                onAnchor(e, "#home");
                setNavOpen(false);
              }}
            >
              <span className="logo" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2.8c3.2 2.3 6.2 2.6 8.2 2.9V12c0 5.4-3.7 8.8-8.2 9.9C7.5 20.8 3.8 17.4 3.8 12V5.7c2-.3 5-.6 8.2-2.9Z"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.7 12.2 10.8 14.3 15.7 9.4"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{t("brand")}</span>
            </a>

            <div id="landing-nav-links" className="navlinks" role="navigation" aria-label="Site sections">
              <a
                href="#home"
                onClick={(e) => {
                  onAnchor(e, "#home");
                  setNavOpen(false);
                }}
              >
                {t("navHome")}
              </a>
              <a
                href="/challenge"
                onClick={(e) => {
                  e.preventDefault();
                  go("/challenge");
                }}
              >
                {t("navLearn")}
              </a>
              <a
                href="/modules/guided-sandbox"
                onClick={(e) => {
                  e.preventDefault();
                  go("/modules/guided-sandbox");
                }}
              >
                {t("navPractice")}
              </a>
              <a
                href="/setu-connect"
                className="navLinkSetu"
                onClick={(e) => {
                  e.preventDefault();
                  go("/setu-connect");
                }}
              >
                {t("navSetuConnect")}
              </a>
            </div>

            <div className="navCluster">
              <button
                type="button"
                className="navMenuBtn"
                aria-label={navOpen ? "Close menu" : "Open menu"}
                aria-expanded={navOpen ? "true" : "false"}
                aria-controls="landing-nav-links"
                data-menu-open={navOpen ? "true" : "false"}
                onClick={() => setNavOpen((v) => !v)}
              >
                {/* Fixed 3-bar SVG — same shape when open/closed (reliable in Edge vs CSS pseudo “X” morph) */}
                <span className="navMenuIconSvg" aria-hidden="true">
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1 2.5h20M1 9h20M1 15.5h20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              </button>
              <div className="navright">
                <div className="lang" data-open={langOpen ? "true" : "false"} onClick={(e) => e.stopPropagation()}>
                  <button
                    className="pill"
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={langOpen ? "true" : "false"}
                    onClick={() => setLangOpen((v) => !v)}
                  >
                    <span aria-hidden="true">🌐</span>
                    <span>{LANG_LABEL[lang] || LANG_LABEL.EN}</span>
                    <span aria-hidden="true">▾</span>
                  </button>
                  <div className="langmenu" role="menu" aria-label="Language">
                    {langItems.map((code) => (
                      <button
                        key={code}
                        className="langitem"
                        role="menuitemradio"
                        type="button"
                        aria-selected={code === lang ? "true" : "false"}
                        onClick={() => {
                          setLang(code);
                          setLangOpen(false);
                        }}
                      >
                        <span>{LANG_LABEL[code] || code}</span>
                        <span aria-hidden="true">{code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {sessionUser ? (
                  <>
                    <span className="landingWelcome" title={`Signed in as ${welcomeName}`}>
                      Welcome, <strong>{welcomeName}</strong>
                    </span>
                    <button
                      type="button"
                      className="landingProfileBtn"
                      onClick={openProfile}
                      aria-label="Open your profile"
                      title="Profile"
                    >
                      <UserCircle size={22} strokeWidth={2} aria-hidden />
                    </button>
                    <button type="button" className="landingLogoutBtn" onClick={logout} aria-label="Log out" title="Log out">
                      <LogOut size={18} strokeWidth={2} aria-hidden />
                    </button>
                  </>
                ) : (
                  <button className="btn" type="button" onClick={() => navigate("/login")}>
                    {t("navLogin")}
                  </button>
                )}
              </div>
            </div>
          </nav>
        </div>

        <main id="home" className="hero">
          <div className="orbs" aria-hidden="true">
            <div className="orb o1 float" />
            <div className="orb o2 float2" />
            <div className="orb o3 float3" />
          </div>

          <div className="heroDecor" aria-hidden="true">
            <div className="decorItem di1 float">
              <div className="decorIcon" />
            </div>
            <div className="decorItem di2 float2">
              <div className="decorIcon" />
            </div>
            <div className="decorItem di3 float3">
              <div className="decorIcon" />
            </div>
            <div className="decorItem shield di4">
              <div className="decorShield">🛡️</div>
            </div>
            <div className="decorItem shield di5">
              <div className="decorShield">🛡️</div>
            </div>
            <div className="decorItem orbDot di6" />
            <div className="decorItem orbDot di7" />
            <div className="decorItem orbDot di8" />
          </div>

          <div className="heroBadge">
            <span aria-hidden="true">✨</span>
            <span>{t("badge1")}</span>
          </div>

          <div className="heroTitle" aria-label="SurakshaSetu">
            {t("heroTitle")}
          </div>

          <p className="heroSub">{t("heroSub")}</p>

          <div className="heroBadge2">
            <span aria-hidden="true">🛡️</span>
            <span>{t("badge2")}</span>
          </div>

          <div className="ctaRow">
            <a className="btn" href="#detect" onClick={(e) => onAnchor(e, "#detect")}>
              {t("ctaPrimary")}
            </a>
            <a className="btn ctaGhost" href="#learn" onClick={(e) => onAnchor(e, "#learn")}>
              {t("ctaSecondary")}
            </a>
          </div>
        </main>

        <section id="learn" className="section">
          <div className="sectionTitle">{t("tripleTitle")}</div>
          <p className="sectionSub">{t("tripleSub")}</p>

          <div className="cards" data-motion-group="true">
            <article className="card feature float motionCard motionStagger" data-feature="guided">
              <div className="tiltLayer" data-tilt="true">
                <div className="cardInner">
                  <div className="cardIcon" aria-hidden="true">🎮</div>
                  <div className="cardTitle">{t("card1Title")}</div>
                  <div className="cardText">{t("card1Text")}</div>
                  <div className="moduleLinkRow">
                    <button type="button" className="linkBtn" onClick={() => navigate("/modules/guided-sandbox")} aria-label="Start Guided Sandbox Simulation">
                      {t("startSimulation")} →
                    </button>
                  </div>
                  <div className="cardArt guidedArt" aria-hidden="true">
                    <div className="mockPhone big" />
                    <div className="mockSide shield" />
                    <div className="mockLine long" />
                    <div className="mockScreen s1" />
                    <div className="mockScreen s2" />
                    <div className="mockShieldBadge" />
                  </div>
                  <div className="cardTag">
                    <span aria-hidden="true">●</span>
                    <span>{t("activeProtection")}</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="card feature float2 motionCard motionStagger" data-feature="redflag">
              <div className="tiltLayer" data-tilt="true">
                <div className="cardInner">
                  <div className="cardIcon" aria-hidden="true">👁</div>
                  <div className="cardTitle">{t("card2Title")}</div>
                  <div className="cardText">{t("card2Text")}</div>
                  <div className="moduleLinkRow">
                    <button type="button" className="linkBtn" onClick={() => navigate("/challenge")} aria-label="Start Red Flag Detector Simulation">
                      {t("ctaTrickTrap")}
                    </button>
                  </div>
                  <div className="cardArt redflagArt" aria-hidden="true">
                    <div className="rfLeftIcon" />
                    <div className="rfPanel">
                      <div className="rfRow bad">
                        <span className="rfTitle">Unknown Sender</span>
                        <span className="rfDot red" />
                      </div>
                      <div className="rfRow good">
                        <span className="rfTitle">Verified Sender</span>
                        <span className="rfDot green" />
                      </div>
                    </div>
                    <div className="miniBadge">
                      <span aria-hidden="true">●</span>
                      <span>{t("activeProtection")}</span>
                    </div>
                  </div>
                  <div className="cardTag">
                    <span aria-hidden="true">●</span>
                    <span>{t("activeProtection")}</span>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="card feature float3 motionCard motionStagger"
              data-feature="accessible"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/cyber-police")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/cyber-police");
                }
              }}
            >
              <div className="tiltLayer" data-tilt="true">
                <div className="cardInner">
                  <div className="cardIcon" aria-hidden="true">🛡️</div>
                  <div className="cardTitle">RakshaDesk</div>
                  <div className="cardText">Real-time verification and friendly reminders from cyber police.</div>
                  <div className="moduleLinkRow">
                    <button type="button" className="linkBtn" onClick={() => navigate("/cyber-police")} aria-label="Open RakshaDesk">
                      {t("ctaRakshaDesk")}
                    </button>
                  </div>
                  <div className="cardArt guidanceArt" aria-hidden="true">
                    <div className="gpLeftIcon" />
                    <div className="gpPanel">
                      <div className="gpRow flagged">
                        <span className="gpTitle">Risk Flagged</span>
                        <span className="rfDot red" />
                      </div>
                      <div className="gpRow cops">
                        <span className="gpTitle">Verified by Cops</span>
                        <span className="rfDot green" />
                      </div>
                      <div className="gpAvatars">
                        <span className="gpA a1" />
                        <span className="gpA a2" />
                        <span className="gpA a3" />
                      </div>
                    </div>
                    <div className="miniBadge">
                      <span aria-hidden="true">●</span>
                      <span>{t("activeProtection")}</span>
                    </div>
                  </div>
                  <div className="cardTag">
                    <span aria-hidden="true">●</span>
                    <span>{t("activeProtection")}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="threatMotionCard motionCard is-visible" aria-hidden="true">
            <div className="tmGlow" />
            <div className="tmRing r1" />
            <div className="tmRing r2" />
            <div className="tmRing r3" />

            <div className="tmCenter">
              <div className="tmBubble" />
              <div className="tmShield">🛡️</div>
              <div className="tmTag">Guiding Safety</div>
            </div>

            <div className="tmThreat spam">SPAM</div>
            <div className="tmThreat phish">PHISH</div>
            <div className="tmThreat mal">MAL</div>
            <div className="tmThreat spam2">SPAM</div>
            <div className="tmThreat phish2">PHISH</div>

            <div className="tmSafe s1">👁</div>
            <div className="tmSafe s2">🛡️</div>
            <div className="tmSafe s3" />
          </div>
        </section>

        <section id="practice" className="section">
          <div className="metrics">
            <div className="metric float" data-tilt="true">
              <div className="metricValue">{cyberStats?.m1 ?? t("metric1Value")}</div>
              <div className="metricLabel">{t("metric1Label")}</div>
            </div>
            <div className="metric float2" data-tilt="true">
              <div className="metricValue">{cyberStats?.m2 ?? t("metric2Value")}</div>
              <div className="metricLabel">{t("metric2Label")}</div>
            </div>
            <div className="metric float3" data-tilt="true">
              <div className="metricValue">{cyberStats?.m3 ?? t("metric3Value")}</div>
              <div className="metricLabel">{t("metric3Label")}</div>
            </div>
          </div>
          <p className="metricsFootnote">{t("metricFootnote")}</p>
        </section>

        <section id="detect" className="section">
          <div className="zones">
            <div className="zone danger" data-tilt="true">
              <div className="zoneTitle danger">{t("dangerTitle")}</div>
              <div className="zoneCanvas">
                <div className="dot" aria-hidden="true" />
                {["hz1", "hz2", "hz3", "hz4"].map((cls) => (
                  <div key={cls} className={`hazard ${cls}`} aria-hidden="true" />
                ))}
              </div>
            </div>

            <div className="zone safe" data-tilt="true">
              <div className="zoneTitle safe">{t("safeTitle")}</div>
              <div className="zoneCanvas">
                <div className="dot" aria-hidden="true" />
                {["g1", "g2", "g3"].map((cls) => (
                  <div key={cls} className={`guard ${cls}`} aria-hidden="true" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <button type="button" className="btn" onClick={() => go("/setu-connect")}>
              {t("navSetuConnect")}
            </button>
          </div>
        </section>

        <footer>
          <div className="footerGrid">
            <div>
              <div className="brand" style={{ marginBottom: 10 }}>
                <span className="logo" aria-hidden="true" />
                <span>{t("brand")}</span>
              </div>
              <div className="footerMuted">{t("footerAbout")}</div>
              <div className="socialRow" aria-label="Social">
                <button className="socialBtn" type="button" aria-label="Social 1" />
                <button className="socialBtn" type="button" aria-label="Social 2" />
                <button className="socialBtn" type="button" aria-label="Social 3" />
                <button className="socialBtn" type="button" aria-label="Social 4" />
              </div>
            </div>

            <div>
              <div className="footerTitle">{t("footerQuickLinks")}</div>
              <div className="footerLinks">
                <a href="#home" onClick={(e) => onAnchor(e, "#home")}>
                  {t("navHome")}
                </a>
                <a href="#learn" onClick={(e) => onAnchor(e, "#learn")}>
                  {t("navLearn")}
                </a>
                <a href="#practice" onClick={(e) => onAnchor(e, "#practice")}>
                  {t("navPractice")}
                </a>
                <a
                  href="/setu-connect"
                  onClick={(e) => {
                    e.preventDefault();
                    go("/setu-connect");
                  }}
                >
                  {t("navSetuConnect")}
                </a>
              </div>
            </div>

            <div>
              <div className="footerTitle">{t("footerContact")}</div>
              <div className="contactItem">
                <span>{t("contactEmail")}</span>
              </div>
              <div className="contactItem">
                <span>{t("contactPhone")}</span>
              </div>
              <div className="contactItem">
                <span>{t("contactLocation")}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {profileOpen && sessionUser ? (
        <div
          className="landingProfileBackdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-panel-title"
          onClick={closeProfile}
        >
          <div className="landingProfileModal" onClick={(e) => e.stopPropagation()} role="document">
            <ProfilePanel refreshSession={refreshSession} onClose={closeProfile} />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="floatingBot"
        onClick={() => navigate("/deepfake-recognition")}
        aria-label="Open deepfake recognition"
      >
        <span className="floatingBotBubble">Click me</span>
        <span className="floatingBotIcon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="7" width="12" height="10" rx="3" fill="white" fillOpacity="0.95" />
            <circle cx="9.5" cy="12" r="1.35" fill="#2563eb" />
            <circle cx="14.5" cy="12" r="1.35" fill="#2563eb" />
            <path d="M9 16.5h6" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          </svg>
        </span>
      </button>
    </div>
  );
}

