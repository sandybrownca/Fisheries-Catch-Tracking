"use client";
import { Quota } from "@/services/quota.service";

export function QuotaTable({ data }: { data: Quota[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Species</th>
          <th>Limit (kg)</th>
          <th>Used (kg)</th>
          <th>Remaining (kg)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((q) => (
          <tr key={q.id}>
            <td>{q.speciesId}</td>
            <td>{q.totalAllowed}</td>
            <td>{q.usedAmount}</td>
            <td>{q.totalAllowed - q.usedAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
