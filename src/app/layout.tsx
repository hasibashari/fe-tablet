import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorantSerif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "MediCore | Advanced Healthcare",
  description: "Scientifically backed, high-purity medical solutions designed to improve your quality of life.",
  applicationName: "MediCore",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediCore",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

import ThemeRegistry from "@/src/shared/components/ThemeRegistry";
import { AuthProvider } from "@/src/features/auth";
import ServiceWorkerRegister from "@/src/shared/components/ServiceWorkerRegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorantSerif.variable} ${interSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-white text-ink">
        <ThemeRegistry>
          <AuthProvider>
            <ServiceWorkerRegister />
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

