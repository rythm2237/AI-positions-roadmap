"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User, UserResponse } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function userName(user: User) {
  const metadata = user.user_metadata ?? {};
  return metadata.full_name || metadata.name || metadata.user_name || user.email || "Career OS member";
}

function setControlledInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function AuthenticatedWaitlistEnhancer() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }: UserResponse) => {
      if (active) setUser(data.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    const enhance = () => {
      const forms = Array.from(document.querySelectorAll<HTMLFormElement>("form"));

      forms.forEach((form) => {
        const nameInput = form.querySelector<HTMLInputElement>('input[autocomplete="name"]');
        const emailInput = form.querySelector<HTMLInputElement>('input[autocomplete="email"]');
        if (!nameInput || !emailInput || form.dataset.authWaitlistEnhanced === "true") return;

        setControlledInput(nameInput, userName(user));
        setControlledInput(emailInput, user.email ?? "");

        const nameLabel = nameInput.closest("label");
        const emailLabel = emailInput.closest("label");
        if (nameLabel instanceof HTMLElement) nameLabel.hidden = true;
        if (emailLabel instanceof HTMLElement) emailLabel.hidden = true;

        const notice = document.createElement("div");
        notice.dataset.authWaitlistNotice = "true";
        notice.setAttribute("role", "note");
        notice.className = "auth-waitlist-notice";
        notice.innerHTML = `
          <p class="auth-waitlist-eyebrow">Email notification</p>
          <p class="auth-waitlist-title">Notify me when this career becomes available</p>
          <p class="auth-waitlist-copy">We will send the availability update to <strong>${user.email}</strong>. You do not need to enter your details again.</p>
        `;

        const actions = Array.from(form.querySelectorAll("div")).find((element) =>
          element.querySelector('button[type="submit"]')
        );
        if (actions) form.insertBefore(notice, actions);
        else form.prepend(notice);

        const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submit) submit.textContent = "Notify me by email";

        const privacy = Array.from(form.querySelectorAll("p")).find((paragraph) =>
          paragraph.textContent?.includes("We use these details")
        );
        if (privacy) privacy.textContent = "You can opt out from your account settings at any time.";

        form.dataset.authWaitlistEnhanced = "true";
      });
    };

    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [user]);

  return null;
}
