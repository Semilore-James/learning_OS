import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font — no runtime call to Google.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains-mono",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-outfit",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "DA // LEARNING OS",
  description: "A Data Analyst operating system. Grind into competence.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080b14",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${outfit.variable} ${spaceGrotesk.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
