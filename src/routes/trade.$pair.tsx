import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAsset, fmtPrice, fmtCompact } from "@/lib/market";
import { CandleChart, MarketDetail, OrderBook, TimeframeTabs, TradingPanel, CoinIcon, Change } from "@/components/nx/market";
import { AnimatedNumber } from "@/components/nx/motion";
import { PriceAlertsPanel, TradingCalculator } from "@/components/nx/trading-features";

export const Route = createFileRoute("/trade/$pair")({
  head: ({ params }) => ({ meta: [{ title: `${params.pair.replace("-", "/")} Paper Trading — NEXORA EXCHANGE` }, { name: "description", content: "Simulated spot trading terminal with candlestick chart and order book." }, { property: "og:title", content: `${params.pair} Spot Terminal — NEXORA` }, { property: "og:description", content: "Paper trading terminal." }] }),
  component: Trade,
});

function Trade() {
  const { pair } = Route.useParams();
  const sym = pair.split("-")[0] ?? "BTC";
  const a = useAsset(sym);
  const [tf, setTf] = useState("15m");
  return (
    <div className="mx-auto max-w-[1600px] space-y-3 p-3 md:p-4">
      <div className="panel flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
        <div className="flex items-center gap-3"><CoinIcon a={a} size={34} /><div><div className="text-lg font-black">{a.symbol}/USDT</div><div className="text-xs text-muted-foreground">{a.name} · Paper</div></div></div>
        <AnimatedNumber value={a.price} format={fmtPrice} className="text-2xl font-bold text-primary" />
        <Change v={a.change24h} />
        {[["24h High", fmtPrice(a.high24h)], ["24h Low", fmtPrice(a.low24h)], ["24h Volume", `$${fmtCompact(a.volume)}`]].map(([l, v]) => <div key={l} className="text-xs"><div className="text-dim">{l}</div><div className="num font-semibold">{v}</div></div>)}
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="panel p-3">
          <div className="mb-2 flex justify-end"><TimeframeTabs id="tr-tf" value={tf} onChange={setTf} options={["1m", "5m", "15m", "1h", "4h", "1D"]} /></div>
          <CandleChart key={a.symbol} price={a.price} tf={tf} />
        </div>
        <details open className="panel p-3"><summary className="cursor-pointer text-sm font-bold">Order Book</summary><OrderBook mid={a.price} base={a.symbol} rows={9} /></details>
      </div>
      <div className="panel p-4"><TradingPanel symbol={a.symbol} price={a.price} /></div>
      <div className="panel p-4 sm:p-5"><PriceAlertsPanel /></div>
      <div className="panel p-4 sm:p-5"><TradingCalculator /></div>
      <div className="panel px-4 sm:px-5"><MarketDetail symbol={a.symbol} /></div>
      <p className="px-1 text-[10px] text-warning">DEMO MODE · Simulated paper-trading environment. No real funds or cryptocurrency are involved.</p>
    </div>
  );
}
