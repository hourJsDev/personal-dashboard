"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CalendarHeart, ChevronDown, Plus, Trash2, X } from "lucide-react";
import type { DashboardDateWidget, DateWidgetKind } from "@/lib/storage";

type NewDateWidget = Omit<DashboardDateWidget, "id">;

type Props = {
  widgets: DashboardDateWidget[];
  isPending: boolean;
  onAdd: (widget: NewDateWidget, formData: FormData) => void;
  onDelete: (id: string) => void;
};

const cardStyles = [
  "border-[#f2cad7] bg-gradient-to-br from-[#fff9fb] via-white to-[#fff0f5]",
  "border-[#ddd1f2] bg-gradient-to-br from-[#fcfaff] via-white to-[#f3edff]",
  "border-[#f0dfba] bg-gradient-to-br from-[#fffdf7] via-white to-[#fff5dd]",
  "border-[#cfe8dd] bg-gradient-to-br from-[#f8fffb] via-white to-[#eaf8f1]",
];

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function nextAnnualDate(original: Date, now: Date) {
  let target = new Date(now.getFullYear(), original.getMonth(), original.getDate());
  if (target < now && !sameDay(target, now)) {
    target = new Date(now.getFullYear() + 1, original.getMonth(), original.getDate());
  }
  return target;
}

function calendarAge(start: Date, end: Date) {
  let years = end.getFullYear() - start.getFullYear();
  let cursor = new Date(start);
  cursor.setFullYear(start.getFullYear() + years);
  if (cursor > end) {
    years -= 1;
    cursor = new Date(start);
    cursor.setFullYear(start.getFullYear() + years);
  }
  let months = 0;
  while (months < 11) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + 1);
    if (next > end) break;
    cursor = next;
    months += 1;
  }
  const days = Math.floor((end.getTime() - cursor.getTime()) / 86_400_000);
  return { years, months, days };
}

function widgetTime(widget: DashboardDateWidget, now: Date) {
  const original = parseDate(widget.date);
  const target = widget.repeatsAnnually ? nextAnnualDate(original, now) : original;
  const dateLabel = original.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: widget.repeatsAnnually ? undefined : "numeric",
  });

  if (widget.kind === "countup") {
    if (original > now) {
      const days = Math.ceil((original.getTime() - now.getTime()) / 86_400_000);
      return { value: `${days}`, units: "days until it begins", note: dateLabel };
    }
    const { years, months, days } = calendarAge(original, now);
    const totalDays = Math.floor((now.getTime() - original.getTime()) / 86_400_000);
    const pieces = [years ? `${years}y` : "", months ? `${months}m` : "", `${days}d`].filter(Boolean);
    return { value: pieces.join("  "), units: `${totalDays.toLocaleString()} beautiful days`, note: `Since ${dateLabel}` };
  }

  if (sameDay(target, now)) return { value: "Today!", units: "The wait is over", note: dateLabel };
  const difference = target.getTime() - now.getTime();
  if (difference < 0) return { value: "Complete", units: "This day has arrived", note: dateLabel };
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference % 86_400_000) / 3_600_000);
  const minutes = Math.floor((difference % 3_600_000) / 60_000);
  return {
    value: `${days}d  ${hours}h  ${minutes}m`,
    units: widget.repeatsAnnually ? "until the next celebration" : "to go",
    note: `${widget.repeatsAnnually ? "Every year · " : ""}${dateLabel}`,
  };
}

