import type { Metadata, Viewport } from "next";
import { DemoBar } from "@/components/DemoBar";
import { Hydrated } from "@/components/Hydrated";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frænd Corporate Lunch (demo)",
  description: "Demo prototype of Frænd's corporate lunch ordering platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f3d2d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Hydrated>
          {children}
          <Toaster />
          <DemoBar />
        </Hydrated>
      </body>
    </html>
  );
}
