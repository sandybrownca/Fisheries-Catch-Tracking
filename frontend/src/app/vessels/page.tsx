import { vesselService } from "@/services/vessel.service";
import { VesselTable } from "@/components/tables/VesselTable";

export default async function VesselsPage() {
  const vessels = await vesselService.getAll();

  return (
    <div>
      <h1>Vessels</h1>
      <VesselTable data={vessels} />
    </div>
  );
}
