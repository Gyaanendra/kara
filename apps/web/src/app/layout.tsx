import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/layout/AppShell";

export const metadata: Metadata = {
  title: "Kara AI — Autonomous Chief of Staff & Workspace OS",
  description:
    "Enterprise AI Chief of Staff & Intelligent Workspace: Real-time meeting ingestion, Deepgram Nova-3 diarization, Groq MOM synthesis, and Twenty CRM sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="kara-light"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("kara-theme-profile");var v=["kara-light","kara-dark","claude","catppuccin","dracula","nord","monokai"];if(t&&v.indexOf(t)>-1){document.documentElement.setAttribute("data-theme",t);if(t==="kara-dark"||t==="dracula"||t==="nord"||t==="monokai")document.documentElement.classList.add("dark")}else{document.documentElement.setAttribute("data-theme","kara-light")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full w-full overflow-hidden text-[var(--text-primary)] selection:bg-[var(--accent-primary)]/30">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
