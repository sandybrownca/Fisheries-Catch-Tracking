import "../styles/globals.css";
import { TopNav } from "@/components/layout/TopNav";

export const metadata = {
  title: "Fisheries Sustainability Dashboard",
  description: "Catch tracking and regulatory compliance system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <main className="mx-auto max-w-7xl p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
