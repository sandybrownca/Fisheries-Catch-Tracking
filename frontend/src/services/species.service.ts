// src/services/species.service.ts
import { ApiResponse } from "@/types/api";
import { api } from "./api";

export interface Species {
  id: number;
  common_name: string;
  scientific_name: string;
  conservation_status: string;
}

export interface CreateSpeciesDTO {
  common_name: string;
  scientific_name: string;
  conservation_status: string;
}

export const speciesService = {
  getAll() {
    return api<ApiResponse<Species[]>>("/species");
  },

  create(data: CreateSpeciesDTO) {
    return api("/species", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete(id: number){
    return api(`/species/${id}`, {
      method: "DELETE",
    });
  },
};
