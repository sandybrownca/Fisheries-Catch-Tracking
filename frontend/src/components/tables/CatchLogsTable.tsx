"use client";

import { CatchLog } from "@/types/api";

interface CatchLogsTableProps {
  data: CatchLog[];
}

export default function CatchLogsTable({ data }: CatchLogsTableProps) {
  console.log(data);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Vessel</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Captain</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Species</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Weight (kg)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Zone</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Method</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Violation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((c) => (
            <tr key={c.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
              <td className="px-4 py-3 text-gray-800">{c.vessel_name}</td>
              <td className="px-4 py-3 text-gray-800">{c.captain_first_name+" "+c.captain_last_name}</td>
              <td className="px-4 py-3 text-gray-800">{c.species_name}</td>
              <td className="px-4 py-3 text-gray-800">{new Date(c.catch_date).toDateString()}</td>
              <td className="px-4 py-3 text-gray-800">{c.weight_kg.toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-800">{c.fishing_zone}</td>
              <td className="px-4 py-3 text-gray-800">{c.fishing_method}</td>
              <td className="px-4 py-3 text-gray-800">
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
    </div>
  );
}
