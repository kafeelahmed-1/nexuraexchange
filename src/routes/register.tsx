import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/nx/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Profile — BR TRADES" },
      {
        name: "description",
        content: "Create a profile to explore the BR Trades Exchange interface.",
      },
      { property: "og:title", content: "Create Profile — BR TRADES" },
      {
        property: "og:description",
        content: "Create a profile to explore the BR Trades Exchange interface.",
      },
    ],
  }),
  component: () => <AuthPage mode="register" />,
});
