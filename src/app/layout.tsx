import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Outfit, Space_Grotesk } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-cabinet",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My DSA Sheet — Vanguard Edition",
  description: "The obsessive archive for DSA. 110 problems, 5 topics, spaced repetition — depth, not sprawl. Vanguard OLED + ethereal glass.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${outfit.variable} ${spaceGrotesk.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-emerald/30">
        <div className="grain" aria-hidden="true" />
        <div className="mesh" aria-hidden="true" />
        <main className="flex-1 min-h-[100dvh]">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
