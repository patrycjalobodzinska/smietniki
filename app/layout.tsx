import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";

const inter = Poppins({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMART WASTE — centrum zarządzania infrastrukturą odpadową",
  description:
    "Monitoring altanek śmietnikowych, kontrola dostępu, zapełnienie pojemników, odbiory i trasy PGK.",
};

// Set the theme class before paint to avoid a flash. Light-first: dark only
// when the user explicitly chose it.
const themeScript = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
