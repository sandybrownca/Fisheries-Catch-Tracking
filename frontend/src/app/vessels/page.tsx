import { vesselService } from "@/services/vessel.service";
import { VesselTable } from "@/components/tables/VesselTable";

export default async function VesselsPage() {
  const response = await vesselService.getAll();
  const vessels = response.data

  return (
    <div>
      <h1>Vessels</h1>
      <VesselTable data={vessels} />
    </div>
  );
}
