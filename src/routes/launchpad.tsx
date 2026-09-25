import { createFileRoute } from "@tanstack/react-router";
import { LaunchpadPage } from "@/components/nx/product-pages";

export const Route = createFileRoute("/launchpad")({
  head: () => ({
    meta: [
      { title: "Token Launchpad — NEXORA EXCHANGE" },
      { name: "description", content: "Simulated token launches and subscription mechanics." },
      { property: "og:title", content: "Token Launchpad — NEXORA EXCHANGE" },
      {
        property: "og:description",
        content: "Simulated token launches and subscription mechanics.",
      },
    ],
  }),
  component: LaunchpadPage,
});
