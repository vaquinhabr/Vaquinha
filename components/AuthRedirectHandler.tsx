"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Supabase's Site URL is the only redirect target required for email links.
 * After the client SDK consumes the callback tokens, route to the appropriate
 * in-app page. This avoids breaking registration when a deep path hasn't been
 * added to Supabase's redirect allowlist yet.
 */
export default function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let recoveryDetected = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        recoveryDetected = true;
        router.replace("/auth/reset-password");
      }
    });

    async function handleAuthRedirect() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const type = hash.get("type") || url.searchParams.get("type");
      const hasCallbackData =
        hash.has("access_token") ||
        hash.has("error") ||
        url.searchParams.has("code") ||
        url.searchParams.has("error");

      if (!hasCallbackData && type !== "recovery" && type !== "signup") return;

      // getSession initializes supabase-js and consumes the callback URL before
      // the router changes the path and drops the fragment.
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (type === "recovery" || recoveryDetected) {
        router.replace("/auth/reset-password");
      } else if (type === "signup" || data.session || hasCallbackData || error) {
        router.replace("/auth/confirm");
      }
    }

    void handleAuthRedirect().catch(() => {
      // The confirmation/reset pages display a recoverable error if needed.
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
