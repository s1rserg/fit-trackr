import type { Metadata, Viewport } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "FitTrackr • Full Body Split",
  applicationName: "FitTrackr",
  description: "Mobile-first workout tracker for Full Body A/B/C split sessions.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon?size=32", sizes: "32x32", type: "image/png" },
      { url: "/icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/icon?size=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon?size=32"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTrackr",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#090712",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <div className="min-h-screen px-4 pb-8 pt-4">
          <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-xl flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
