import { createFileRoute } from "@tanstack/react-router";
import { FeesPage } from "@/components/nx/product-pages";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Fees — NEXORA EXCHANGE" },
      { name: "description", content: "Spot, futures and VIP fee schedules." },
      { property: "og:title", content: "Fees — NEXORA EXCHANGE" },
      { property: "og:description", content: "Spot, futures and VIP fee schedules." },
    ],
  }),
  component: FeesPage,
});
