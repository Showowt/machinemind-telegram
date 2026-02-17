import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MachineMind Telegram Bot",
  description: "Command center for MachineMind deployments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
