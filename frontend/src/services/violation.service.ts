// src/services/violation.service.ts
import { ApiResponse } from "@/types/api";
import { api } from "./api";

export interface Violation {
  id: number;
  vesselId: number;
  violation_type: string;
  vessel_name: string;
  description: string;
  severity: "minor" | "major" | "critical";
  penalty_amount: number;
  status: boolean;
  violation_date: string;
}

export interface CreateViolationDTO {
  vesselId: number;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  fineAmount: number;
}

export interface UpdateViolationDTO {
  resolved?: boolean;
}

export const violationService = {
  getAll(){
    return api<ApiResponse<Violation[]>>("/violations");
  },

  getById(id: number) {
    return api<ApiResponse<Violation>>(`/violations/${id}`);
  },

  create(data: CreateViolationDTO) {
    return api("/violations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: UpdateViolationDTO) {
    return api(`/violations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id: number) {
    return api(`/violations/${id}`, {
      method: "DELETE",
    });
  },
};
