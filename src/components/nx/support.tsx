import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Check, CircleHelp, Headset, Mail, Send, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { openSupportPanel, supportConfig, supportMailto } from "@/lib/support";

const openSupportEvent = "nexora:open-support";

export function SupportEntryButton({
  className,
  children = "Customer Support",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openSupportPanel} className={className}>
      {children}
    </button>
  );
}

const quickHelp = [
  "Trading Demo",
  "Account Demo",
  "Deposit Demo",
  "Withdrawal Demo",
  "Security",
  "General Question",
];

export function CustomerSupportWidget() {
  const [open, setOpen] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [selection, setSelection] = useState("");
  const telegramTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    const showPanel = () => setOpen(true);
    window.addEventListener(openSupportEvent, showPanel);
    return () => window.removeEventListener(openSupportEvent, showPanel);
  }, []);

  useEffect(
    () => () => {
      if (telegramTimer.current) clearTimeout(telegramTimer.current);
    },
    [],
  );

  const openTelegram = () => {
    if (telegramLoading) return;
    setTelegramLoading(true);
    setSelection("");
    toast.info("Opening Telegram Support");

    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    telegramTimer.current = setTimeout(() => {
      if (tab) tab.location.href = supportConfig.telegramUrl;
      else window.open(supportConfig.telegramUrl, "_blank", "noopener,noreferrer");
      setTelegramLoading(false);
      telegramTimer.current = null;
    }, 450);
  };

  const openEmail = () => {
    toast.info("Opening email support");
    window.location.href = supportMailto();
  };

  const selectHelp = (category: string) => {
    const message = `${category} assistance selected.`;
    setSelection(message);
    toast.info(message);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Customer Support"
        aria-label="Customer Support"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="support-launcher fixed bottom-[88px] right-4 z-[76] inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-[#071711] text-primary shadow-[0_0_24px_-8px_var(--primary)] transition duration-200 hover:scale-105 hover:border-cyan/60 hover:text-cyan hover:shadow-[0_0_30px_-6px_var(--cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan md:bottom-6 md:right-6 md:h-11 md:w-auto md:gap-2 md:rounded-full md:px-4"
      >
        <Headset size={19} aria-hidden="true" />
        <span className="hidden text-sm font-bold md:inline">Support</span>
        <span className="support-pulse pointer-events-none absolute inset-0 rounded-full border border-primary/50" />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="support-overlay fixed inset-0 z-[80] bg-black/65 backdrop-blur-[3px]" />
          <Dialog.Content
            aria-describedby="support-description"
            className="support-panel fixed z-[81] flex max-h-[calc(100dvh-112px)] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#081116] text-foreground shadow-[0_24px_80px_-24px_rgba(0,0,0,.9)] outline-none"
          >
            <div
              className="support-drag-handle flex justify-center pt-3 md:hidden"
              onPointerDown={(event) => {
                dragStart.current = event.clientY;
              }}
              onPointerUp={(event) => {
                if (dragStart.current !== null && event.clientY - dragStart.current > 50)
                  setOpen(false);
                dragStart.current = null;
              }}
            >
              <span className="h-1 w-10 rounded-full bg-white/25" />
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 pb-4 pt-5 md:px-6 md:pt-6">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.18em] text-cyan">
                  NEXORA SUPPORT
                </div>
                <Dialog.Title className="mt-2 text-xl font-bold">How can we help you?</Dialog.Title>
                <Dialog.Description
                  id="support-description"
                  className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                  Support channels available
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close customer support"
                className="rounded-md border border-white/10 p-2 text-muted-foreground transition hover:border-white/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              >
                <X size={17} />
              </Dialog.Close>
            </div>

            <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-4 md:px-6 md:py-5">
              <div className="flex items-center gap-2 rounded-md border border-warning/20 bg-warning/[0.06] px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-warning">
                <ShieldCheck size={14} /> CUSTOMER SUPPORT
              </div>
              <div className="grid gap-3">
                <section className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-4 transition-colors hover:border-cyan/30">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan/20 bg-cyan/[0.08] text-cyan">
                      <Send size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">Telegram Support</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Preview a  Telegram contact destination verified NEXORA account is
                        implied.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openTelegram}
                    disabled={telegramLoading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-cyan/25 bg-cyan/[0.08] px-3 py-2.5 text-sm font-bold text-cyan transition hover:bg-cyan/[0.14] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  >
                    {telegramLoading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
                        Opening Telegram...
                      </>
                    ) : (
                      <>
                        Open Telegram
                        <ArrowUpRight size={15} />
                      </>
                    )}
                  </button>
                  <p className="mt-2 break-all text-[10px] text-dim">
                     destination: {supportConfig.telegramUrl}
                  </p>
                </section>

                <section className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-4 transition-colors hover:border-primary/30">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.08] text-primary">
                      <Mail size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">Email Support</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Send questions, account inquiries or general feedback using this 
                        contact.
                      </p>
                      <a
                        href={supportMailto()}
                        onClick={() => toast.info("Opening email support")}
                        className="mt-2 inline-block break-all text-xs font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {supportConfig.supportEmail}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openEmail}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-primary/25 bg-primary/[0.08] px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Email Support
                    <ArrowUpRight size={15} />
                  </button>
                  <p className="mt-2 text-[10px] text-dim">
                    {" "}
                    contact information, operating exchange address.
                  </p>
                </section>
              </div>

              <section aria-labelledby="quick-help-title">
                <div className="mb-3 flex items-center gap-2">
                  <CircleHelp size={15} className="text-cyan" />
                  <h3 id="quick-help-title" className="text-sm font-bold">
                    Quick Help
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {quickHelp.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => selectHelp(category.replace(" Demo", " demo"))}
                      className="min-h-10 rounded-md border border-white/[0.09] px-2.5 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {selection && (
                  <p
                    aria-live="polite"
                    className="mt-3 flex items-center gap-2 rounded-md bg-primary/[0.06] px-3 py-2 text-xs text-primary"
                  >
                    <Check size={14} />
                    {selection} Contact options are above.
                  </p>
                )}
              </section>
              <p className="border-t border-white/[0.07] pt-3 text-[10px] leading-relaxed text-dim">
                 live support team, ticketing, account recovery or transaction
                assistance is provided.
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
