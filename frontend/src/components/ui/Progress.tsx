"use client";

import React from "react";

type ProgressVariant = "safe" | "warning" | "critical" | "exceeded";

interface ProgressProps {
  value: number; // percentage (0–100+)
  variant?: ProgressVariant;
  height?: number;
}

const VARIANT_COLORS: Record<ProgressVariant, string> = {
  safe: "#22c55e",      // green
  warning: "#facc15",   // yellow
  critical: "#f97316",  // orange
  exceeded: "#ef4444",  // red
};

export default function Progress({
  value,
  variant = "safe",
  height = 10,
}: ProgressProps) {
  const clampedValue = Math.min(value, 100);

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e5e7eb",
        borderRadius: 999,
        overflow: "hidden",
        height,
      }}
    >
      <div
        style={{
          width: `${clampedValue}%`,
          backgroundColor: VARIANT_COLORS[variant],
          height: "100%",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}
