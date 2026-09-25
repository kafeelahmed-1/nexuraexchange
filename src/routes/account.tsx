import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nx/motion";
import { Headset } from "lucide-react";
import { SupportEntryButton } from "@/components/nx/support";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account Overview — NEXORA EXCHANGE" },
      { name: "description", content: "Balances, PnL and orders." },
      { property: "og:title", content: "Account Overview — NEXORA EXCHANGE" },
      { property: "og:description", content: "Balances, PnL and orders." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Account Overview" desc="Balances, PnL and orders." />
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <SupportEntryButton className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/[0.06] px-4 py-2.5 text-sm font-bold text-primary transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
          <Headset size={16} />
          Customer Support
        </SupportEntryButton>
      </div>
    </>
  ),
});
