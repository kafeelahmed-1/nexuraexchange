import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/nx/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Profile — NEXORA EXCHANGE" },
      {
        name: "description",
        content: "Create a profile to explore the NEXORA Exchange interface.",
      },
      { property: "og:title", content: "Create Profile — NEXORA EXCHANGE" },
      {
        property: "og:description",
        content: "Create a profile to explore the NEXORA Exchange interface.",
      },
    ],
  }),
  component: () => <AuthPage mode="register" />,
});
