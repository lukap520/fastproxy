"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const faqs = [
  {
    q: "How does FastProxy handle IP rotation?",
    a: "Our network automatically rotates IPs per request or maintains sticky sessions up to 30 minutes. You control the behavior via a single header parameter — no SDK required.",
    icon: "mdi:rotate-3d-variant",
  },
  {
    q: "What's the average response time?",
    a: "Median latency is under 50ms for datacenter proxies and under 200ms for residential. We route through the closest node to your target automatically.",
    icon: "mdi:speedometer",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. You get 1GB of bandwidth free every month with access to all proxy types. No credit card needed to start — upgrade only when your usage demands it.",
    icon: "mdi:gift-outline",
  },
  {
    q: "How do you ensure IP quality?",
    a: "Every IP goes through a multi-layer verification pipeline. We check for blacklists, captcha rates, and response times continuously. Bad IPs are removed within seconds.",
    icon: "mdi:shield-search",
  },
  {
    q: "Can I target specific countries or cities?",
    a: "Absolutely. We support geo-targeting at the country, state, and city level across 195+ locations. Pass the target location as a parameter in your request.",
    icon: "mdi:map-marker-radius-outline",
  },
];

const highlights = [
  { icon: "mdi:headset", label: "24/7 Support" },
  { icon: "mdi:file-document-outline", label: "Full Docs" },
  { icon: "mdi:code-tags", label: "API-first" },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 py-4 text-left"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${open ? "bg-accent/10" : "bg-white/[0.03]"}`}>
          <Icon icon={faq.icon} className={`text-xs transition-colors duration-300 ${open ? "text-accent/80" : "text-muted/30"}`} />
        </div>
        <span className="flex-1 text-[14px] font-medium text-foreground/80 transition-colors duration-200 group-hover:text-foreground">
          {faq.q}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={`shrink-0 text-sm text-muted/30 transition-all duration-300 ${
            open ? "rotate-180 text-accent/60" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pl-10 pr-8 text-[13px] leading-[1.7] text-muted/60">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/[0.06]">
              <Icon icon="mdi:help-circle-outline" className="text-sm text-accent/60" />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-muted/60 uppercase">FAQ</span>
          </div>
          <h2 className="font-heading text-2xl tracking-tighter text-foreground sm:text-3xl lg:text-4xl">
            <span className="font-extralight text-foreground/60">Common</span>{" "}
            <span className="font-bold">questions</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted/60">
            Everything you need to know before connecting your first proxy.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.04] bg-white/[0.015]">
                  <Icon icon={h.icon} className="text-xs text-accent/40" />
                </div>
                <span className="text-[12px] text-muted/50">{h.label}</span>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="group mt-8 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent/60 transition-colors duration-200 hover:text-accent"
          >
            <Icon icon="mdi:lifebuoy" className="text-sm" />
            Contact Support
            <Icon icon="mdi:arrow-right" className="text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        <div className="lg:col-span-3">
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-1">
            <div className="divide-y divide-white/[0.03] px-4">
              {faqs.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
