import type { Metadata } from "next";
import { NavDrawer } from '@/components/NavDrawer'
import Link from 'next/link'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "To Do!",
  description: "Notes, todos, and calendar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <header className="fixed top-0 inset-x-0 z-40 bg-background border-b border-border h-14 flex items-center px-4">
          <div className="flex items-center">
            <NavDrawer />
          </div>
          <div className="flex-1 flex justify-center">
            <Link href="/notes" className="text-base font-semibold tracking-tight">To Do!</Link>
          </div>
          <div className="w-8" />
        </header>
        <main className="flex-1 pt-14">{children}</main>
      </body>
    </html>
  );
}
