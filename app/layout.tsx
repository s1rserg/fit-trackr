import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { RestTimer } from "@/components/rest-timer";
import { TimerProvider } from "@/components/timer-context";

export const metadata: Metadata = {
  title: "FitTrackr • Full Body Split",
  applicationName: "FitTrackr",
  description: "Mobile-first workout tracker for Full Body A/B/C split sessions.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon.png"],
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
        <TimerProvider>
          <div className="min-h-screen px-4 pb-8 pt-4">
            <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-xl flex-col">
              {children}
            </div>
          </div>
          <RestTimer />
        </TimerProvider>
      </body>
    </html>
  );
}
