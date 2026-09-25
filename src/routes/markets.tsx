import { createFileRoute } from "@tanstack/react-router";
import { MarketTable } from "@/components/nx/market";
import { PageHeader } from "@/components/nx/motion";

export const Route = createFileRoute("/markets")({
  head: () => ({ meta: [{ title: "Crypto Markets — NEXORA EXCHANGE" }, { name: "description", content: "Search, filter and sort 300+ simulated crypto markets." }, { property: "og:title", content: "Crypto Markets — NEXORA EXCHANGE" }, { property: "og:description", content: "Simulated market overview with sortable columns." }] }),
  component: () => (
    <>
      <PageHeader title="Crypto Markets" desc="Simulated prices update every few seconds. Click any asset to open the paper trading terminal." />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6"><MarketTable full /></div>
    </>
  ),
});
