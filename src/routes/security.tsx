import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nx/motion";
import { Headset } from "lucide-react";
import { SupportEntryButton } from "@/components/nx/support";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — NEXORA EXCHANGE" },
      { name: "description", content: "Layered security concepts and design principles." },
      { property: "og:title", content: "Security — NEXORA EXCHANGE" },
      { property: "og:description", content: "Layered security concepts and design principles." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Security" desc="Layered security concepts and design principles." />
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <SupportEntryButton className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/[0.06] px-4 py-2.5 text-sm font-bold text-primary transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
          <Headset size={16} />
          Security Support
        </SupportEntryButton>
      </div>
    </>
  ),
});
