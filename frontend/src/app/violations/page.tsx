import { violationService } from "@/services/violation.service";
import { ViolationTable } from "@/components/tables/ViolationTable";

export default async function ViolationsPage() {
  const response = await violationService.getAll();
  const violations = response.data;
  return (
    <div>
      <h1>Violations</h1>
      <ViolationTable data={violations} />
    </div>
  );
}
