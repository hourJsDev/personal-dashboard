import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, Heart, Settings2 } from "lucide-react";
import { SettingsFormShell } from "@/components/settings-form-shell";
import { ProfilePreview } from "@/components/profile-preview";
import { ProfilePhotoPicker } from "@/components/profile-photo-picker";
import { readDashboard } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings — Petal & Plan",
  description: "Manage your profile and daily dashboard preferences.",
};

const timezones = [
  ["Asia/Phnom_Penh", "Phnom Penh"],
  ["Asia/Bangkok", "Bangkok"],
  ["Asia/Singapore", "Singapore"],
  ["Europe/London", "London"],
  ["America/New_York", "New York"],
  ["UTC", "UTC"],
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const dashboard = await readDashboard();
  const didSave = searchParams.saved === "1";

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#dda9ba_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative mx-auto max-w-5xl">
        <nav className="mb-5 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl border border-pink-100 bg-white/80 px-4 text-sm font-extrabold text-[#8c6574] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f2d7e0]">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="rounded-full border border-purple-100 bg-white/70 px-3 py-1.5 text-sm font-bold text-[#8d729f]">⚙️ Personal settings</span>
        </nav>

        <header className="float-in overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/80 p-6 shadow-[0_20px_60px_rgba(153,89,112,0.10)] backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfilePreview dashboard={dashboard} />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#bd8295]">Your space, your way</p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-[#5e3e4d] sm:text-4xl">Profile &amp; preferences</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#876a77]">Make your daily dashboard feel more like home.</p>
            </div>
          </div>
        </header>

        {didSave && (
          <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-[#cce8d9] bg-[#f2fff8] px-4 py-3 text-sm font-extrabold text-[#4f7d66] shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dff5e9]"><Check className="h-4 w-4" /></span>
            Your settings are saved and ready on the dashboard.
          </div>
        )}

        <SettingsFormShell dashboard={dashboard}>
          <section className="rounded-[1.75rem] border border-pink-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(153,89,112,0.08)] backdrop-blur-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0f4] text-[#b96f87]"><Heart className="h-5 w-5" /></span>
              <div><p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#bd8295]">About you</p><h2 className="font-display text-2xl font-semibold text-[#5e3e4d]">My profile</h2></div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-[#755967]">Display name</span>
                <input name="displayName" defaultValue={dashboard.profile.displayName} required maxLength={60} className="h-12 w-full rounded-xl border border-[#edd4dd] bg-white px-4 text-base outline-none transition focus:border-[#d99aae] focus:ring-4 focus:ring-[#f8dce5]" />
              </label>

              <ProfilePhotoPicker initialUrl={dashboard.profile.avatarUrl} displayName={dashboard.profile.displayName} />

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-[#755967]">Daily message</span>
                <textarea name="greetingMessage" defaultValue={dashboard.greetingMessage} required maxLength={220} rows={4} className="w-full resize-y rounded-2xl border border-[#edd4dd] bg-white p-4 text-base leading-7 outline-none transition focus:border-[#d99aae] focus:ring-4 focus:ring-[#f8dce5]" />
              </label>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-purple-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(120,92,150,0.08)] backdrop-blur-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2ebff] text-[#8d70a8]"><Settings2 className="h-5 w-5" /></span>
              <div><p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#9b80b6]">Daily flow</p><h2 className="font-display text-2xl font-semibold text-[#604d70]">Preferences</h2></div>
            </div>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#685474]"><Clock3 className="h-4 w-4" /> Timezone</span>
              <select name="timezone" defaultValue={dashboard.profile.timezone} className="h-12 w-full rounded-xl border border-[#e2d4ee] bg-white px-4 text-base font-bold text-[#685474] outline-none focus:border-[#a98bc4] focus:ring-4 focus:ring-[#eee4f8]">
                {timezones.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <p className="mt-2 text-sm leading-6 text-[#9785a1]">Daily tasks reset according to this timezone.</p>
            </label>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e5d9ef] bg-[#fbf9ff] p-4">
              <input name="showCompletedTasks" type="checkbox" defaultChecked={dashboard.preferences.showCompletedTasks} className="mt-0.5 h-5 w-5 rounded border-2 border-[#b59ac9] accent-[#9274ad]" />
              <span><span className="block text-base font-bold text-[#685474]">Show completed tasks</span><span className="mt-1 block text-sm leading-6 text-[#9785a1]">Keep finished items visible until tomorrow’s reset.</span></span>
            </label>

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#f7edff] to-[#fff2f6] p-4 text-sm leading-6 text-[#806c8c]">Your settings stay with the rest of your dashboard data on this computer. 🌷</div>

            <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#8f70aa] px-5 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(121,91,148,0.24)] transition hover:-translate-y-0.5 hover:bg-[#7e6099] focus:outline-none focus:ring-4 focus:ring-[#e5d8f1]">
              <Check className="h-5 w-5" /> Save my settings
            </button>
          </section>
        </SettingsFormShell>
      </div>
    </main>
  );
}
