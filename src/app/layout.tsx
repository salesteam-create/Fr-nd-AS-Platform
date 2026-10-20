import type { Metadata, Viewport } from "next";
import { DemoBar } from "@/components/DemoBar";
import { Hydrated } from "@/components/Hydrated";
import { LangFromUrl } from "@/components/LangToggle";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frænd Corporate Lunch (demo)",
  description: "Demo prototype of Frænd's corporate lunch ordering platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141414",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Design system fonts: Jost (stand-in for Futura) and Sacramento (script accent). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Sacramento&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Hydrated>
          <LangFromUrl />
          {children}
          <Toaster />
          <DemoBar />
        </Hydrated>
      </body>
    </html>
  );
}
