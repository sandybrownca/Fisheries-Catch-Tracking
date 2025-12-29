"use client";
import { Vessel } from "@/services/vessel.service";

export function VesselTable({ data }: { data: Vessel[] }) {
  console.log(data);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Registration</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Vessel Type</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Home Port</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Length(Meters)</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((v) => (
          <tr key={v.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
            <td className="px-4 py-3 text-gray-800">{v.vessel_name}</td>
            <td className="px-4 py-3 text-gray-800">{v.registration_number}</td>
            <td className="px-4 py-3 text-gray-800">{v.vessel_type}</td>
            <td className="px-4 py-3 text-gray-800">{v.home_port}</td>
            <td className="px-4 py-3 text-gray-800">{v.length_meters}</td>
            <td className="px-4 py-3 text-gray-800">{v.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
