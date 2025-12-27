export interface ApiResponse<T> {
  success: boolean;
  data: T;
}


export interface DashboardStats {
  total_vessels: number;
  active_vessels: number;
  total_catch_today: number;
  total_catch_this_month: number;
  total_catch_this_year: number;
  active_violations: number;
  critical_violations: number;
  quota_compliance_rate: number;
}

export interface CatchVsQuota {
  species_id: string;
  species_name: string;
  total_catch_kg: number;
  quota_kg: number;
  percentage_used: number;
  status: "normal" | "warning" | "critical";
}

export interface CatchLog {
  id: string;
  vessel_name: string;
  captain_name: string;
  species_name: string;
  catch_date: string;
  catch_time: string;
  weight_kg: number;
  latitude: number;
  longitude: number;
  fishing_zone: string;
  fishing_method: string;
  notes: string;
  violation: boolean;
  violation_severity?: "low" | "medium" | "high" | "critical";
}
