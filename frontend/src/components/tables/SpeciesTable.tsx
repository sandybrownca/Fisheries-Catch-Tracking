"use client";
import { Species } from "@/services/species.service";

export function SpeciesTable({ data }: { data: Species[] }) {
    console.log(data);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Common Name</th>
          <th>Conservation Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.id}>
            <td>{s.scientificName}</td>
            <td>{s.commonName}</td>
            <td>{s.conservationStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
