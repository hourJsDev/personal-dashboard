"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { updateSettings } from "@/app/actions";
import { isHostedBrowser, loadBrowserDashboard, saveBrowserDashboard } from "@/lib/browser-storage";
import type { DashboardData } from "@/lib/storage";

export function SettingsFormShell({ dashboard, children }: { dashboard: DashboardData; children: ReactNode }) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isHostedBrowser() || !formRef.current) return;
    const saved = loadBrowserDashboard(dashboard);
    const form = formRef.current;
    const displayName = form.elements.namedItem("displayName") as HTMLInputElement | null;
    const greeting = form.elements.namedItem("greetingMessage") as HTMLTextAreaElement | null;
    const timezone = form.elements.namedItem("timezone") as HTMLSelectElement | null;
    const showCompleted = form.elements.namedItem("showCompletedTasks") as HTMLInputElement | null;
    if (displayName) displayName.value = saved.profile.displayName;
    if (greeting) greeting.value = saved.greetingMessage;
    if (timezone) timezone.value = saved.profile.timezone;
    if (showCompleted) showCompleted.checked = saved.preferences.showCompletedTasks;
  }, [dashboard]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!isHostedBrowser()) return;
    event.preventDefault();
    setStatus("idle");

    try {
      const formData = new FormData(event.currentTarget);
      const current = loadBrowserDashboard(dashboard);
      const avatar = formData.get("avatar");
      let avatarUrl = current.profile.avatarUrl;

      if (avatar && typeof avatar !== "string" && avatar.size > 0) {
        if (avatar.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(avatar.type)) {
          throw new Error("Invalid profile image");
        }
        avatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(avatar);
        });
      }

      const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 60);
      const greetingMessage = String(formData.get("greetingMessage") ?? "").trim().slice(0, 220);
      const timezone = String(formData.get("timezone") ?? current.profile.timezone);
      saveBrowserDashboard({
        ...current,
        greetingMessage: greetingMessage || current.greetingMessage,
        profile: { displayName: displayName || current.profile.displayName, avatarUrl, timezone },
        preferences: { showCompletedTasks: formData.get("showCompletedTasks") === "on" },
      });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {status === "saved" && (
        <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-[#cce8d9] bg-[#f2fff8] px-4 py-3 text-sm font-extrabold text-[#4f7d66] shadow-sm">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dff5e9]"><Check className="h-4 w-4" /></span>
          Your settings are saved and ready on the dashboard.
        </div>
      )}
      {status === "error" && (
        <div role="alert" className="mt-5 flex items-center gap-3 rounded-2xl border border-[#f1cbd4] bg-[#fff5f7] px-4 py-3 text-sm font-extrabold text-[#a84f68] shadow-sm">
          <CircleAlert className="h-5 w-5" /> Couldn’t save. Try a smaller profile picture.
        </div>
      )}
      <form ref={formRef} action={updateSettings} onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {children}
      </form>
    </>
  );
}
