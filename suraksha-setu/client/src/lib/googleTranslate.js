/**
 * Google Website Translator (free widget). Loads once and syncs the hidden
 * combo box with the app's language code so choosing a language in Suraksha Setu
 * also triggers in-page translation where the widget supports it.
 */

export const APP_LANG_TO_GT = {
  EN: "en",
  HI: "hi",
  MR: "mr",
  ES: "es",
  FR: "fr",
  AR: "ar",
};

let loadPromise = null;
let widgetInitialized = false;

function initWidgetIfNeeded() {
  if (widgetInitialized) return;
  const el = document.getElementById("google_translate_element");
  if (!el || !window.google?.translate?.TranslateElement) return;
  widgetInitialized = true;
  try {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,hi,mr,es,fr,ar",
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element",
    );
  } catch (e) {
    console.warn("Google Translate init:", e);
    widgetInitialized = false;
  }
}

export function loadGoogleTranslateScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.translate?.TranslateElement) {
    initWidgetIfNeeded();
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const done = () => {
      initWidgetIfNeeded();
      resolve();
    };
    window.googleTranslateElementInit = done;
    const s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onerror = () => {
      loadPromise = null;
      reject(new Error("Google Translate script failed to load"));
    };
    document.body.appendChild(s);
  });
  return loadPromise;
}

export function applyGoogleTranslateLanguage(appLang) {
  if (typeof window === "undefined") return;
  const code = APP_LANG_TO_GT[String(appLang || "EN").toUpperCase()] || "en";

  const tryApply = () => {
    const combo = document.querySelector("select.goog-te-combo");
    if (!combo) return false;

    if (code === "en") {
      if (combo.options.length) {
        combo.selectedIndex = 0;
        combo.dispatchEvent(new Event("change"));
      }
      return true;
    }

    const match = Array.from(combo.options).find((o) => o.value === code);
    if (!match) return true;
    if (combo.value !== code) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
    }
    return true;
  };

  if (tryApply()) return;

  let n = 0;
  const id = window.setInterval(() => {
    n += 1;
    if (tryApply() || n > 55) window.clearInterval(id);
  }, 100);
}
