export type UserRole = 'operator' | 'captain' | 'regulator' | 'admin';
export type VesselStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned';
export type CrewStatus = 'active' | 'inactive';
export type QuotaStatus = 'active' | 'expired' | 'suspended';
export type ViolationType = 'quota_exceeded' | 'seasonal_ban' | 'undersized_catch' | 'restricted_zone' | 'unreported_catch';
export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vessel {
  id: string;
  registration_number: string;
  vessel_name: string;
  vessel_type?: string;
  length_meters?: number;
  tonnage?: number;
  home_port?: string;
  owner_id?: string;
  status: VesselStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CrewAssignment {
  id: string;
  vessel_id: string;
  user_id: string;
  role: string;
  is_captain: boolean;
  assigned_date: Date;
  end_date?: Date;
  status: CrewStatus;
  created_at: Date;
}

export interface Species {
  id: string;
  common_name: string;
  scientific_name?: string;
  species_code: string;
  conservation_status?: string;
  min_legal_size_cm?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Quota {
  id: string;
  species_id: string;
  year: number;
  total_quota_kg: number;
  vessel_id?: string;
  start_date: Date;
  end_date: Date;
  status: QuotaStatus;
  created_at: Date;
  updated_at: Date;
}

export interface SeasonalRestriction {
  id: string;
  species_id: string;
  region?: string;
  ban_start_date: Date;
  ban_end_date: Date;
  year: number;
  reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CatchLog {
  id: string;
  vessel_id: string;
  captain_id?: string;
  species_id: string;
  catch_date: Date;
  catch_time: string;
  weight_kg: number;
  latitude: number;
  longitude: number;
  fishing_zone?: string;
  fishing_method?: string;
  notes?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
}

export interface Violation {
  id: string;
  catch_log_id?: string;
  vessel_id: string;
  violation_type: ViolationType;
  severity: ViolationSeverity;
  description: string;
  detected_at: Date;
  resolved: boolean;
  resolved_at?: Date;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  created_at: Date;
}

// DTOs for API requests
export interface CreateVesselDTO {
  registration_number: string;
  vessel_name: string;
  vessel_type?: string;
  length_meters?: number;
  tonnage?: number;
  home_port?: string;
  owner_id?: string;
}

export interface CreateCatchLogDTO {
  vessel_id: string;
  captain_id?: string;
  species_id: string;
  catch_date: string;
  catch_time: string;
  weight_kg: number;
  latitude: number;
  longitude: number;
  fishing_zone?: string;
  fishing_method?: string;
  notes?: string;
}

export interface CreateQuotaDTO {
  species_id: string;
  year: number;
  total_quota_kg: number;
  vessel_id?: string;
  start_date: string;
  end_date: string;
}

export interface CreateSeasonalRestrictionDTO {
  species_id: string;
  region?: string;
  ban_start_date: string;
  ban_end_date: string;
  year: number;
  reason?: string;
}

// Dashboard analytics types
export interface CatchVsQuotaData {
  species_id: string;
  species_name: string;
  total_catch_kg: number;
  quota_kg: number;
  percentage_used: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
}

export interface SpeciesTrendData {
  species_id: string;
  species_name: string;
  monthly_catches: {
    month: string;
    total_kg: number;
    catch_count: number;
  }[];
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