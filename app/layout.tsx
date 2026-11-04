import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Brand type (8x guidelines v6): Archivo says the numbers (900, width 62), Hanken Grotesk explains everything you
// read, Geist Mono states values. Archivo is loaded with its width axis so it can be set condensed.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Overview · Social", template: "%s · Social" },
  description: "The brand dashboard's reference build, with sample data.",
  icons: { icon: "/brand/favicon.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#071C4D", colorScheme: "light" };

// data-vertical sets the one colour on the whole dashboard; every other vertical reskins it by changing this alone. The
// window (the shell) is the dashboard group's layout, so the sign-in page stands outside it
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-vertical="social" className={`${archivo.variable} ${hanken.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
