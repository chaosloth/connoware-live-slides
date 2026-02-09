"use client";

import { SyncProvider } from "@/app/context/Sync";
import { PresentationProvider } from "@/app/context/Presentation";
import { AuthProvider } from "@/app/context/Auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Theme } from "@twilio-paste/core/theme";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100%' }}>
      <Analytics />
      <SpeedInsights />
      <Theme.Provider theme="twilio">
        <ErrorBoundary>
          <AuthProvider>
            <SyncProvider>
              <PresentationProvider>{children}</PresentationProvider>
            </SyncProvider>
          </AuthProvider>
        </ErrorBoundary>
      </Theme.Provider>
    </div>
  );
}
