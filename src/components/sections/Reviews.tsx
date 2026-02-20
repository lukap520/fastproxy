"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const reviews = [
  {
    name: "Marcus Chen",
    role: "CTO, DataScale",
    text: "We switched from three different proxy providers to FastProxy. Cut our infra costs by 40% and latency dropped significantly.",
    rating: 5,
    icon: "mdi:trending-down",
    tag: "Cost Reduction",
  },
  {
    name: "Sarah Lindqvist",
    role: "Lead Engineer, Crawlify",
    text: "The IP quality is unmatched. We went from 15% captcha rates to under 2%. Our scraping pipeline has never been more reliable.",
    rating: 5,
    icon: "mdi:shield-check-outline",
    tag: "IP Quality",
  },
  {
    name: "James Okafor",
    role: "Founder, PriceRadar",
    text: "Zero dropped connections in 6 months of production use. The auto-failover actually works — we've stress tested it thoroughly.",
    rating: 5,
    icon: "mdi:connection",
    tag: "Reliability",
  },
  {
    name: "Elena Vasquez",
    role: "VP Engineering, Monitora",
    text: "Setup took 10 minutes. No SDK, no complex auth flows. Just worked. That's rare in this space.",
    rating: 5,
    icon: "mdi:timer-outline",
    tag: "Quick Setup",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Icon key={i} icon="mdi:star" className="text-[10px] text-accent/70" />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/[0.06]">
                <Icon icon="mdi:message-star-outline" className="text-sm text-accent/60" />
              </div>
              <span className="text-[11px] font-medium tracking-wide text-muted/60 uppercase">What engineers say</span>
            </div>
            <h2 className="font-heading text-2xl tracking-tighter text-foreground sm:text-3xl lg:text-4xl">
              <span className="font-extralight text-foreground/60">Trusted by</span>{" "}
              <span className="font-bold">engineers</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
            <Icon icon="simple-icons:trustpilot" className="text-xl text-[#00B67A]" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-bold text-foreground">4.9</span>
                <Stars count={5} />
              </div>
              <span className="text-[10px] text-muted/40">2,400+ reviews on Trustpilot</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {reviews.map((review, i) => (
          <motion.div
            key={review.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="group relative rounded-xl border border-white/[0.04] bg-white/[0.015] p-5 transition-all duration-300 hover:border-white/[0.08]"
          >
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/[0.06]">
                  <Icon icon={review.icon} className="text-xs text-accent/60" />
                </div>
                <span className="text-[10px] font-medium tracking-wide text-accent/50 uppercase">{review.tag}</span>
              </div>
              <Stars count={review.rating} />
            </div>

            <p className="text-[13px] leading-[1.75] text-foreground/60">
              &ldquo;{review.text}&rdquo;
            </p>

            <div className="mt-5 flex items-center gap-3 border-t border-white/[0.03] pt-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] font-bold text-foreground/40">
                {review.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-[12px] font-medium text-foreground/70">{review.name}</p>
                <p className="text-[10px] text-muted/35">{review.role}</p>
              </div>
              <Icon icon="mdi:check-decagram" className="ml-auto text-sm text-accent/30" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
