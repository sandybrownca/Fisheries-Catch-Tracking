import { speciesService } from "@/services/species.service";
import { SpeciesTable } from "@/components/tables/SpeciesTable";

export default async function SpeciesPage() {
  const response = await speciesService.getAll();
  const species = response.data;
  return (
    <div>
      <h1>Species</h1>
      <br/>
      <SpeciesTable data={species} />
    </div>
  );
}
