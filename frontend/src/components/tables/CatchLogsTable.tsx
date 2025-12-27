"use client";

import { CatchLog } from "@/types/api";

interface CatchLogsTableProps {
  data: CatchLog[];
}

export default function CatchLogsTable({ data }: CatchLogsTableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Vessel</th>
          <th>Captain</th>
          <th>Species</th>
          <th>Date</th>
          <th>Weight (kg)</th>
          <th>Zone</th>
          <th>Method</th>
          <th>Violation</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c) => (
          <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td>{c.vessel_name}</td>
            <td>{c.captain_name}</td>
            <td>{c.species_name}</td>
            <td>{c.catch_date}</td>
            <td>{c.weight_kg.toFixed(2)}</td>
            <td>{c.fishing_zone}</td>
            <td>{c.fishing_method}</td>
            <td>
              {c.violation ? (
                <span
                  style={{
                    color:
                      c.violation_severity === "critical"
                        ? "#dc2626"
                        : c.violation_severity === "high"
                        ? "#f87171"
                        : c.violation_severity === "medium"
                        ? "#fbbf24"
                        : "#facc15",
                    fontWeight: "600",
                  }}
                >
                  {c.violation_severity?.toUpperCase() || "⚠️"}
                </span>
              ) : (
                <span style={{ color: "#16a34a" }}>✓</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
