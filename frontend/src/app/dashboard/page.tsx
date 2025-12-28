
import { getDashboardStats, getCatchVsQuota } from "@/services/dashboard.service";
import StatCard from "@/components/ui/StatCard";
import CatchQuotaChart from "@/components/charts/CatchQuotaChart";
import CatchMapWrapper from "@/components/maps/CatchMapWrapper";




export default async function DashboardPage() {
  const statsResponse = await getDashboardStats(2025); //hardcoded for now
  const quotaResponse = await getCatchVsQuota(2025);
  //const mapResponse = await getCatchLocationData({ startDate: "2024-01-01", endDate: "2025-12-31" });

  //console.log(quotaResponse)
  const stats = statsResponse.data;
  //stats.active_violations =12;
  //stats.quota_compliance_rate = 89;
  const catchVsQuota = quotaResponse.data;
  //const catchLocations = mapResponse.data;
  return (
    <section>
      <h1 style={{ marginBottom: 24 }}>Sustainability Dashboard</h1>
      
      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <StatCard label="Active Vessels" value={stats.active_vessels} />
        <StatCard label="Catch Today (kg)" value={stats.total_catch_today} />
        <StatCard
          label="Active Violations"
          value= {stats.active_violations}
          highlight={stats.active_violations > 0 ? "warning" : "normal"}
        />
        <StatCard
          label="Compliance Rate (%)"
          value={stats.quota_compliance_rate}
          highlight={stats.quota_compliance_rate < 90 ? "critical" : "normal"}
        />
      </div>

      {/* Catch vs Quota Chart */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Catch vs Quota</h2>
        <CatchQuotaChart data={catchVsQuota} />
      </div>

      {/* Catch Locations Map */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ marginBottom: 16 }}>Catch Locations Map</h2>
        <CatchMapWrapper startDate="2024-01-01" endDate="2025-12-31" />
      </div>
    </section>
  );
}
