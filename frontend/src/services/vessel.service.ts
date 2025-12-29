// src/services/vessel.service.ts
import { ApiResponse } from "@/types/api";
import { api } from "./api";

export interface Vessel {
  id: number;
  vessel_name: string;
  registration_number: string;
  home_port: string;
  owner_name: string;
  status: "active" | "inactive";
  createdAt: string;
  vessel_type: string;
  length_meters: string;

}

export interface CreateVesselDTO {
  vessel_name: string;
  registration_number: string;
  home_port: string;
  owner_name: string;
  vessel_type: string;
  length_meters:string;
}

export interface UpdateVesselDTO extends Partial<CreateVesselDTO> {
  status?: "active" | "inactive";
}

export const vesselService = {
  getAll() {
    return api<ApiResponse<Vessel[]>>("/vessels");
  },

  getById(id: number) {
    return api<ApiResponse<Vessel>>(`/vessels/${id}`);
  },

  create(data: CreateVesselDTO) {
    return api("/vessels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: UpdateVesselDTO) {
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
