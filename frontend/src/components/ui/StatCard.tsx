interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: "normal" | "warning" | "critical";
}

export default function StatCard({
  label,
  value,
  highlight = "normal",
}: StatCardProps) {
  const borderColor =
    highlight === "critical"
      ? "#dc2626"
      : highlight === "warning"
      ? "#f59e0b"
      : "#e5e7eb";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: 16,
        backgroundColor: "#ffffff",
      }}
    >
      <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
        {label}
      </p>
      <h2 style={{ margin: "8px 0 0", fontSize: 24 }}>{value}</h2>
    </div>
  );
}
