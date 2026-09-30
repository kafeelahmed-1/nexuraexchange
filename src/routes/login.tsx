import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/nx/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — BR Trades" },
      { name: "description", content: "Sign in to explore the BR Trades Exchange interface." },
      { property: "og:title", content: "Log in — BR Trades" },
      { property: "og:description", content: "Sign in to explore the BR Trades Exchange interface." },
    ],
  }),
  component: () => <AuthPage mode="login" />,
});
