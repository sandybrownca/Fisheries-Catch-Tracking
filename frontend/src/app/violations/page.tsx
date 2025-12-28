import { violationService } from "@/services/violation.service";
import { ViolationTable } from "@/components/tables/ViolationTable";

export default async function ViolationsPage() {
  const violations = await violationService.getAll();

  return (
    <div>
      <h1>Violations</h1>
      <ViolationTable data={violations} />
    </div>
  );
}
