"use client";
import { Violation } from "@/services/violation.service";

export function ViolationTable({ data }: { data: Violation[] }) {
  console.log(data);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Vessel</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Resolved</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.length===0 ?
        (<tr className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
            <td className="px-4 py-3 text-gray-800">{"No Data to show"}</td>
            </tr>
            )
        :(data.map((v) => (
          <tr key={v.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
            <td className="px-4 py-3 text-gray-800">{v.vessel_name}</td>
            <td className="px-4 py-3 text-gray-800">{v.violation_type}</td>
            <td className="px-4 py-3 text-gray-800">{new Date(v.violation_date).toDateString()}</td>
            <td className="px-4 py-3 text-gray-800">{v.status}</td>
          </tr>
        )))}
      </tbody>
    </table>
    </div>
  );
}
