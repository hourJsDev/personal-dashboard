import dashboardSeed from "@/data/dashboard.json";

export type TaskCategory = "Work" | "Personal" | "Creative" | "Shopping";
export type TaskPriority = "Cute & Quick" | "Big Focus" | "Deadline";

export type DashboardTask = {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  date: string;
};

export type DashboardHabit = {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
};

export type DateWidgetKind = "countdown" | "countup";

export type DashboardDateWidget = {
  id: string;
  title: string;
  date: string;
  kind: DateWidgetKind;
  emoji: string;
  repeatsAnnually: boolean;
};

export type DashboardProfile = {
  displayName: string;
  avatarUrl: string;
  timezone: string;
};

export type DashboardPreferences = {
  showCompletedTasks: boolean;
};

export type DashboardData = {
  greetingMessage: string;
  tasks: DashboardTask[];
  habits: DashboardHabit[];
  dateWidgets: DashboardDateWidget[];
  notes: string;
  profile: DashboardProfile;
  preferences: DashboardPreferences;
};

let memoryDashboard: DashboardData | null = null;
let updateQueue: Promise<unknown> = Promise.resolve();

export function getTodayKey(date = new Date(), timezone?: string): string {
  if (timezone) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function readDashboard(): Promise<DashboardData> {
  if (memoryDashboard) return memoryDashboard;
  const parsed = dashboardSeed as Partial<DashboardData>;
  const dashboard: DashboardData = {
    greetingMessage: parsed.greetingMessage ?? "A fresh day is yours to shape.",
    tasks: parsed.tasks ?? [],
    habits: parsed.habits ?? [],
    dateWidgets: parsed.dateWidgets ?? [],
    notes: parsed.notes ?? "",
    profile: {
      displayName: parsed.profile?.displayName ?? "Lovely",
      avatarUrl: parsed.profile?.avatarUrl ?? "",
      timezone: parsed.profile?.timezone ?? "Asia/Phnom_Penh",
    },
    preferences: {
      showCompletedTasks: parsed.preferences?.showCompletedTasks ?? true,
    },
  };
  const today = getTodayKey(new Date(), dashboard.profile.timezone);
  const currentTasks = dashboard.tasks.filter((task) => task.date === today);

  if (currentTasks.length !== dashboard.tasks.length) {
    const refreshedDashboard = { ...dashboard, tasks: currentTasks };
    memoryDashboard = refreshedDashboard;
    return refreshedDashboard;
  }

  memoryDashboard = dashboard;
  return dashboard;
}

export async function writeDashboard(data: DashboardData): Promise<void> {
  memoryDashboard = data;
}

export function updateDashboard(
  updater: (current: DashboardData) => DashboardData | Promise<DashboardData>,
): Promise<void> {
  const update = updateQueue.then(async () => {
    const current = await readDashboard();
    await writeDashboard(await updater(current));
  });

  updateQueue = update.catch(() => undefined);
  return update;
}
