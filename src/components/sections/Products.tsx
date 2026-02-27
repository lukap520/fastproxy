"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

const products = [
  {
    id: "residential",
    icon: "mdi:home-city-outline",
    name: "Residential Proxies",
    short: "Residential",
    price: "$1.00/GB",
    tagline: "Guaranteed High Speeds",
    description:
      "Ethically sourced residential IPs with guaranteed high performance across all major regions.",
    features: [
      { icon: "mdi:earth", text: "195+ geo-locations with city-level targeting" },
      { icon: "mdi:rotate-3d-variant", text: "Automatic IP rotation or sticky sessions up to 30min" },
      { icon: "mdi:shield-check-outline", text: "99.5%+ success rate on protected targets" },
    ],
    stat: { label: "Avg Success Rate", value: "99.5%" },
    mockRows: [
      { icon: "mdi:swap-horizontal", label: "Rotation", value: "Auto" },
      { icon: "mdi:timer-outline", label: "Session", value: "30 min" },
      { icon: "mdi:earth", label: "Locations", value: "195+" },
    ],
  },
  {
    id: "datacenter",
    icon: "mdi:server-outline",
    name: "Datacenter Proxies",
    short: "Datacenter",
    price: "$10/Day",
    tagline: "Blazing Fast Throughput",
    description:
      "High-speed datacenter IPs optimized for bulk operations and maximum throughput.",
    features: [
      { icon: "mdi:speedometer", text: "Sub-10ms latency on average across all nodes" },
      { icon: "mdi:infinity", text: "Unlimited bandwidth with no throttling" },
      { icon: "mdi:ip-network-outline", text: "Dedicated & shared pools available" },
    ],
    stat: { label: "Avg Latency", value: "<10ms" },
    mockRows: [
      { icon: "mdi:flash-outline", label: "Speed", value: "10 Gbps" },
      { icon: "mdi:ip-network-outline", label: "Pool", value: "Dedicated" },
      { icon: "mdi:shield-lock-outline", label: "Auth", value: "IP / User" },
    ],
  },
  {
    id: "isp",
    icon: "mdi:wan",
    name: "ISP Proxies",
    short: "ISP",
    price: "$4/IP",
    tagline: "Best of Both Worlds",
    description:
      "Static residential IPs hosted in datacenters — combining speed with legitimacy.",
    features: [
      { icon: "mdi:lock-outline", text: "Static IPs that never rotate unless you want them to" },
      { icon: "mdi:web", text: "Appear as real ISP users to any target site" },
      { icon: "mdi:chart-line", text: "Ideal for account management and long sessions" },
    ],
    stat: { label: "IP Stability", value: "100%" },
    mockRows: [
      { icon: "mdi:lock-outline", label: "Type", value: "Static" },
      { icon: "mdi:web", label: "Identity", value: "ISP" },
      { icon: "mdi:clock-outline", label: "Duration", value: "30 days" },
    ],
  },
  {
    id: "mobile",
    icon: "mdi:cellphone-wireless",
    name: "Mobile Proxies",
    short: "Mobile",
    price: "$5/GB",
    tagline: "Real Mobile Carrier IPs",
    description:
      "Genuine 4G/5G mobile IPs from real carriers — the hardest proxy type to detect.",
    features: [
      { icon: "mdi:signal-cellular-3", text: "Real 4G/5G connections from major carriers" },
      { icon: "mdi:map-marker-radius-outline", text: "Country and carrier-level targeting" },
      { icon: "mdi:eye-off-outline", text: "Virtually undetectable by anti-bot systems" },
    ],
    stat: { label: "Detection Rate", value: "<0.1%" },
    mockRows: [
      { icon: "mdi:signal-cellular-3", label: "Network", value: "4G/5G" },
      { icon: "mdi:cellphone", label: "Carrier", value: "Real" },
      { icon: "mdi:eye-off-outline", label: "Stealth", value: "Max" },
    ],
  },
];

