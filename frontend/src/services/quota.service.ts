// src/services/quota.service.ts
import { api } from "./api";

export interface Quota {
  id: number;
  speciesId: number;
  year: number;
  totalAllowed: number;
  usedAmount: number;
}

export interface CreateQuotaDTO {
  speciesId: number;
  year: number;
  totalAllowed: number;
}

export const quotaService = {
  getAll(): Promise<Quota[]> {
    return api("/quotas");
  },

  create(data: CreateQuotaDTO): Promise<Quota> {
    return api("/quotas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete(id: number): Promise<void> {
    return api(`/quotas/${id}`, {
      method: "DELETE",
    });
  },
};
