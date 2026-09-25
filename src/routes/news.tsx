import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/components/nx/product-pages";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — NEXORA EXCHANGE" },
      { name: "description", content: "Platform, security, markets and product updates." },
      { property: "og:title", content: "News — NEXORA EXCHANGE" },
      { property: "og:description", content: "Platform, security, markets and product updates." },
    ],
  }),
  component: NewsPage,
});