export default function Products() {
  const [active, setActive] = useState(0);
  const product = products[active];

  return (
    <section id="products" className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10 text-center"
      >
        <span className="text-[12px] font-bold tracking-widest text-accent uppercase drop-shadow-sm">Products</span>
        <h2 className="mt-3 font-heading text-2xl tracking-tighter text-white sm:text-3xl lg:text-4xl">
          <span className="font-extralight text-white drop-shadow-sm">Proxy products to power</span>{" "}
          <span className="font-bold drop-shadow-sm">your projects</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden">
          <div className="grid grid-cols-4">
            {products.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                className={`relative flex flex-col items-center gap-2 py-5 sm:py-6 transition-all duration-300 ${active === i
                  ? "text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${active === i
                    ? "bg-accent/12 shadow-[0_0_20px_rgba(255,107,0,0.12),0_0_0_1px_rgba(255,107,0,0.1)]"
                    : "bg-white/[0.03]"
                    }`}
                >
                  <Icon
                    icon={p.icon}
                    className={`text-xl transition-colors duration-300 ${active === i ? "text-accent" : "text-muted/50"
                      }`}
                  />
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[13px] sm:text-[14px] font-semibold tracking-tight">{p.short}</span>
                  <span
                    className={`text-[11px] sm:text-[12px] font-medium transition-colors duration-300 ${active === i ? "text-gray-200" : "text-gray-400"
                      }`}
                  >
                    from {p.price}
                  </span>
                </div>

                {active === i && (
                  <motion.div
                    layoutId="product-indicator"
                    className="absolute bottom-0 left-[12%] right-[12%] h-[2px] rounded-full bg-gradient-to-r from-transparent via-accent to-transparent"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="rounded-2xl border border-white/[0.1] bg-white/[0.03] overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.03)]"
        >
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
              <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.1] px-3 py-1">
                <Icon icon="mdi:flash" className="text-[11px] text-accent drop-shadow-sm" />
                <span className="text-[11px] font-bold tracking-wide text-accent uppercase drop-shadow-sm">
                  {product.tagline}
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold tracking-tight text-white drop-shadow-sm sm:text-2xl">
                {product.name}
              </h3>

              <p className="mt-2 max-w-md text-[14px] font-medium leading-[1.75] text-gray-200">
                {product.description}
              </p>

              <div className="mt-5 flex flex-col gap-3">
                {product.features.map((f) => (
                  <div key={f.text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/[0.1]">
                      <Icon icon={f.icon} className="text-[11px] text-accent drop-shadow-sm" />
                    </div>
                    <span className="text-[13px] font-medium leading-[1.65] text-white/90">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3">
                <Link
                  href="/register"
                  className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover shadow-[0_0_20px_rgba(255,107,0,0.15)]"
                >
                  Get Started
                  <Icon icon="mdi:arrow-right" className="text-xs" />
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center border-t lg:border-t-0 lg:border-l border-white/[0.04] overflow-hidden p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.07] via-accent/[0.025] to-transparent" />

              <div
                className="relative w-full max-w-[320px]"
                style={{ animation: "float-slow 6s ease-in-out infinite" }}
              >
                <div className="rounded-2xl border border-white/[0.1] bg-background/90 backdrop-blur-sm shadow-[0_24px_60px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.025] px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/20" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/20" />
                    </div>
                    <div className="ml-2 flex items-center gap-2 flex-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/20">
                        <Icon icon={product.icon} className="text-[11px] text-accent drop-shadow-sm" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">{product.short} Dashboard</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] px-3.5 py-2.5">
                      <span className="text-[11px] font-medium text-gray-200">Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-400/90">Active</span>
                      </div>
                    </div>

                    <div className="mb-4 space-y-2">
                      {product.mockRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2 border border-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.1]">
                              <Icon icon={row.icon} className="text-[10px] text-accent drop-shadow-sm" />
                            </div>
                            <span className="text-[12px] font-medium text-gray-200">{row.label}</span>
                          </div>
                          <span className="text-[12px] font-bold text-white drop-shadow-sm">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/[0.15] to-accent/[0.05] px-4 py-3 shadow-[0_0_15px_rgba(255,107,0,0.1)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-white/90">{product.stat.label}</span>
                        <span className="font-heading text-xl font-bold text-accent drop-shadow-sm">{product.stat.value}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-3 -bottom-3 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/15 bg-background/90 backdrop-blur-sm shadow-lg">
                  <Icon icon={product.icon} className="text-lg text-accent/60" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
