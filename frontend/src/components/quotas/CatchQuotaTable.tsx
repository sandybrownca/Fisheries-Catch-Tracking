'use client';

import Progress from '@/components/ui/Progress';
import {QuotaUsage} from '@/types/api'
import clsx from 'clsx';

export function CatchQuotaTable({ data }: { data: QuotaUsage[] }) {
  //console.log(data);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Species</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Caught (kg)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Quota (kg)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Usage</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
         <tbody className="divide-y divide-gray-200">
          {data.map(row => (
            <tr key={row.species_id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
              <td className="px-4 py-3 text-gray-800">
                {row.species_name}
              </td>

              <td className="px-4 py-3 text-gray-800">
                {row.total_catch_kg.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-gray-800">
                {row.quota_kg.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-gray-800">
                <Progress
                  value={Math.min(row.percentage_used, 100)} variant={row.status} />
                <div className="mt-1 text-xs text-gray-500">
                  {Number(row.percentage_used).toFixed(1)}%
                </div>
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={clsx(
                    'rounded-full px-2 py-1 text-xs font-semibold',
                    {
                      'bg-green-100 text-green-700': row.status === 'safe',
                      'bg-yellow-100 text-yellow-700': row.status === 'warning',
                      'bg-orange-100 text-orange-700': row.status === 'critical',
                      'bg-red-100 text-red-700': row.status === 'exceeded',
                    }
                  )}
                >
                  {row.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
