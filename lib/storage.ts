import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

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
  notes: string;
  profile: DashboardProfile;
  preferences: DashboardPreferences;
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "dashboard.json");
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
  const raw = await readFile(dataFile, "utf8");
  const parsed = JSON.parse(raw) as Partial<DashboardData>;
  const dashboard: DashboardData = {
    greetingMessage: parsed.greetingMessage ?? "A fresh day is yours to shape.",
    tasks: parsed.tasks ?? [],
    habits: parsed.habits ?? [],
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
    await writeDashboard(refreshedDashboard);
    return refreshedDashboard;
  }

  return dashboard;
}

export async function writeDashboard(data: DashboardData): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.${process.pid}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(temporaryFile, dataFile);
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
