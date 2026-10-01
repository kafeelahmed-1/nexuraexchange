import { createFileRoute } from "@tanstack/react-router";
import { MarketPulse, MarketTable } from "@/components/nx/market";
import { PageHeader } from "@/components/nx/motion";

export const Route = createFileRoute("/markets")({
  head: () => ({ meta: [{ title: "Crypto Markets — BR TRADES" }, { name: "description", content: "Search, filter and sort 300+ crypto markets." }, { property: "og:title", content: "Crypto Markets — BR TRADES" }, { property: "og:description", content: "Market overview with sortable columns." }] }),
  component: () => (
    <>
      <PageHeader title="Crypto Markets" desc="Prices update every few seconds. Click any asset to open the paper trading terminal." />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6"><MarketPulse /><MarketTable full /></div>
    </>
  ),
});
