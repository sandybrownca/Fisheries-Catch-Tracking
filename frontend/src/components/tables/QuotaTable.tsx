"use client";
import { Quota } from "@/services/quota.service";

export function QuotaTable({ data }: { data: Quota[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Species</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Limit (kg)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Used (kg)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Remaining (kg)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((q) => (
            <tr key={q.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
              <td className="px-4 py-3 text-gray-800">{q.speciesId}</td>
              <td className="px-4 py-3 text-gray-800">{q.totalAllowed}</td>
              <td className="px-4 py-3 text-gray-800">{q.usedAmount}</td>
              <td className="px-4 py-3 text-gray-800">{q.totalAllowed - q.usedAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
