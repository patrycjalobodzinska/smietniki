import type { Metadata } from "next";
import { Poppins } from "next/font/google";
// Leaflet przed globals: jego reguły są poza warstwami, więc nasze nadpisania
// muszą wystąpić po nim w kolejności źródła.
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Providers } from "./providers";

const inter = Poppins({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "SMART WASTE - centrum zarządzania infrastrukturą odpadową",
  description:
    "Monitoring altanek śmietnikowych, kontrola dostępu, zapełnienie pojemników, odbiory i trasy PGK.",
};

// Set the theme class before paint to avoid a flash. Light-first: dark only
// when the user explicitly chose it.
const themeScript = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
