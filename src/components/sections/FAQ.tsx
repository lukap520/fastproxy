"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const faqs = [
  {
    q: "How does FastProxy handle IP rotation?",
    a: "Our network automatically rotates IPs per request or maintains sticky sessions up to 30 minutes. You control the behavior via a single header parameter — no SDK required.",
  },
  {
    q: "What's the average response time?",
    a: "Median latency is under 50ms for datacenter proxies and under 200ms for residential. We route through the closest node to your target automatically.",
  },
  {
    q: "How do you ensure IP quality?",
    a: "Every IP goes through a multi-layer verification pipeline. We check for blacklists, captcha rates, and response times continuously. Bad IPs are removed within seconds.",
  },
  {
    q: "Can I target specific countries or cities?",
    a: "Absolutely. We support geo-targeting at the country, state, and city level across 195+ locations. Pass the target location as a parameter in your request.",
  },
];

const highlights = [
  { icon: "mdi:headset", label: "24/7 Support" },
  { icon: "mdi:lightning-bolt-outline", label: "High Speeds" },
  { icon: "mdi:earth", label: "Global Network" },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const num = String(index + 1).padStart(2, "0");

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
        className="flex w-full items-start gap-4 py-5 text-left"
      >
        <span
          className={`font-heading text-[13px] font-bold tracking-tight transition-colors duration-300 mt-0.5 ${open ? "text-accent" : "text-white/[0.3]"
            }`}
        >
          {num}
        </span>
        <div className="flex-1 relative">
          <span
            className={`text-[15px] font-semibold transition-colors duration-200 ${open ? "text-white drop-shadow-sm" : "text-gray-200 group-hover:text-white"
              }`}
          >
            {faq.q}
          </span>
        </div>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${open ? "bg-accent/10 rotate-45 ring-1 ring-accent/15" : "bg-white/[0.04]"
            }`}
        >
          <Icon
            icon="mdi:plus"
            className={`text-xs transition-colors duration-300 ${open ? "text-accent" : "text-muted/60"
              }`}
          />
        </div>
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
            <div className="flex gap-4 pb-5">
              <span className="w-[22px] shrink-0" />
              <div className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-accent/50 via-accent/20 to-accent/0" />
                <p className="text-[14px] font-medium leading-[1.8] text-gray-200">
                  {faq.a}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <h2 className="font-heading text-2xl tracking-tighter text-white sm:text-3xl lg:text-4xl drop-shadow-sm">
            <span className="font-extralight text-white drop-shadow-sm">Common</span>{" "}
            <span className="font-bold">questions</span>
          </h2>
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-gray-200">
            Everything you need to know before connecting your first proxy.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05]">
                  <Icon icon={h.icon} className="text-[13px] text-accent drop-shadow-sm" />
                </div>
                <span className="text-[13px] font-semibold text-gray-200">{h.label}</span>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="group mt-8 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent/80 transition-colors duration-200 hover:text-accent"
          >
            <Icon icon="mdi:lifebuoy" className="text-sm" />
            Contact Support
            <Icon
              icon="mdi:arrow-right"
              className="text-xs transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.012] p-1">
            <div className="divide-y divide-gradient-to-r divide-white/[0.04] px-4">
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
