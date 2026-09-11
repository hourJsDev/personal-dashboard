"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookHeart, LoaderCircle, RefreshCw, WifiOff } from "lucide-react";

const references = [
  "Psalm 23:1", "Philippians 4:13", "Proverbs 3:5", "Psalm 46:10",
  "Matthew 11:28", "Romans 8:28", "Isaiah 41:10", "Psalm 119:105",
  "John 3:16", "Jeremiah 29:11", "1 Corinthians 13:4", "Joshua 1:9",
] as const;

type Verse = { reference: string; english: string; translation: string };
type DailyVerse = { date: string; verse: Verse };

const dailyVerseKey = "petal-and-plan-daily-bible-verse-v2";

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function readDailyVerse(): Verse | null {
  try {
    const cached = JSON.parse(localStorage.getItem(dailyVerseKey) ?? "null") as DailyVerse | null;
    if (cached?.date !== todayKey() || !cached.verse?.english) return null;
    return cached.verse;
  } catch {
    return null;
  }
}

function saveDailyVerse(verse: Verse) {
  try {
    localStorage.setItem(dailyVerseKey, JSON.stringify({ date: todayKey(), verse } satisfies DailyVerse));
  } catch {
    // The live verse can still be shown when browser storage is unavailable.
  }
}

function randomReference(excluding?: string) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  const candidate = references[values[0] % references.length];
  return candidate === excluding ? references[(references.indexOf(candidate) + 1) % references.length] : candidate;
}

export function BibleVerseCard() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lastReference = useRef<string>();
  const activeRequest = useRef<AbortController>();

  const loadVerse = useCallback(async (forceNew = false) => {
    if (!forceNew) {
      const cached = readDailyVerse();
      if (cached) {
        lastReference.current = cached.reference;
        setVerse(cached);
        setError(false);
        setLoading(false);
        return;
      }
    }

    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const reference = randomReference(lastReference.current);
    setLoading(true);
    setError(false);

    try {
      const bibleResponse = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=web`, { signal: controller.signal });
      if (!bibleResponse.ok) throw new Error("Bible API request failed");
      const bible: { reference?: string; text?: string; translation_name?: string } = await bibleResponse.json();
      const english = bible.text?.replace(/\s+/g, " ").trim();
      if (!english) throw new Error("Bible API returned no verse text");

      lastReference.current = reference;
      const nextVerse = { reference: bible.reference ?? reference, english, translation: bible.translation_name ?? "World English Bible" };
      setVerse(nextVerse);
      saveDailyVerse(nextVerse);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVerse();
    return () => activeRequest.current?.abort();
  }, [loadVerse]);

  return (
    <section className="float-in relative overflow-hidden rounded-[1.75rem] border border-[#eadbf7] bg-gradient-to-br from-white/90 via-[#fff9fc]/90 to-[#f4efff]/90 p-5 shadow-[0_18px_50px_rgba(120,92,150,0.09)] backdrop-blur-sm md:col-span-2 xl:col-span-1 sm:p-6">
      <div aria-hidden="true" className="absolute -right-7 -top-8 text-8xl opacity-[0.08]">✝</div>
      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#9b75b3]">Verse for today</p><h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#624d71]">A little light ✨</h2></div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eee5fb] text-[#8869a2]"><BookHeart className="h-5 w-5" /></div>
        </div>

        <div aria-live="polite" aria-busy={loading}>
          {loading && <div className="grid min-h-48 place-items-center rounded-2xl border border-white/90 bg-white/65 p-6 text-center text-[#86679c]"><div><LoaderCircle className="mx-auto mb-3 h-6 w-6 animate-spin" /><p className="text-sm font-bold">Finding a verse for you…</p></div></div>}
          {!loading && error && <div className="grid min-h-48 place-items-center rounded-2xl border border-[#f0d9e4] bg-white/65 p-6 text-center"><div><WifiOff className="mx-auto mb-3 h-6 w-6 text-[#b6788f]" /><p className="font-bold text-[#765866]">The verse service is resting.</p><p className="mt-1 text-sm text-[#9f8490]">Check your connection and try again.</p></div></div>}
          {!loading && verse && !error && (
            <blockquote key={verse.reference} className="verse-reveal rounded-2xl border border-white/90 bg-white/65 p-4">
              <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold leading-7 text-[#5f4b69]">“{verse.english}”</p>
              <cite className="mt-3 block text-sm font-extrabold not-italic text-[#a1637d]">— {verse.reference}</cite>
            </blockquote>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-[#a48d9e]">{verse?.translation ?? "World English Bible"}</p>
          <button type="button" onClick={() => void loadVerse(true)} disabled={loading} className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#decbea] bg-white/80 px-3 text-sm font-extrabold text-[#86679c] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#eadff3] disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{error ? "Try again" : "Another verse"}
          </button>
        </div>
      </div>
    </section>
  );
}
