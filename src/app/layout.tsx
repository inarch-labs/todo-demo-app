import type { Metadata } from "next";
import { cookies } from 'next/headers'
import { AppChrome } from '@/components/AppChrome'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { INARCH_BRANCH } from '@/lib/inarch-branch';
import { getSessionId } from '@/lib/session';
import { APP_NAME } from '@/lib/app-name';
import { TelemetryProvider } from '@inarch/sdk/telemetry/react';
import { isResearcherSession, PANEL_SESSION_COOKIE } from '@inarch/sdk/panel/auth';
import { PREVIEW_SESSION_COOKIE } from '@inarch/sdk/panel/preview';
import "./globals.css";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Notes, todos, and calendar",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionId();

  const jar = await cookies();
  const isResearcher = isResearcherSession({
    panelSessionCookie: jar.get(PANEL_SESSION_COOKIE)?.value,
    previewSessionCookie: jar.get(PREVIEW_SESSION_COOKIE)?.value,
    expectedSecret: process.env.INARCH_ADMIN_SECRET,
  });

  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <AppChrome branch={INARCH_BRANCH} testName={INARCH_BRANCH} isResearcher={isResearcher}>{children}</AppChrome>
        <TelemetryProvider sessionId={sessionId} branch={INARCH_BRANCH} endpoint="/api/telemetry" />
      </body>
    </html>
  );
}
