import { useMemo, useState } from "react";

function onlyDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

function maskLast4(digits) {
  const d = onlyDigits(digits);
  if (!d) return "";
  if (d.length <= 4) return d;
  return `${"•".repeat(d.length - 4)}${d.slice(-4)}`;
}

/**
 * Digit-only field with optional masking when not focused (last 4 visible).
 * Eye toggles persistent reveal. Fixes broken entry when value was confused with mask text.
 */
export default function MaskedInput({ className = "input", value, onChange, placeholder, maxLength, "aria-label": ariaLabel }) {
  const [pinnedReveal, setPinnedReveal] = useState(false);
  const [focused, setFocused] = useState(false);

  const raw = useMemo(() => onlyDigits(value).slice(0, maxLength), [value, maxLength]);
  const visible = pinnedReveal || focused;
  const display = visible ? raw : maskLast4(raw);

  return (
    <div className="maskedDigitRow">
      <input
        className={className}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const next = onlyDigits(e.target.value).slice(0, maxLength);
          onChange(next);
        }}
      />
      <button
        className="maskedDigitEye"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setPinnedReveal((v) => !v)}
        aria-label={pinnedReveal ? "Hide" : "Show"}
        aria-pressed={pinnedReveal}
      >
        👁
      </button>
    </div>
  );
}
