"use client";
import { Violation } from "@/services/violation.service";

export function ViolationTable({ data }: { data: Violation[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Vessel</th>
          <th>Type</th>
          <th>Date</th>
          <th>Resolved</th>
        </tr>
      </thead>
      <tbody>
        {data.map((v) => (
          <tr key={v.id}>
            <td>{v.vesselId}</td>
            <td>{v.type}</td>
            <td>{new Date(v.occurredAt).toLocaleDateString()}</td>
            <td>{v.resolved ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
