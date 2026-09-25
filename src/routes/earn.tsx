import { createFileRoute } from "@tanstack/react-router";
import { EarnPage } from "@/components/nx/product-pages";

export const Route = createFileRoute("/earn")({
  head: () => ({
    meta: [
      { title: "Mining & Earn — NEXORA EXCHANGE" },
      { name: "description", content: "Yield products with simulated APY, duration and capacity." },
      { property: "og:title", content: "Mining & Earn — NEXORA EXCHANGE" },
      {
        property: "og:description",
        content: "Yield products with simulated APY, duration and capacity.",
      },
    ],
  }),
  component: EarnPage,
});
