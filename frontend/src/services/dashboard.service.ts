import { api } from "./api";
import { ApiResponse, DashboardStats, CatchVsQuota } from "@/types/api";

export function getDashboardStats(year: number) {
  return api<ApiResponse<DashboardStats>>(
    `/dashboard/stats?year=${year}`
  );
}

export function getCatchVsQuota(
  year: number,
  vesselId?: string
) {
  const params = new URLSearchParams({ year: year.toString() });

  if (vesselId) {
    params.append("vessel_id", vesselId);
  }

  return api<ApiResponse<CatchVsQuota[]>>(
    `/dashboard/catch-vs-quota?${params.toString()}`
  );
}
