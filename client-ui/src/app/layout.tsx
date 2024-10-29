"use client";

import type { Metadata, Viewport } from "next";
import "@/app/styles.css";
import { SyncProvider } from "@/app/context/Sync";
import { PresentationProvider } from "@/app/context/Presentation";

import { Theme } from "@twilio-paste/core/theme";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
  userScalable: false,
  maximumScale: 1,
  height: "100vh",
};

// export const metadata: Metadata = {
//   title: "Twilio Live Slides",
//   description: "Individualised Communications at Scale",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Live Slides</title>
        <meta property="og:url" content="https://twilio.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Twilio - Personalisation at Communications at Scale"
        />
        <meta
          property="og:description"
          content="Connect with customers on their preferred channels—anywhere in the world. Quickly integrate powerful communication APIs to start building solutions for SMS and WhatsApp messaging, voice, video, and email."
        />
        {/* <meta property="og:image" content="/preview.png"/> */}
      </head>
      <body>
        <Analytics />
        <SpeedInsights />
        <Theme.Provider theme="twilio">
          <SyncProvider>
            <PresentationProvider>{children}</PresentationProvider>
          </SyncProvider>
        </Theme.Provider>
      </body>
    </html>
  );
}
