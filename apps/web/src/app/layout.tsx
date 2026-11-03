import type { Metadata } from "next";
import { Unbounded, Albert_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "../components/layout/AppShell";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const albertSans = Albert_Sans({
  variable: "--font-albert",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fulcrum OS — Intelligence & Growth Platform",
  description:
    "Enterprise AI Chief of Staff & Intelligent Workspace: Activation, Growth Telemetry, and AI Agent Sidecar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${albertSans.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden text-neutral-900 dark:text-neutral-100 selection:bg-[#816797]/30">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
