// src/services/violation.service.ts
import { api } from "./api";

export interface Violation {
  id: number;
  vesselId: number;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  fineAmount: number;
  resolved: boolean;
  occurredAt: string;
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
  getAll(): Promise<Violation[]> {
    return api("/violations");
  },

  getById(id: number): Promise<Violation> {
    return api(`/violations/${id}`);
  },

  create(data: CreateViolationDTO): Promise<Violation> {
    return api("/violations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: UpdateViolationDTO): Promise<Violation> {
    return api(`/violations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id: number): Promise<void> {
    return api(`/violations/${id}`, {
      method: "DELETE",
    });
  },
};
