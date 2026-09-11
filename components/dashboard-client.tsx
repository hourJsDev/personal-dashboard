"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Plus, Save, Settings, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { BibleVerseCard } from "@/components/bible-verse-card";
import { Checkbox } from "@/components/ui/checkbox";
import { addHabit, addTask, deleteHabit, deleteTask, saveNotes, toggleHabit, toggleTask } from "@/app/actions";
import { getBrowserTodayKey, isHostedBrowser, loadBrowserDashboard, saveBrowserDashboard } from "@/lib/browser-storage";
import type { DashboardData, TaskCategory, TaskPriority } from "@/lib/storage";

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        title: string;
        description: string;
        inputSchema: object;
        annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
        execute: (input: unknown) => Promise<unknown>;
      }, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

const categories = ["All", "Work", "Personal", "Creative", "Shopping"] as const;
const taskCategories: TaskCategory[] = ["Work", "Personal", "Creative", "Shopping"];
const priorities: TaskPriority[] = ["Cute & Quick", "Big Focus", "Deadline"];

const categoryStyle: Record<TaskCategory, string> = {
  Work: "bg-[#f1ebff] text-[#755d9b] border-[#e4d9fb]",
  Personal: "bg-[#fff0f4] text-[#aa6078] border-[#f6d9e2]",
  Creative: "bg-[#fff5df] text-[#9d7441] border-[#f1e1bb]",
  Shopping: "bg-[#eaf8f1] text-[#56836f] border-[#d4eee2]",
};

const categoryIcon: Record<TaskCategory, string> = {
  Work: "💻", Personal: "🌷", Creative: "🎨", Shopping: "🛍️",
};

const priorityStyle: Record<TaskPriority, string> = {
  "Cute & Quick": "text-[#8f7d86] bg-[#fff8fa]",
  "Big Focus": "text-[#796399] bg-[#f5f0ff]",
  Deadline: "text-[#b14c67] bg-[#fff0f2]",
};

type Props = { dashboard: DashboardData; formattedDate: string };

