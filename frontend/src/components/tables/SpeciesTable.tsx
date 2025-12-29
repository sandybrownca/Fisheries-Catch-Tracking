"use client";
import { Species } from "@/services/species.service";


interface SpeciesTableProps {
  data: Species[];
}

export function SpeciesTable({ data }: SpeciesTableProps) {

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Common Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Conservation Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {data.map((s) => (
            <tr key={s.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
              <td className="px-4 py-3 text-gray-800">{s.scientific_name}</td>
              <td className="px-4 py-3 text-gray-800">{s.common_name}</td>
              <td className="px-4 py-3">
                <span className= {`inline-flex rounded-full px-2 py-1 text-xs font-medium 
                  ${s.conservation_status=="Vulnerable"? "bg-red-100 text-red-700":
                  s.conservation_status=="Near Threatened"?"bg-yellow-100 text-yellow-700":"bg-green-100 text-green-700"}`}>
                  {s.conservation_status}
                </span>
              </td>
            </tr>
          ))
          }
        </tbody>
      </table>
    </div>

  );
}
