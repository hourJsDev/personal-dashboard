"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getTodayKey, updateDashboard, type TaskCategory, type TaskPriority } from "@/lib/storage";

const categories: TaskCategory[] = ["Work", "Personal", "Creative", "Shopping"];
const priorities: TaskPriority[] = ["Cute & Quick", "Big Focus", "Deadline"];

function revalidateDashboard() {
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function addTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "Personal") as TaskCategory;
  const priority = String(formData.get("priority") ?? "Cute & Quick") as TaskPriority;
  if (!title || !categories.includes(category) || !priorities.includes(priority)) return;

  await updateDashboard((dashboard) => ({
    ...dashboard,
    tasks: [{
      id: crypto.randomUUID(), title: title.slice(0, 140), category, priority,
      completed: false, date: getTodayKey(new Date(), dashboard.profile.timezone),
    }, ...dashboard.tasks],
  }));
  revalidateDashboard();
}

export async function toggleTask(id: string) {
  await updateDashboard((dashboard) => ({
    ...dashboard,
    tasks: dashboard.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task),
  }));
  revalidateDashboard();
}

export async function deleteTask(id: string) {
  await updateDashboard((dashboard) => ({
    ...dashboard,
    tasks: dashboard.tasks.filter((task) => task.id !== id),
  }));
  revalidateDashboard();
}

export async function toggleHabit(id: string) {
  await updateDashboard((dashboard) => ({
    ...dashboard,
    habits: dashboard.habits.map((habit) => {
      if (habit.id !== id) return habit;
      const completedToday = !habit.completedToday;
      return { ...habit, completedToday, streak: Math.max(0, habit.streak + (completedToday ? 1 : -1)) };
    }),
  }));
  revalidateDashboard();
}

export async function addHabit(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await updateDashboard((dashboard) => ({
    ...dashboard,
    habits: [
      ...dashboard.habits,
      { id: crypto.randomUUID(), title: title.slice(0, 80), streak: 0, completedToday: false },
    ],
  }));
  revalidateDashboard();
}

export async function deleteHabit(id: string) {
  await updateDashboard((dashboard) => ({
    ...dashboard,
    habits: dashboard.habits.filter((habit) => habit.id !== id),
  }));
  revalidateDashboard();
}

export async function saveNotes(formData: FormData) {
  const notes = String(formData.get("notes") ?? "").slice(0, 5000);
  await updateDashboard((dashboard) => ({ ...dashboard, notes }));
  revalidateDashboard();
}

export async function updateSettings(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 60);
  const greetingMessage = String(formData.get("greetingMessage") ?? "").trim().slice(0, 220);
  const timezone = String(formData.get("timezone") ?? "Asia/Phnom_Penh");
  const showCompletedTasks = formData.get("showCompletedTasks") === "on";
  const avatar = formData.get("avatar");
  const allowedTimezones = ["Asia/Phnom_Penh", "Asia/Bangkok", "Asia/Singapore", "Europe/London", "America/New_York", "UTC"];

  let uploadedAvatarUrl = "";
  if (avatar && typeof avatar !== "string" && avatar.size > 0 && avatar.size <= 3 * 1024 * 1024) {
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
    };
    const extension = extensions[avatar.type];
    if (extension) {
      const uploadDirectory = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDirectory, { recursive: true });
      const filename = `profile-${crypto.randomUUID()}.${extension}`;
      await writeFile(path.join(uploadDirectory, filename), Buffer.from(await avatar.arrayBuffer()));
      uploadedAvatarUrl = `/uploads/${filename}`;
    }
  }

  await updateDashboard((dashboard) => ({
    ...dashboard,
    greetingMessage: greetingMessage || dashboard.greetingMessage,
    profile: {
      displayName: displayName || dashboard.profile.displayName,
      timezone: allowedTimezones.includes(timezone) ? timezone : dashboard.profile.timezone,
      avatarUrl: uploadedAvatarUrl || dashboard.profile.avatarUrl,
    },
    preferences: { showCompletedTasks },
  }));
  revalidateDashboard();
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}
