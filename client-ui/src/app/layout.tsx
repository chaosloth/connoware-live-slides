import type { Metadata, Viewport } from "next";
import "@/app/styles.css";
import { ClientLayout } from "./ClientLayout";

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
  userScalable: false,
  maximumScale: 1,
  height: "100vh",
};

export const metadata: Metadata = {
  title: "Live Slides",
  description: "Individualised Communications at Scale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
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
      </head>
      <body style={{ height: '100%', margin: 0 }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
