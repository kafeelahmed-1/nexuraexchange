import { createFileRoute } from "@tanstack/react-router";
import { HeroSection, StatStrip, MarketScanner, Ecosystem, Verification, SecuritySection, OnboardingSteps, DeviceSection, NewsSection, FAQAccordion } from "@/components/nx/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXORA EXCHANGE — Institutional-Grade Crypto Exchange" },
      { name: "description", content: "Explore 300+ simulated crypto markets with paper spot and 100x futures trading on a premium institutional interface." },
      { property: "og:title", content: "NEXORA EXCHANGE — Institutional-Grade Crypto Exchange" },
      { property: "og:description", content: "Premium dark trading terminal with simulated markets and paper trading." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSection />
      <StatStrip />
      <MarketScanner />
      <Ecosystem />
      <Verification />
      <SecuritySection />
      <OnboardingSteps />
      <DeviceSection />
      <NewsSection />
      <FAQAccordion />
    </>
  );
}
