import { createFileRoute } from "@tanstack/react-router";
import { EarnPage } from "@/components/nx/product-pages";

export const Route = createFileRoute("/earn")({
  head: () => ({
    meta: [
      { title: "Mining & Earn — BR TRADES" },
      { name: "description", content: "Yield products with APY, duration and capacity." },
      { property: "og:title", content: "Mining & Earn — BR TRADES" },
      {
        property: "og:description",
        content: "Yield products with APY, duration and capacity.",
      },
    ],
  }),
  component: EarnPage,
});
