import type { Metadata } from "next";
import { PetalFall } from "@/components/petal-fall";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petal & Plan — Daily Dashboard",
  description: "A soft, focused home for daily tasks, habits, and quick notes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PetalFall />
        {children}
      </body>
    </html>
  );
}
