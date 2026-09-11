import { readDashboard } from "@/lib/storage";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboard = await readDashboard();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone: dashboard.profile.timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return <DashboardClient dashboard={dashboard} formattedDate={formattedDate} />;
}
