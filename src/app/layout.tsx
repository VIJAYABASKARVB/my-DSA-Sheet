import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My DSA Sheet — Minimal Archive",
  description: "Curated DSA archive — Topic → Pattern → Problem, 110 problems, spaced repetition. Warm monochrome, editorial precision.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F6F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] flex flex-col bg-background text-foreground">
        <div className="ambient-blob" aria-hidden="true" style={{ top: "8%", right: "12%" }} />
        <main className="flex-1 min-h-[100dvh]">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
