export const supportConfig = {
  telegramUrl: "https://t.me/NexoraExchangeSupport",
  supportEmail: "supportnexoexchange@gmail.com",
  supportSubject: "BR Trades — Customer Support",
};

export const supportEmailBody = `Hello BR Trades Support,\n\nI need assistance with:\n\nIssue / Question:\n\nAccount / Reference:\n\nThank you.`;

const openSupportEvent = "nexora:open-support";

export function openSupportPanel() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(openSupportEvent));
}

export function supportMailto() {
  const query = new URLSearchParams({
    subject: supportConfig.supportSubject,
    body: supportEmailBody,
  });
  return `mailto:${supportConfig.supportEmail}?${query.toString()}`;
}
