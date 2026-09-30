import { createFileRoute } from "@tanstack/react-router";
import { LaunchpadPage } from "@/components/nx/product-pages";

export const Route = createFileRoute("/launchpad")({
  head: () => ({
    meta: [
      { title: "Token Launchpad — BR TRADES" },
      { name: "description", content: "Simulated token launches and subscription mechanics." },
      { property: "og:title", content: "Token Launchpad — BR TRADES" },
      {
        property: "og:description",
        content: "Simulated token launches and subscription mechanics.",
      },
    ],
  }),
  component: LaunchpadPage,
});