export function DashboardClient({ dashboard, formattedDate }: Props) {
  const [data, setData] = useState(dashboard);
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const addForm = useRef<HTMLFormElement>(null);
  const habitForm = useRef<HTMLFormElement>(null);

  const filteredTasks = useMemo(
    () => data.tasks.filter((task) => {
      const categoryMatches = activeCategory === "All" || task.category === activeCategory;
      const visibilityMatches = data.preferences.showCompletedTasks || !task.completed;
      return categoryMatches && visibilityMatches;
    }),
    [activeCategory, data.preferences.showCompletedTasks, data.tasks],
  );
  const completedCount = data.tasks.filter((task) => task.completed).length;
  const completion = data.tasks.length ? Math.round((completedCount / data.tasks.length) * 100) : 0;

  function run(action: () => Promise<void>, updater?: (current: DashboardData) => DashboardData) {
    startTransition(() => {
      if (updater && isHostedBrowser()) {
        setData((current) => {
          const next = updater(current);
          saveBrowserDashboard(next);
          return next;
        });
        return;
      }
      void action();
    });
  }

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category")) as TaskCategory;
    const priority = String(formData.get("priority")) as TaskPriority;
    if (!title) return;
    run(async () => {
      await addTask(formData);
      addForm.current?.reset();
    }, (current) => ({
      ...current,
      tasks: [{ id: crypto.randomUUID(), title, category, priority, completed: false, date: getBrowserTodayKey(current.profile.timezone) }, ...current.tasks],
    }));
    if (isHostedBrowser()) addForm.current?.reset();
  }

  function handleAddHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    run(async () => {
      await addHabit(formData);
      habitForm.current?.reset();
    }, (current) => ({
      ...current,
      habits: [...current.habits, { id: crypto.randomUUID(), title, streak: 0, completedToday: false }],
    }));
    if (isHostedBrowser()) habitForm.current?.reset();
  }

  useEffect(() => {
    setData(isHostedBrowser() ? loadBrowserDashboard(dashboard) : dashboard);
  }, [dashboard]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const refresh = () => window.location.reload();

    const tools = [
      {
        name: "create_dashboard_task",
        title: "Create dashboard task",
        description: "Add a new task to the daily dashboard.",
        inputSchema: {
          type: "object", additionalProperties: false,
          properties: {
            title: { type: "string", minLength: 1, maxLength: 140 },
            category: { type: "string", enum: taskCategories },
            priority: { type: "string", enum: priorities },
          }, required: ["title", "category", "priority"],
        },
        execute: async (input: unknown) => {
          const value = input as { title?: string; category?: string; priority?: string };
          if (!value.title || !taskCategories.includes(value.category as TaskCategory) || !priorities.includes(value.priority as TaskPriority)) throw new Error("Invalid task details");
          const data = new FormData();
          data.set("title", value.title); data.set("category", value.category!); data.set("priority", value.priority!);
          if (isHostedBrowser()) {
            const current = loadBrowserDashboard(dashboard);
            saveBrowserDashboard({
              ...current,
              tasks: [{ id: crypto.randomUUID(), title: value.title, category: value.category as TaskCategory, priority: value.priority as TaskPriority, completed: false, date: getBrowserTodayKey(current.profile.timezone) }, ...current.tasks],
            });
          } else {
            await addTask(data);
          }
          refresh();
          return { status: "created", title: value.title };
        },
      },
      {
        name: "create_dashboard_habit",
        title: "Create dashboard habit",
        description: "Add a new daily habit to the habit garden.",
        inputSchema: {
          type: "object", additionalProperties: false,
          properties: { title: { type: "string", minLength: 1, maxLength: 80 } },
          required: ["title"],
        },
        execute: async (input: unknown) => {
          const value = input as { title?: string };
          if (!value.title?.trim()) throw new Error("A habit title is required");
          const data = new FormData(); data.set("title", value.title);
          if (isHostedBrowser()) {
            const current = loadBrowserDashboard(dashboard);
            saveBrowserDashboard({ ...current, habits: [...current.habits, { id: crypto.randomUUID(), title: value.title, streak: 0, completedToday: false }] });
          } else {
            await addHabit(data);
          }
          refresh();
          return { status: "created", title: value.title };
        },
      },
      {
        name: "save_dashboard_notes",
        title: "Save dashboard notes",
        description: "Replace the quick notes in the dashboard scratchpad.",
        inputSchema: { type: "object", additionalProperties: false, properties: { notes: { type: "string", maxLength: 5000 } }, required: ["notes"] },
        execute: async (input: unknown) => {
          const value = input as { notes?: string };
          if (typeof value.notes !== "string") throw new Error("Notes must be text");
          const data = new FormData(); data.set("notes", value.notes);
          if (isHostedBrowser()) {
            const current = loadBrowserDashboard(dashboard);
            saveBrowserDashboard({ ...current, notes: value.notes });
          } else {
            await saveNotes(data);
          }
          refresh();
          return { status: "saved", characters: value.notes.length };
        },
      },
    ];

    for (const tool of tools) {
      void Promise.resolve(context.registerTool({ ...tool, annotations: { readOnlyHint: false, untrustedContentHint: false } }, { signal: lifecycle.signal })).catch(() => undefined);
    }
    return () => lifecycle.abort();
  }, []);

  return (
    <main className="relative min-h-screen max-w-full overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#dda9ba_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative mx-auto min-w-0 max-w-[1440px]">
        <header className="float-in relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/75 px-5 py-6 shadow-[0_20px_60px_rgba(153,89,112,0.10)] backdrop-blur-md sm:px-8 lg:flex lg:items-center lg:justify-between lg:px-10 lg:py-8">
          <div aria-hidden="true" className="absolute -right-8 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#fbd3df] to-[#e6dcff] blur-2xl" />
          <div className="relative">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-[#9b6f80]">
              <span className="rounded-full border border-pink-100 bg-[#fff7f9] px-3 py-1.5">🌸 Daily reset</span>
              <span className="rounded-full border border-purple-100 bg-[#faf7ff] px-3 py-1.5">✨ {completion}% complete</span>
            </div>
            <p className="mb-1 text-[0.8rem] font-extrabold uppercase tracking-[0.18em] text-[#b88294]">{formattedDate}</p>
            <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-[-0.03em] text-[#5e3e4d] sm:text-4xl lg:text-5xl">Good morning, {data.profile.displayName}.</h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[#876a77] sm:text-lg">“{data.greetingMessage}”</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:flex-col lg:items-end">
            <div className="gentle-float grid h-20 w-20 overflow-hidden rounded-[1.5rem] border-2 border-white bg-gradient-to-br from-[#ffe4eb] to-[#eee6ff] text-4xl shadow-inner sm:h-24 sm:w-24">
              {data.profile.avatarUrl ? <img src={data.profile.avatarUrl} alt={`${data.profile.displayName}'s profile`} className="h-full w-full object-cover" /> : <span className="m-auto">🪷</span>}
            </div>
            <Link href="/settings" className="soft-glow flex h-10 items-center gap-2 rounded-xl bg-[#b9788e] px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#a9657d] focus:outline-none focus:ring-4 focus:ring-[#edc8d4]">
              <Settings className="h-3.5 w-3.5" /> Settings
            </Link>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(340px,0.8fr)]">
          <section className="float-in min-w-0 rounded-[1.75rem] border border-pink-100 bg-white/80 p-4 shadow-[0_18px_50px_rgba(153,89,112,0.08)] backdrop-blur-sm sm:p-6 lg:p-8" style={{ animationDelay: "80ms" }}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-sm font-extrabold uppercase tracking-[0.14em] text-[#bd8295]">Today’s rhythm</p>
                <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#5e3e4d]">My little to-do list</h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#8f7280]">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#fff0f4] text-[#bb7188]">{completedCount}</span>
                of {data.tasks.length} done
              </div>
            </div>

            <form ref={addForm} onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-2xl border border-[#f2d8e1] bg-gradient-to-r from-[#fff9fa] to-[#fbf8ff] p-3 sm:grid-cols-[minmax(180px,1fr)_150px_150px_auto] sm:p-4">
              <label className="sr-only" htmlFor="task-title">Task title</label>
              <input id="task-title" name="title" required maxLength={140} placeholder="Add something sweet & doable…" className="h-11 min-w-0 rounded-xl border border-[#edd4dd] bg-white px-4 text-base outline-none transition placeholder:text-[#b79ca6] focus:border-[#d99aae] focus:ring-4 focus:ring-[#f8dce5]" />
              <label className="relative">
                <span className="sr-only">Category</span>
                <select name="category" defaultValue="Personal" className="h-11 w-full appearance-none rounded-xl border border-[#edd4dd] bg-white px-3 pr-8 text-sm font-bold text-[#765967] outline-none focus:border-[#d99aae] focus:ring-4 focus:ring-[#f8dce5]">
                  {taskCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#a98794]" />
              </label>
              <label className="relative">
                <span className="sr-only">Priority</span>
                <select name="priority" defaultValue="Cute & Quick" className="h-11 w-full appearance-none rounded-xl border border-[#edd4dd] bg-white px-3 pr-8 text-sm font-bold text-[#765967] outline-none focus:border-[#d99aae] focus:ring-4 focus:ring-[#f8dce5]">
                  {priorities.map((priority) => <option key={priority}>{priority}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#a98794]" />
              </label>
              <button disabled={isPending} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b96f87] px-4 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(185,111,135,0.24)] transition hover:-translate-y-0.5 hover:bg-[#a95f78] focus:outline-none focus:ring-4 focus:ring-[#efc5d2] disabled:opacity-60">
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>

            <div className="mb-5 flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Filter tasks by category">
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-extrabold transition focus:outline-none focus:ring-4 focus:ring-[#f1d4de] ${activeCategory === category ? "border-[#bc748b] bg-[#bc748b] text-white shadow-sm" : "border-[#edd7df] bg-white/80 text-[#8a6a77] hover:bg-[#fff1f5]"}`}>
                  {category === "All" ? "All sprinkles" : `${categoryIcon[category]} ${category}`}
                </button>
              ))}
            </div>

            <div className="space-y-3" aria-busy={isPending}>
              {filteredTasks.length ? filteredTasks.map((task) => (
                <article key={task.id} className={`group flex items-center gap-3 rounded-2xl border bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-[#e6bdca] hover:shadow-[0_10px_28px_rgba(153,89,112,0.09)] sm:gap-4 sm:p-4 ${task.completed ? "opacity-65" : ""}`}>
                  <Checkbox checked={task.completed} aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`} onCheckedChange={() => run(() => toggleTask(task.id), (current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item) }))} className="h-6 w-6 rounded-lg border-2 border-[#d99aae] data-[state=checked]:border-[#b76d85] data-[state=checked]:bg-[#b76d85]" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-base font-bold text-[#654957] ${task.completed ? "line-through decoration-[#cc9bab] decoration-2" : ""}`}>{task.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${categoryStyle[task.category]}`}>{categoryIcon[task.category]} {task.category}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityStyle[task.priority]}`}>{task.priority === "Deadline" ? "⏰" : task.priority === "Big Focus" ? "🎀" : "✨"} {task.priority}</span>
                    </div>
                  </div>
                  <button onClick={() => run(() => deleteTask(task.id), (current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }))} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#b78e9c] opacity-70 transition hover:bg-[#fff0f3] hover:text-[#b44d69] group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-[#f4d8e1]" aria-label={`Delete ${task.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-[#e8cbd5] bg-[#fffafb] px-6 py-12 text-center">
                  <div className="text-4xl">🫧</div>
                  <p className="mt-3 break-words font-bold text-[#765a67]">Nothing here yet — a perfectly clean little slate.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <BibleVerseCard />
            <section className="float-in rounded-[1.75rem] border border-purple-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(120,92,150,0.08)] backdrop-blur-sm sm:p-6" style={{ animationDelay: "140ms" }}>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#9b80b6]">Tiny rituals</p>
                  <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#604d70]">Habit garden</h2>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2ebff] text-2xl">🌱</div>
              </div>
              <form ref={habitForm} onSubmit={handleAddHabit} className="mb-4 flex gap-2 rounded-2xl border border-[#e8ddf3] bg-[#fbf9ff] p-2">
                <label className="sr-only" htmlFor="habit-title">New habit</label>
                <input id="habit-title" name="title" required maxLength={80} placeholder="Add a tiny ritual…" className="h-10 min-w-0 flex-1 rounded-xl border border-[#e2d4ee] bg-white px-3 text-base outline-none transition placeholder:text-[#b5a2c2] focus:border-[#a98bc4] focus:ring-4 focus:ring-[#eee4f8]" />
                <button disabled={isPending} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#9173ad] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#80629e] focus:outline-none focus:ring-4 focus:ring-[#e5d8f1] disabled:opacity-60" aria-label="Add habit">
                  <Plus className="h-4 w-4" />
                </button>
              </form>
              <div className="space-y-3">
                {data.habits.map((habit) => (
                  <div key={habit.id} className={`group flex items-center gap-3 rounded-2xl border p-3.5 transition ${habit.completedToday ? "border-[#d9c9ee] bg-[#f8f4ff]" : "border-[#eee5f6] bg-white hover:border-[#dccbed]"}`}>
                    <button onClick={() => run(() => toggleHabit(habit.id), (current) => ({ ...current, habits: current.habits.map((item) => item.id === habit.id ? { ...item, completedToday: !item.completedToday, streak: Math.max(0, item.streak + (item.completedToday ? -1 : 1)) } : item) }))} aria-pressed={habit.completedToday} aria-label={`${habit.completedToday ? "Undo" : "Complete"} ${habit.title}`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 transition focus:outline-none focus:ring-4 focus:ring-[#e9dcf7] ${habit.completedToday ? "border-[#9b7db8] bg-[#9b7db8] text-white" : "border-[#d9cbe7] bg-white text-transparent hover:border-[#ae91c8]"}`}>
                      <Check className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-[#685474]">{habit.title}</p>
                      <p className="mt-0.5 text-sm font-bold text-[#a0787a]">🔥 {habit.streak} day streak</p>
                    </div>
                    {habit.completedToday && <span className="text-lg" aria-label="Completed today">🌟</span>}
                    <button onClick={() => run(() => deleteHabit(habit.id), (current) => ({ ...current, habits: current.habits.filter((item) => item.id !== habit.id) }))} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#aa91b7] opacity-60 transition hover:bg-[#f2eafa] hover:text-[#865d9d] group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-[#e9dcf7]" aria-label={`Delete ${habit.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {!data.habits.length && (
                  <div className="rounded-2xl border border-dashed border-[#dfd1eb] bg-[#fcfaff] px-4 py-8 text-center text-sm font-bold text-[#897296]">Plant your first tiny ritual above 🌱</div>
                )}
              </div>
            </section>

            <section className="float-in rounded-[1.75rem] border border-pink-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(153,89,112,0.08)] backdrop-blur-sm sm:p-6" style={{ animationDelay: "200ms" }}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#bc8295]">Brain confetti</p>
                  <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#5e3e4d]">Quick notes</h2>
                </div>
                <Sparkles className="h-6 w-6 text-[#c48da0]" />
              </div>
              <form onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);
                const notes = String(formData.get("notes") ?? "").slice(0, 5000);
                setSaved(false);
                run(async () => { await saveNotes(formData); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }, (current) => ({ ...current, notes }));
                if (isHostedBrowser()) { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
              }}>
                <textarea key={data.notes} name="notes" defaultValue={data.notes} maxLength={5000} rows={8} aria-label="Quick notes" placeholder="Drop your thoughts here…" className="w-full resize-y rounded-2xl border border-[#efd8e0] bg-[#fffafb] p-4 text-base leading-7 text-[#715461] outline-none transition placeholder:text-[#bea3ad] focus:border-[#d99aae] focus:ring-4 focus:ring-[#f8dce5]" />
                <button disabled={isPending} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e6c7d1] bg-white text-sm font-extrabold text-[#a56178] transition hover:-translate-y-0.5 hover:bg-[#fff3f6] focus:outline-none focus:ring-4 focus:ring-[#f4d8e1] disabled:opacity-60">
                  {saved ? <><Check className="h-4 w-4" /> Saved, sweetie!</> : <><Save className="h-4 w-4" /> Save my notes</>}
                </button>
              </form>
            </section>
          </aside>
        </div>

        <footer className="py-7 text-center text-sm font-bold text-[#a88694]">Made for gentle days &amp; getting things done 💗</footer>
      </div>
    </main>
  );
}
