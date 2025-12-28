// src/services/species.service.ts
import { api } from "./api";

export interface Species {
  id: number;
  commonName: string;
  scientificName: string;
  conservationStatus: string;
}

export interface CreateSpeciesDTO {
  commonName: string;
  scientificName: string;
  conservationStatus: string;
}

export const speciesService = {
  getAll(): Promise<Species[]> {
    return api("/species");
  },

  create(data: CreateSpeciesDTO): Promise<Species> {
    return api("/species", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete(id: number): Promise<void> {
    return api(`/species/${id}`, {
      method: "DELETE",
    });
  },
};
