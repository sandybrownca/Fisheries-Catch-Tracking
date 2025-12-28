import { speciesService } from "@/services/species.service";
import { SpeciesTable } from "@/components/tables/SpeciesTable";

export default async function SpeciesPage() {
  const species = await speciesService.getAll();
  return (
    <div>
      <h1>Species</h1>
      <SpeciesTable data={species} />
    </div>
  );
}
