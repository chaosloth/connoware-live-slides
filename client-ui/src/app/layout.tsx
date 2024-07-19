import type { Metadata, Viewport } from "next";
import "@/app/styles.css";

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
  userScalable: false,
  maximumScale: 1,
  height: "100vh",
};

export const metadata: Metadata = {
  title: "Twilio Live Slides",
  description: "Individualised Communications at Scale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:url" content="https://twilio.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Twilio - Individualised Communications at Scale"
        />
        <meta
          property="og:description"
          content="Connect with customers on their preferred channels—anywhere in the world. Quickly integrate powerful communication APIs to start building solutions for SMS and WhatsApp messaging, voice, video, and email."
        />
        {/* <meta property="og:image" content="/preview.png"/> */}
      </head>
      <body>
        <div className="main-layout">{children}</div>
      </body>
    </html>
  );
}
