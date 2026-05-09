import type { Metadata } from "next";
import {
  Inter,
  Cormorant_Garamond,
  Lora,
  Playfair_Display,
  Sora,
  Fraunces,
  EB_Garamond,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { FontProvider } from "@/providers/FontProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const ebGaramond = EB_Garamond({ variable: "--font-eb-garamond", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "BibJournal — Your Spiritual Study Space",
  description: "A peaceful, intelligent space to read scripture, write reflections, track prayers, and connect ideas.",
};

const fontVars = [
  inter.variable,
  cormorant.variable,
  lora.variable,
  playfair.variable,
  sora.variable,
  fraunces.variable,
  ebGaramond.variable,
].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVars} h-full`}>
      <head>
        {/* OpenDyslexic — not on Google Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/opendyslexic"
          crossOrigin="anonymous"
        />
        <style>{`
          :root {
            --font-opendyslexic: 'OpenDyslexic', sans-serif;
            /* Default active font vars — overridden at runtime by FontProvider */
            --bj-ui: var(--font-inter);
            --bj-display: var(--font-cormorant);
          }
          .font-sans { font-family: var(--bj-ui, var(--font-inter, sans-serif)); }
          .font-display { font-family: var(--bj-display, var(--font-cormorant, Georgia, serif)); }
        `}</style>
      </head>
      <body className="min-h-full">
        <AuthProvider>
          <ThemeProvider>
            <FontProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </FontProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
