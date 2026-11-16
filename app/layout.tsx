import type { Metadata } from "next";
import {
  Inter,
  Cormorant_Garamond,
  Lora,
  Playfair_Display,
  Sora,
  Fraunces,
  EB_Garamond,
  Newsreader,
  Literata,
  Source_Serif_4,
  IBM_Plex_Mono,
  Spectral,
  Libre_Caslon_Text,
  Geist,
  Plus_Jakarta_Sans,
  Atkinson_Hyperlegible,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { FontProvider } from "@/providers/FontProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], display: "swap", preload: false });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap", preload: false });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap", preload: false });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", preload: false });
const ebGaramond = EB_Garamond({ variable: "--font-eb-garamond", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });
// Writing faces
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });
const literata = Literata({ variable: "--font-literata", subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], display: "swap", preload: false });
// Reading faces
const spectral = Spectral({ variable: "--font-spectral", subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], display: "swap", preload: false });
const caslon = Libre_Caslon_Text({ variable: "--font-caslon", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], display: "swap", preload: false });
// Interface faces
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap", preload: false });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap", preload: false });
const atkinson = Atkinson_Hyperlegible({ variable: "--font-atkinson", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], display: "swap", preload: false });

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
  newsreader.variable,
  literata.variable,
  sourceSerif.variable,
  plexMono.variable,
  spectral.variable,
  caslon.variable,
  geist.variable,
  jakarta.variable,
  atkinson.variable,
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
            --bj-write: var(--font-newsreader), Georgia, serif;
            --bj-read: var(--font-eb-garamond), Georgia, serif;
          }
          .font-sans { font-family: var(--bj-ui, var(--font-inter, sans-serif)); }
          .font-display { font-family: var(--bj-display, var(--font-cormorant, Georgia, serif)); }
          .font-write { font-family: var(--bj-write); }
          .font-read { font-family: var(--bj-read); }
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
