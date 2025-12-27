"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CatchVsQuota } from "@/types/api";

interface CatchQuotaChartProps {
  data: CatchVsQuota[];
}

export default function CatchQuotaChart({ data }: CatchQuotaChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    color:
      d.status === "critical"
        ? "#dc2626"
        : d.status === "warning"
        ? "#f59e0b"
        : "#16a34a",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} margin={{ top: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="species_name" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="total_catch_kg"
          fill="#8884d8"
          name="Catch"
          label={{ position: "top" }}
        />
        <Bar
          dataKey="quota_kg"
          fill="#82ca9d"
          name="Quota"
          label={{ position: "top" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
