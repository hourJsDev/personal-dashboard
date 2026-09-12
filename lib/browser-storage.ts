import type { DashboardData } from "@/lib/storage";

const storageKey = "petal-and-plan-dashboard-v2";
const removedDefaultAvatar = "/uploads/profile-06fdbf71-d49a-4f64-9733-c921221c3c8b.png";

export function isHostedBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return !["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function todayKey(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function loadBrowserDashboard(fallback: DashboardData): DashboardData {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      saveBrowserDashboard(fallback);
      return fallback;
    }
    const parsed = JSON.parse(saved) as Partial<DashboardData>;
    const dashboard: DashboardData = {
      ...fallback,
      ...parsed,
      profile: {
        ...fallback.profile,
        ...parsed.profile,
        avatarUrl: parsed.profile?.avatarUrl === removedDefaultAvatar
          ? ""
          : parsed.profile?.avatarUrl ?? fallback.profile.avatarUrl,
      },
      preferences: { ...fallback.preferences, ...parsed.preferences },
      tasks: parsed.tasks ?? fallback.tasks,
      habits: parsed.habits ?? fallback.habits,
      dateWidgets: parsed.dateWidgets ?? fallback.dateWidgets,
    };
    const today = todayKey(dashboard.profile.timezone);
    const tasks = dashboard.tasks.filter((task) => task.date === today);
    const current = tasks.length === dashboard.tasks.length ? dashboard : { ...dashboard, tasks };
    if (current !== dashboard) saveBrowserDashboard(current);
    return current;
  } catch {
    return fallback;
  }
}

export function saveBrowserDashboard(dashboard: DashboardData): void {
  window.localStorage.setItem(storageKey, JSON.stringify(dashboard));
}

export function getBrowserTodayKey(timezone: string): string {
  return todayKey(timezone);
}
