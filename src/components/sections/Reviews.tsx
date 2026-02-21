"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const reviews = [
  {
    name: "Marcus Chen",
    role: "CTO, DataScale",
    text: "We switched from three different proxy providers to FastProxy. Cut our infra costs by 40% and latency dropped significantly.",
    rating: 5,
    tag: "Cost Reduction",
  },
  {
    name: "Sarah Lindqvist",
    role: "Lead Engineer, Crawlify",
    text: "The IP quality is unmatched. We went from 15% captcha rates to under 2%. Our scraping pipeline has never been more reliable.",
    rating: 5,
    tag: "IP Quality",
  },
  {
    name: "James Okafor",
    role: "Founder, PriceRadar",
    text: "Zero dropped connections in 6 months of production use. The auto-failover actually works — we've stress tested it thoroughly.",
    rating: 5,
    tag: "Reliability",
  },
  {
    name: "Elena Vasquez",
    role: "VP Engineering, Monitora",
    text: "Setup took 10 minutes. No SDK, no complex auth flows. Just worked. That's rare in this space.",
    rating: 5,
    tag: "Quick Setup",
  },
  {
    name: "Raj Patel",
    role: "Data Lead, InsightAI",
    text: "We process 2M+ requests daily through FastProxy. Not a single SLA breach in over a year. Their residential pool is genuinely massive.",
    rating: 5,
    tag: "Scale",
  },
];

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  const initials = review.name.split(" ").map((n) => n[0]).join("");
  return (
    <div className="group relative flex w-[340px] shrink-0 flex-col justify-between rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.022] to-white/[0.012] p-6 transition-all duration-400 hover:border-white/[0.1] hover:shadow-[0_0_28px_rgba(255,107,0,0.05)] sm:w-[380px]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent group-hover:via-accent/20 transition-all duration-300 rounded-t-2xl" />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full border border-accent/12 bg-accent/[0.05] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-accent/65 uppercase">
            {review.tag}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Icon key={i} icon="mdi:star" className="text-[11px] text-accent/70" />
            ))}
          </div>
        </div>

        <p className="font-heading text-[14px] font-medium leading-[1.65] tracking-tight text-foreground/75">
          &ldquo;{review.text}&rdquo;
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-white/[0.04] pt-4">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/25 to-accent/8 text-[10px] font-bold text-accent/80 ring-1 ring-accent/10 group-hover:ring-accent/20 transition-all duration-300">
          {initials}
        </div>
        <div>
          <p className="text-[12px] font-medium text-foreground/75">{review.name}</p>
          <p className="text-[10px] text-muted/35">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const doubled = [...reviews, ...reviews];

  return (
    <section id="reviews" className="relative z-10 py-16 sm:py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
        >
          <div className="flex items-end gap-4">
            <span className="font-heading text-[4rem] leading-none font-bold text-accent/[0.07] sm:text-[5rem] select-none hidden sm:block">&ldquo;</span>
            <div>
              <h2 className="font-heading text-2xl tracking-tighter text-foreground sm:text-3xl lg:text-4xl">
                <span className="font-extralight text-foreground/55">Trusted by</span>{" "}
                <span className="font-bold">engineers</span>
              </h2>
              <p className="mt-1 text-[13px] text-muted/40">
                Teams shipping at scale, on FastProxy infrastructure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3">
            <Icon icon="simple-icons:trustpilot" className="text-xl text-[#00B67A]" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-bold text-foreground">4.9</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} icon="mdi:star" className="text-[10px] text-accent/75" />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-muted/35">2,400+ reviews on Trustpilot</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="marquee-container group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <div className="marquee-track flex gap-4 group-hover:[animation-play-state:paused]">
          {doubled.map((review, i) => (
            <ReviewCard key={`${review.name}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
