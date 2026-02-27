"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

const ease = [0.25, 0.1, 0.25, 1] as const;

const floatingIcons = [
  { icon: "mdi:shield-lock-outline", x: "7%", y: "18%", delay: 0, dur: "6s" },
  { icon: "mdi:earth", x: "88%", y: "12%", delay: 0.3, dur: "7s" },
  { icon: "mdi:server-network-outline", x: "4%", y: "65%", delay: 0.6, dur: "8s" },
  { icon: "mdi:speedometer", x: "92%", y: "58%", delay: 0.2, dur: "6.5s" },
  { icon: "mdi:code-braces", x: "14%", y: "85%", delay: 0.8, dur: "7.5s" },
  { icon: "mdi:cloud-check-outline", x: "83%", y: "82%", delay: 0.5, dur: "8.5s" },
];

const stats = [
  { value: "15M+", label: "IPs" },
  { value: "<50ms", label: "Latency" },
  { value: "195+", label: "Locations" },
  { value: "99.5%", label: "Uptime" },
];

export default function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-5 pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-28 overflow-hidden">
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 1 + item.delay }}
          className="absolute pointer-events-none hidden lg:block"
          style={{ left: item.x, top: item.y, animation: `float-slow ${item.dur} ease-in-out infinite` }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-[0_2px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            <Icon icon={item.icon} className="text-xl text-accent/50" />
          </div>
        </motion.div>
      ))}

      <div className="relative flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="font-heading max-w-4xl text-[2.4rem] leading-[1.0] tracking-tighter sm:text-[4.5rem] lg:text-[6rem]"
        >
          <span className="font-extralight text-white drop-shadow-sm">The proxy network</span>
          <br />
          <span className="font-extralight text-white drop-shadow-sm">that never</span>{" "}
          <span className="relative inline-block font-bold text-accent">
            sleeps
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease }}
          className="mt-7 max-w-md text-[15px] leading-[1.75] text-gray-200 sm:mt-8 sm:text-[16px] drop-shadow-sm"
        >
          Sub-50ms routing across 195 locations. Enterprise uptime,
          zero config. Just connect and scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease }}
          className="mt-5 flex flex-col items-center gap-3 sm:mt-7 sm:flex-row"
        >
          <Link
            href="/register"
            className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-accent px-6 py-[11px] text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
          >
            <Icon icon="mdi:rocket-launch-outline" className="text-sm" />
            Get Started
          </Link>
          <Link
            href="/#products"
            className="group mt-3 sm:mt-0 inline-flex items-center justify-center gap-1.5 rounded-full border border-white/[0.15] px-5 py-[11px] text-[13px] font-medium text-white transition-all duration-200 hover:border-white/[0.25] w-full sm:w-auto bg-white/[0.05] hover:bg-white/[0.1]"
          >
            <Icon icon="mdi:tag-outline" className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-200" />
            View Pricing
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease }}
          className="mt-12 flex items-center gap-5 sm:gap-8 rounded-2xl border border-white/[0.04] bg-white/[0.015] px-6 py-3.5 backdrop-blur-sm"
        >
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-5 sm:gap-8">
              <div className="text-center">
                <span className="font-heading text-[16px] font-bold tracking-tight text-white sm:text-[18px] drop-shadow-sm">{s.value}</span>
                <p className="text-[10px] tracking-widest text-gray-300 uppercase mt-0.5 font-medium">{s.label}</p>
              </div>
              {i < stats.length - 1 && (
                <div className="h-5 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
