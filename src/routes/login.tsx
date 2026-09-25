import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/nx/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — NEXORA EXCHANGE" },
      { name: "description", content: "Sign in to explore the NEXORA Exchange interface." },
      { property: "og:title", content: "Log in — NEXORA EXCHANGE" },
      { property: "og:description", content: "Sign in to explore the NEXORA Exchange interface." },
    ],
  }),
  component: () => <AuthPage mode="login" />,
});
