// src/services/vessel.service.ts
import { api } from "./api";

export interface Vessel {
  id: number;
  name: string;
  registrationNumber: string;
  flagCountry: string;
  ownerName: string;
  status: "active" | "suspended";
  createdAt: string;
}

export interface CreateVesselDTO {
  name: string;
  registrationNumber: string;
  flagCountry: string;
  ownerName: string;
}

export interface UpdateVesselDTO extends Partial<CreateVesselDTO> {
  status?: "active" | "suspended";
}

export const vesselService = {
  getAll(): Promise<Vessel[]> {
    return api("/vessels");
  },

  getById(id: number): Promise<Vessel> {
    return api(`/vessels/${id}`);
  },

  create(data: CreateVesselDTO): Promise<Vessel> {
    return api("/vessels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: UpdateVesselDTO): Promise<Vessel> {
    return api(`/vessels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: number): Promise<void> {
    return api(`/vessels/${id}`, {
      method: "DELETE",
    });
  },
};
