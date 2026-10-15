import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Home,
  Settings,
  Info,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Download,
  Send,
  WifiOff,
  Video,
  Phone,
} from "lucide-react";
import "./i18n";
import { categories } from "./categories";
import { read, save } from "./preferences";
import "@fontsource/cairo/arabic-400.css";
import "@fontsource/cairo/arabic-600.css";
import "@fontsource/cairo/arabic-700.css";
import "@fontsource/cairo/latin-400.css";
import "@fontsource/cairo/latin-600.css";
import "@fontsource/cairo/latin-700.css";
import "./styles.css";
function usePath() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const f = () => setPath(location.pathname);
    addEventListener("popstate", f);
    return () => removeEventListener("popstate", f);
  }, []);
  return [
    path,
    (p: string) => {
      history.pushState({}, "", p);
      setPath(p);
      window.scrollTo({ top: 0, behavior: "instant" });
    },
  ] as const;
}
function Splash() {
  const { t } = useTranslation();
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem("intro");
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const finish = () => {
    setLeaving(true);
    try {
      sessionStorage.setItem("intro", "1");
    } catch {}
    timer.current = setTimeout(() => setShow(false), 350);
  };
  useEffect(() => {
    if (!show) return;
    const timeout = setTimeout(finish, 5000);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    return () => {
      clearTimeout(timeout);
      clearTimeout(timer.current);
    };
  }, [show]);
  return show ? (
    <div
      className={`splash ${leaving ? "leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t("loading")}
    >
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/assets/logo.png"
        onEnded={finish}
        onError={finish}
        onCanPlay={(e) => {
          e.currentTarget.play().catch(finish);
        }}
      >
        <source src="/assets/school-intro.mp4" type="video/mp4" />
      </video>
      <button autoFocus onClick={finish}>
        {t("skip")} <ArrowRight size={18} />
      </button>
    </div>
  ) : null;
}
function App() {
  const { t, i18n } = useTranslation();
  const [path, navigate] = usePath();
  const [theme, setTheme] = useState(() =>
    read("theme", "light") === "dark" ? "dark" : "light",
  );
  const [status, setStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const ar = i18n.language === "ar";
  const cat = categories.find((c) => path === "/" + c.id);
  const isHome = path === "/";
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    save("language", i18n.language);
  }, [i18n.language, ar]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    save("theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#101b2b" : "#123a69");
  }, [theme]);
  useEffect(() => {
    document.title = `${cat ? t(`categories.${cat.id}.title`) : t(isHome ? "home" : path === "/settings" ? "settings" : "about")} | ${t("school")}`;
    heading.current?.focus({ preventScroll: true });
  }, [path, i18n.language]);
  const check = () => {
    setStatus("");
    fetch("/api/categories", { signal: AbortSignal.timeout(6000) })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        if (data.categories.length !== 8) throw Error();
        setStatus("connected");
      })
      .catch(() => setStatus(navigator.onLine ? "unavailable" : "offline"));
  };
  useEffect(() => {
    check();
    addEventListener("online", check);
    addEventListener("offline", check);
    return () => {
      removeEventListener("online", check);
      removeEventListener("offline", check);
    };
  }, []);
  const toggleLanguage = () => i18n.changeLanguage(ar ? "en" : "ar");
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const nav = (url: string, label: string, Icon: typeof Home) => (
    <a
      href={url}
      className={path === url ? "active" : ""}
      aria-current={path === url ? "page" : undefined}
      onClick={(e) => {
        e.preventDefault();
        navigate(url);
      }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </a>
  );
  return (
    <>
      <Splash />
      <aside className="sidebar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img src="/assets/icon-192.png" alt="" />
          <span>
            <strong>{t("school")}</strong>
            <small>{t("identity")}</small>
          </span>
        </a>
        <div className="sidebar-label">{t("schoolSpace")}</div>
        <nav aria-label={t("sections")}>
          {nav("/", t("home"), Home)}
          {categories.map((c) => (
            <React.Fragment key={c.id}>
              {nav("/" + c.id, t(`categories.${c.id}.title`), c.icon)}
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {nav("/settings", t("settings"), Settings)}
          {nav("/about", t("about"), Info)}
          <div className="sidebar-note">
            <GraduationCap size={25} />
            <p>{t("footer")}</p>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <img src="/assets/icon-192.png" alt="" />
            <strong>{t("school")}</strong>
          </div>
          <div className="breadcrumb">
            {t("school")}
            <ChevronRight size={14} />
            <span>
              {cat
                ? t(`categories.${cat.id}.title`)
                : t(
                    isHome
                      ? "home"
                      : path === "/settings"
                        ? "settings"
                        : "about",
                  )}
            </span>
          </div>
          <div className="controls">
            <button
              onClick={toggleLanguage}
              aria-label={ar ? "English" : "العربية"}
              className="language"
            >
              {ar ? "English" : "العربية"}
            </button>
            <span className="divider" />
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={t(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>
        <main key={path} className="page">
          {isHome ? (
            <>
              <section className="hero">
                <div className="hero-content">
                  <span className="eyebrow">
                    <span />
                    {t("portal")}
                  </span>
                  <h1 ref={heading} tabIndex={-1}>
                    {t("welcome")}
                  </h1>
                  <p>{t("welcomeText")}</p>
                  <a className="hero-button" href="#categories">
                    {t("explore")}
                    {ar ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </a>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <span className="star s1">✦</span>
                  <span className="star s2">✧</span>
                  <div className="art-card card-back">
                    <GraduationCap />
                  </div>
                  <div className="art-card card-front">
                    <BookOpen />
                    <span />
                    <span />
                  </div>
                  <div className="art-badge">
                    <Sparkles size={25} />
                  </div>
                  <div className="art-dot" />
                </div>
              </section>
              <section id="categories" className="category-section">
                <div className="section-heading">
                  <div>
                    <h2>{t("sections")}</h2>
                    <p>{t("sectionHint")}</p>
                  </div>
                  <span className="decorative-line" />
                </div>
                <div className="category-grid">
                  {categories.map((c, index) => (
                    <a
                      key={c.id}
                      href={"/" + c.id}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/" + c.id);
                      }}
                      className={`category-card ${c.color}`}
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <div className="card-top">
                        <span className="category-icon">
                          <c.icon size={25} strokeWidth={1.65} />
                        </span>
                        <ArrowUpRight className="card-arrow" size={19} />
                      </div>
                      <h3>{t(`categories.${c.id}.title`)}</h3>
                      <p>{t(`categories.${c.id}.desc`)}</p>
                      <span className="card-bottom">
                        <span />
                        {t("emptyTag")}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            </>
          ) : cat ? (
            <>
              <button className="back" onClick={() => navigate("/")}>
                {ar ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}{" "}
                {t("back")}
              </button>
              <div className={`detail-heading ${cat.color}`}>
                <span className="category-icon">
                  <cat.icon size={30} />
                </span>
                <div>
                  <h1 ref={heading} tabIndex={-1}>
                    {t(`categories.${cat.id}.title`)}
                  </h1>
                  <p>{t(`categories.${cat.id}.desc`)}</p>
                </div>
              </div>
              <section className={`empty-panel ${cat.color}`}>
                {(cat.id === "timetable" || cat.id === "exams") && (
                  <div className="table-head">
                    {(
                      t(
                        cat.id === "exams" ? "examColumns" : "timetableColumns",
                        { returnObjects: true },
                      ) as string[]
                    ).map((x) => (
                      <span key={x}>{x}</span>
                    ))}
                  </div>
                )}
                {cat.id === "planner" && (
                  <div className="week-head">
                    {(
                      t("plannerDays", { returnObjects: true }) as string[]
                    ).map((x) => (
                      <span key={x}>{x}</span>
                    ))}
                  </div>
                )}
                <div className="empty-body">
                  <div className="empty-illustration" aria-hidden="true">
                    <div className="empty-ring" />
                    <span className="empty-spark">✦</span>
                    <span className="empty-dot" />
                    <div className="empty-icon">
                      <cat.icon size={52} strokeWidth={1.3} />
                    </div>
                  </div>
                  <span className="pill">{t("emptyTag")}</span>
                  <h2>{t(cat.id === "tutor" ? "message" : "empty")}</h2>
                  <p>{t(`categories.${cat.id}.empty`)}</p>
                </div>
                {cat.id === "tutor" && (
                  <div className="chat-preview">
                    <input
                      disabled
                      placeholder={t("disabled")}
                      aria-label={t("disabled")}
                    />
                    <button disabled aria-label={t("disabled")}>
                      <Send size={20} />
                    </button>
                  </div>
                )}
                {cat.id === "classes" && (
                  <div className="panel-foot">
                    <Video size={17} />
                    {t("soon")}
                  </div>
                )}
              </section>
            </>
          ) : path === "/settings" ? (
            <>
              <h1 ref={heading} tabIndex={-1}>
                {t("preferences")}
              </h1>
              <p className="lead">{t("preferencesText")}</p>
              <section className="settings-panel">
                <div>
                  <h2>{t("language")}</h2>
                  <div className="segmented">
                    <button
                      aria-pressed={ar}
                      onClick={() => i18n.changeLanguage("ar")}
                    >
                      العربية
                    </button>
                    <button
                      aria-pressed={!ar}
                      onClick={() => i18n.changeLanguage("en")}
                    >
                      English
                    </button>
                  </div>
                </div>
                <div>
                  <h2>{t("theme")}</h2>
                  <div className="segmented">
                    <button
                      aria-pressed={theme === "light"}
                      onClick={() => setTheme("light")}
                    >
                      <Sun size={18} />
                      {t("light")}
                    </button>
                    <button
                      aria-pressed={theme === "dark"}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon size={18} />
                      {t("dark")}
                    </button>
                  </div>
                </div>
                <div>
                  <h2>
                    <Download size={21} />
                    {t("install")}
                  </h2>
                  <p>{t("installText")}</p>
                </div>
              </section>
            </>
          ) : path === "/about" ? (
            <>
              <h1 ref={heading} tabIndex={-1}>
                {t("about")}
              </h1>
              <section className="about-panel">
                <img src="/assets/logo.png" alt={t("school")} />
                <h2>{t("school")}</h2>
                <p>{t("aboutText")}</p>
                <div className="creator-credit">
                  <span className="creator-label">{t("madeAndDesigned")}</span>
                  <h3>{t("creatorName")}</h3>
                  <p>{t("contactPrompt")}</p>
                  <a className="creator-phone" href="tel:07721604061">
                    <Phone size={18} aria-hidden="true" />
                    <bdi dir="ltr">07721604061</bdi>
                  </a>
                </div>
              </section>
            </>
          ) : (
            <>
              <h1 ref={heading} tabIndex={-1}>
                {t("notFound")}
              </h1>
              <button onClick={() => navigate("/")}>{t("back")}</button>
            </>
          )}
          <footer>
            <span>{t("footer")}</span>
            <span className={`server-status ${status}`} role="status">
              {status === "offline" ? <WifiOff size={13} /> : <i />}
              {status && t(status)}
              {status === "unavailable" && (
                <button onClick={check}>{t("retry")}</button>
              )}
            </span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label={t("home")}>
        {nav("/", t("home"), Home)}
        {nav("/settings", t("settings"), Settings)}
        {nav("/about", t("about"), Info)}
      </nav>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
if (import.meta.env.PROD && "serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {}),
  );
