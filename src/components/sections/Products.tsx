"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const products = [
  {
    id: "residential",
    icon: "mdi:home-city-outline",
    name: "Residential Proxies",
    short: "Residential",
    price: "$3.5/GB",
    tagline: "Guaranteed High Speeds",
    description: "Ethically sourced residential IPs with guaranteed high performance across all major regions.",
    features: [
      { icon: "mdi:earth", text: "195+ geo-locations with city-level targeting" },
      { icon: "mdi:rotate-3d-variant", text: "Automatic IP rotation or sticky sessions up to 30min" },
      { icon: "mdi:shield-check-outline", text: "99.5%+ success rate on protected targets" },
    ],
    flags: ["🇺🇸", "🇬🇧", "🇩🇪", "🇯🇵", "🇧🇷"],
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
    description: "High-speed datacenter IPs optimized for bulk operations and maximum throughput.",
    features: [
      { icon: "mdi:speedometer", text: "Sub-10ms latency on average across all nodes" },
      { icon: "mdi:infinity", text: "Unlimited bandwidth with no throttling" },
      { icon: "mdi:ip-network-outline", text: "Dedicated & shared pools available" },
    ],
    flags: ["🇺🇸", "🇳🇱", "🇩🇪", "🇸🇬", "🇬🇧"],
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
    description: "Static residential IPs hosted in datacenters — combining speed with legitimacy.",
    features: [
      { icon: "mdi:lock-outline", text: "Static IPs that never rotate unless you want them to" },
      { icon: "mdi:web", text: "Appear as real ISP users to any target site" },
      { icon: "mdi:chart-line", text: "Ideal for account management and long sessions" },
    ],
    flags: ["🇺🇸", "🇬🇧", "🇩🇪", "🇫🇷", "🇨🇦"],
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
    description: "Genuine 4G/5G mobile IPs from real carriers — the hardest proxy type to detect.",
    features: [
      { icon: "mdi:signal-cellular-3", text: "Real 4G/5G connections from major carriers" },
      { icon: "mdi:map-marker-radius-outline", text: "Country and carrier-level targeting" },
      { icon: "mdi:eye-off-outline", text: "Virtually undetectable by anti-bot systems" },
    ],
    flags: ["🇺🇸", "🇬🇧", "🇮🇳", "🇧🇷", "🇮🇩"],
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
    <section id="products" className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10 text-center"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/[0.06]">
            <Icon icon="mdi:package-variant-closed" className="text-sm text-accent/60" />
          </div>
          <span className="text-[11px] font-medium tracking-wide text-muted/60 uppercase">Products</span>
        </div>
        <h2 className="font-heading text-2xl tracking-tighter text-foreground sm:text-3xl lg:text-4xl">
          <span className="font-extralight text-foreground/60">Proxy products to power</span>{" "}
          <span className="font-bold">your projects</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mb-8 flex justify-center"
      >
        <div className="inline-flex gap-1 rounded-full border border-white/[0.05] bg-white/[0.02] p-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-all duration-250 ${
                active === i
                  ? "bg-accent text-white shadow-[0_0_12px_rgba(255,107,0,0.15)]"
                  : "text-muted/60 hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              <Icon icon={p.icon} className="text-sm" />
              <span className="hidden sm:inline">{p.short}</span>
              <span className="sm:hidden">{p.short}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden"
        >
          <div className="grid gap-0 lg:grid-cols-5">
            <div className="flex flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 lg:col-span-3">
              <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/15 bg-accent/[0.04] px-3 py-1">
                <Icon icon="mdi:flash" className="text-[10px] text-accent" />
                <span className="text-[10px] font-semibold tracking-wide text-accent/80 uppercase">
                  {product.tagline}
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-[1.75rem]">
                {product.name}
              </h3>

              <p className="mt-2 max-w-md text-[13px] leading-[1.7] text-muted/55">
                {product.description}
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {product.features.map((f) => (
                  <div key={f.text} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/[0.04] bg-white/[0.02]">
                      <Icon icon={f.icon} className="text-[10px] text-accent/50" />
                    </div>
                    <span className="text-[12px] leading-[1.6] text-muted/55">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3">
                <a
                  href="#"
                  className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
                >
                  Get Started
                  <Icon icon="mdi:arrow-right" className="text-xs" />
                </a>
                <span className="text-[12px] text-muted/35">Starting from <span className="font-semibold text-foreground/60">{product.price}</span></span>
              </div>
            </div>

            <div className="relative lg:col-span-2 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-white/[0.03] overflow-hidden p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-accent/[0.03] to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-tl from-foreground/[0.02] via-transparent to-transparent" />
              
              <div className="relative w-full max-w-[320px]" style={{ animation: "float-slow 6s ease-in-out infinite" }}>
                <div className="rounded-2xl border border-white/[0.08] bg-background/80 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-white/[0.04] bg-white/[0.02] px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                    </div>
                    <div className="ml-2 flex items-center gap-2 flex-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/10">
                        <Icon icon={product.icon} className="text-[10px] text-accent" />
                      </div>
                      <span className="text-[10px] font-medium text-foreground/60">{product.short} Proxy</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-accent/15 bg-accent/[0.04] px-3.5 py-2.5">
                      <span className="text-[10px] text-muted/50">Status</span>
                      <span className="text-[11px] font-semibold text-accent">Active</span>
                    </div>

                    <div className="mb-4 space-y-2">
                      {product.mockRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.04]">
                              <Icon icon={row.icon} className="text-[9px] text-accent/40" />
                            </div>
                            <span className="text-[11px] text-muted/50">{row.label}</span>
                          </div>
                          <span className="text-[11px] font-medium text-foreground/60">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-white/[0.06] bg-gradient-to-br from-accent/[0.08] to-accent/[0.02] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted/50">{product.stat.label}</span>
                        <span className="font-heading text-xl font-bold text-accent/80">{product.stat.value}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-3 -bottom-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.08] backdrop-blur-sm shadow-lg opacity-90">
                  <Icon icon={product.icon} className="text-2xl text-accent/60" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
