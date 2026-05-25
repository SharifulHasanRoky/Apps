import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AdWise — AI for Meta ads",
  description: "AI-powered Meta ads optimization, like Madgicx.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-zinc-100 antialiased">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
