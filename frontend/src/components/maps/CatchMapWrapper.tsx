"use client"; // mandatory for client components

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getCatchLocationData } from "@/services/catch.service";

const CatchMap = dynamic(() => import("./CatchMap"), {
  ssr: false, // disable server-side rendering
});

interface Props {
  startDate: string;
  endDate: string;
}

export default function ClientCatchMap({ startDate, endDate }: Props) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getCatchLocationData({ startDate, endDate });
        setLocations(response.data);
      } catch (err) {
        console.error("Error fetching catch locations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading map...</div>;
  if (!locations.length) return <div>No catch locations found.</div>;

  return <CatchMap data={locations} />;
}