export function SpecialDateWidgets({ widgets, isPending, onAdd, onDelete }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<DateWidgetKind>("countdown");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const date = String(formData.get("date") ?? "");
    if (!title || !date) return;
    const widget: NewDateWidget = {
      title,
      date,
      kind,
      emoji: String(formData.get("emoji") ?? "✨"),
      repeatsAnnually: kind === "countdown" && formData.get("repeatsAnnually") === "true",
    };
    onAdd(widget, formData);
    formRef.current?.reset();
    setKind("countdown");
    setAdding(false);
  }

  return (
    <section className="float-in mt-6 rounded-[1.75rem] border border-[#f0d7e0] bg-white/75 p-4 shadow-[0_18px_50px_rgba(153,89,112,0.08)] backdrop-blur-sm sm:p-6 lg:p-8" style={{ animationDelay: "55ms" }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#bc8295]">Days that matter</p>
          <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#5e3e4d] sm:text-3xl">My special moments</h2>
        </div>
        <button type="button" onClick={() => setAdding((value) => !value)} aria-expanded={adding} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6f567e] px-4 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(111,86,126,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5f496d] focus:outline-none focus:ring-4 focus:ring-[#e7dcef]">
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? "Close" : "Add a moment"}
        </button>
      </div>

      {adding && (
        <form ref={formRef} onSubmit={handleSubmit} className="mt-5 grid gap-3 rounded-2xl border border-[#eadbe9] bg-gradient-to-r from-[#fff9fb] to-[#faf7ff] p-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1.4fr)_165px_150px_100px_160px_auto] sm:p-4">
          <label className="grid gap-1.5 text-sm font-bold text-[#765967]">
            Moment name
            <input name="title" required maxLength={80} placeholder="Our anniversary" className="h-11 min-w-0 rounded-xl border border-[#e6d2dc] bg-white px-3 text-base font-medium outline-none focus:border-[#c989a0] focus:ring-4 focus:ring-[#f5dce5]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[#765967]">
            Date
            <input name="date" type="date" required className="h-11 min-w-0 rounded-xl border border-[#e6d2dc] bg-white px-3 text-base outline-none focus:border-[#c989a0] focus:ring-4 focus:ring-[#f5dce5]" />
          </label>
          <label className="relative grid gap-1.5 text-sm font-bold text-[#765967]">
            Count
            <select name="kind" value={kind} onChange={(event) => setKind(event.target.value as DateWidgetKind)} className="h-11 appearance-none rounded-xl border border-[#e6d2dc] bg-white px-3 pr-8 text-sm font-bold outline-none focus:border-[#c989a0] focus:ring-4 focus:ring-[#f5dce5]">
              <option value="countdown">Down to it</option>
              <option value="countup">Up since it</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3.5 right-3 h-4 w-4 text-[#a98794]" />
          </label>
          <label className="relative grid gap-1.5 text-sm font-bold text-[#765967]">
            Icon
            <select name="emoji" defaultValue="💗" className="h-11 appearance-none rounded-xl border border-[#e6d2dc] bg-white px-3 pr-8 text-lg outline-none focus:border-[#c989a0] focus:ring-4 focus:ring-[#f5dce5]">
              <option>💗</option><option>🎂</option><option>✈️</option><option>🎓</option><option>✨</option><option>🌷</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3.5 right-3 h-4 w-4 text-[#a98794]" />
          </label>
          <label className={`relative grid gap-1.5 text-sm font-bold text-[#765967] ${kind === "countup" ? "opacity-50" : ""}`}>
            Repeat
            <select name="repeatsAnnually" defaultValue="false" disabled={kind === "countup"} className="h-11 appearance-none rounded-xl border border-[#e6d2dc] bg-white px-3 pr-8 text-sm font-bold outline-none focus:border-[#c989a0] focus:ring-4 focus:ring-[#f5dce5] disabled:bg-[#f7f1f4]">
              <option value="false">One time</option>
              <option value="true">Every year</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3.5 right-3 h-4 w-4 text-[#a98794]" />
          </label>
          <button disabled={isPending} className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b96f87] px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#a95f78] focus:outline-none focus:ring-4 focus:ring-[#efc5d2] disabled:opacity-60">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
      )}

      {widgets.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {widgets.map((widget, index) => {
            const time = now ? widgetTime(widget, now) : {
              value: "—",
              units: "Updating the count…",
              note: parseDate(widget.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            };
            return (
              <article key={widget.id} className={`group relative overflow-hidden rounded-2xl border p-5 shadow-[0_10px_30px_rgba(103,72,88,0.06)] ${cardStyles[index % cardStyles.length]}`}>
                <div aria-hidden="true" className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-white/60 blur-xl" />
                <div className="relative flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white bg-white/75 text-2xl shadow-sm">{widget.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="break-words text-base font-extrabold text-[#664958]">{widget.title}</h3>
                      <button type="button" onClick={() => onDelete(widget.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#ad8795] opacity-70 transition hover:bg-white hover:text-[#ae4f69] group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-[#f1d5de]" aria-label={`Delete ${widget.title}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-3 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-[-0.02em] text-[#5f4452] sm:text-[1.7rem]">{time.value}</p>
                    <p className="mt-1 text-sm font-extrabold text-[#9d7181]">{time.units}</p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#9a8490]"><CalendarHeart className="h-3.5 w-3.5" /> {time.note}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="mt-5 flex w-full flex-col items-center rounded-2xl border border-dashed border-[#e3c9d4] bg-[#fffafb]/80 px-5 py-8 text-center transition hover:border-[#d39aae] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f4d8e1]">
          <span className="text-3xl">💞</span>
          <span className="mt-2 font-extrabold text-[#765a67]">Keep a beautiful date close</span>
          <span className="mt-1 text-sm font-medium text-[#a18490]">Count down to a birthday, or count the days since your story began.</span>
        </button>
      )}
    </section>
  );
}
