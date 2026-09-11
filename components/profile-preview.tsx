"use client";

import { useEffect, useState } from "react";
import { isHostedBrowser, loadBrowserDashboard } from "@/lib/browser-storage";
import type { DashboardData } from "@/lib/storage";

export function ProfilePreview({ dashboard }: { dashboard: DashboardData }) {
  const [data, setData] = useState(dashboard);

  useEffect(() => {
    if (isHostedBrowser()) setData(loadBrowserDashboard(dashboard));
  }, [dashboard]);

  if (!data.profile.avatarUrl) return null;

  return (
    <div className="gentle-float grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-[#f9cad8] to-[#dfd2f5] text-2xl font-black text-[#785267] shadow-[0_12px_30px_rgba(153,89,112,0.16)]">
      <img src={data.profile.avatarUrl} alt={`${data.profile.displayName}'s profile`} className="h-full w-full object-cover" />
    </div>
  );
}
