import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Esquiss Habitat | Permis de construire & Plans d'architecte",
  description:
    "Esquiss Habitat, votre expert en permis de construire, déclarations préalables, extensions, vérandas et plans 3D. Accompagnement personnalisé partout en France.",
  keywords:
    "permis de construire, déclaration préalable, extension maison, véranda, plans 3D, dossier administratif, Esquiss Habitat",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
