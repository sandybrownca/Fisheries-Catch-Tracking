import { CatchQuotaTable } from '@/components/quotas/CatchQuotaTable';
import { getQuotaUsage } from '@/services/dashboardQuota.service';


export default async function QuotaDashboardPage() {
  const response = await getQuotaUsage(2025);
  const quotas = response.data;
  console.log(quotas[0]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Catch vs Quota Overview</h1>
      <CatchQuotaTable data={quotas} />
    </div>
  );
}
