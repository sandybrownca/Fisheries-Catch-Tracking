import { getCatchLogs } from "@/services/catch.service";
import CatchLogsTable from "@/components/tables/CatchLogsTable";

export default async function CatchLogsPage() {
  const response = await getCatchLogs({ page: 1, limit: 50 });
  const catchLogs = response.data;

  return (
    <section>
      <h1 style={{ marginBottom: 24 }}>Catch Logs</h1>
      <CatchLogsTable data={catchLogs} />
    </section>
  );
}
