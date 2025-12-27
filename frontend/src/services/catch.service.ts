import { api } from "./api";
import { ApiResponse, CatchLog } from "@/types/api";

interface GetCatchLogsParams {
  vesselId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function getCatchLogs(params: GetCatchLogsParams = {}) {
  const query = new URLSearchParams();
  if (params.vesselId) query.append("vessel_id", params.vesselId);
  if (params.startDate) query.append("start_date", params.startDate);
  if (params.endDate) query.append("end_date", params.endDate);
  query.append("page", (params.page || 1).toString());
  query.append("limit", (params.limit || 20).toString());

  return api<ApiResponse<CatchLog[]>>(`/catches?${query.toString()}`);
}
