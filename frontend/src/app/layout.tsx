import "../styles/globals.css";

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
        <main>{children}</main>
      </body>
    </html>
  );
}
