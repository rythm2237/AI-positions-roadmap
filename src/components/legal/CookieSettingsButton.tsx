"use client";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("career-os:open-cookie-settings"))}
      className="transition hover:text-slate-300"
    >
      Cookie settings
    </button>
  );
}
