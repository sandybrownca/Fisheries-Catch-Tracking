"use client";
import { Vessel } from "@/services/vessel.service";

export function VesselTable({ data }: { data: Vessel[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Registration</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {data.map((v) => (
          <tr key={v.id}>
            <td>{v.name}</td>
            <td>{v.registrationNumber}</td>
            <td>{v.ownerName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
