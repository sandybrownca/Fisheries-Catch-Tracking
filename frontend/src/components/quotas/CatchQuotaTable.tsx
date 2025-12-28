'use client';

import Progress from '@/components/ui/Progress';
import {QuotaUsage} from '@/types/api'
import clsx from 'clsx';

export function CatchQuotaTable({ data }: { data: QuotaUsage[] }) {
  //console.log(data);
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">Species</th>
            <th className="px-4 py-3 text-right">Caught (kg)</th>
            <th className="px-4 py-3 text-right">Quota (kg)</th>
            <th className="px-4 py-3">Usage</th>
            <th className="px-4 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.species_id} className="border-b">
              <td className="px-4 py-3 font-medium">
                {row.species_name}
              </td>

              <td className="px-4 py-3 text-right">
                {row.total_catch_kg.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-right">
                {row.quota_kg.toLocaleString()}
              </td>

              <td className="px-4 py-3">
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
