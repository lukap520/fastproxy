"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const floatingIcons = [
  { icon: "mdi:shield-lock-outline", x: "8%", y: "18%", delay: 0, dur: "6s" },
  { icon: "mdi:earth", x: "88%", y: "12%", delay: 0.3, dur: "7s" },
  { icon: "mdi:server-network-outline", x: "5%", y: "65%", delay: 0.6, dur: "8s" },
  { icon: "mdi:speedometer", x: "92%", y: "58%", delay: 0.2, dur: "6.5s" },
  { icon: "mdi:code-braces", x: "15%", y: "85%", delay: 0.8, dur: "7.5s" },
  { icon: "mdi:cloud-check-outline", x: "82%", y: "82%", delay: 0.5, dur: "8.5s" },
];


export default function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-5 pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-28 overflow-hidden">
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 + item.delay }}
          className="absolute pointer-events-none hidden lg:block"
          style={{ left: item.x, top: item.y, animation: `float-slow ${item.dur} ease-in-out infinite` }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.015]">
            <Icon icon={item.icon} className="text-lg text-accent/20" />
          </div>
        </motion.div>
      ))}

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.05, ease }}
          className="mb-4 flex items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-1.5"
        >
          <div className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-accent/10">
            <Icon icon="mdi:flash" className="text-[8px] text-accent" />
          </div>
          <span className="text-[11px] font-medium tracking-wide text-muted/70">Backed by 10M+ residential IPs</span>
          <Icon icon="mdi:chevron-right" className="text-[10px] text-muted/30" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="font-heading max-w-4xl text-[2.4rem] leading-[1.0] tracking-tighter sm:text-[4.5rem] lg:text-[6rem]"
        >
          <span className="font-extralight text-foreground/60">The proxy network</span>
          <br />
          <span className="font-extralight text-foreground/60">that never</span>{" "}
          <span className="font-bold text-accent">sleeps</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="mt-6 max-w-md text-[14px] leading-[1.7] text-muted sm:mt-8 sm:text-[15px]"
        >
          Sub-50ms routing across 195 locations. Enterprise uptime,
          zero config. Just connect and scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease }}
          className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row"
        >
          <a
            href="#"
            className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
          >
            <Icon icon="mdi:rocket-launch-outline" className="text-sm" />
            Get Started Free
          </a>
          <a
            href="#"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] px-5 py-2.5 text-[13px] font-medium text-muted transition-all duration-200 hover:border-white/[0.1] hover:text-foreground"
          >
            <Icon icon="mdi:book-open-outline" className="text-sm opacity-50 group-hover:opacity-80 transition-opacity duration-200" />
            View Docs
          </a>
        </motion.div>
      </div>
    </section>
  );
}
