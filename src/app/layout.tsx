import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loan Tracker",
  description: "Track loan applications and their status",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)]">{children}</body>
    </html>
  );
}
