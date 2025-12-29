"use client";
import { Vessel } from "@/services/vessel.service";

export function VesselTable({ data }: { data: Vessel[] }) {
  console.log(data);
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Registration</th>
          <th>Vessel Type</th>
          <th>Home Port</th>
          <th>Length(Meters)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((v) => (
          <tr key={v.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td>{v.vessel_name}</td>
            <td>{v.registration_number}</td>
            <td>{v.vessel_type}</td>
            <td>{v.home_port}</td>
            <td>{v.length_meters}</td>
            <td>{v.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
