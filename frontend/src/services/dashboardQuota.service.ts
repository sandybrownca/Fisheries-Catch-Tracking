import {api} from "./api";
import { ApiResponse,QuotaUsage} from "@/types/api";

export async function getQuotaUsage(year: number) {
  return api<ApiResponse<QuotaUsage[]>>(
    `/dashboard/quota-usage?year=${year}`
  );
}
