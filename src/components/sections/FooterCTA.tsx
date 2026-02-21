"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

const perks = [
  { icon: "mdi:credit-card-off-outline", label: "No credit card" },
  { icon: "mdi:timer-sand", label: "2 min setup" },
  { icon: "mdi:infinity", label: "Unlimited bandwidth" },
];

const products = [
  { icon: "mdi:home-outline", label: "Residential", href: "#" },
  { icon: "mdi:server-outline", label: "Datacenter", href: "#" },
  { icon: "mdi:cellphone", label: "Mobile", href: "#" },
  { icon: "mdi:earth", label: "ISP Proxies", href: "#" },
];

const resources = [
  { icon: "mdi:file-document-outline", label: "Documentation", href: "#" },
  { icon: "mdi:code-tags", label: "API Reference", href: "#" },
  { icon: "mdi:pulse", label: "Status Page", href: "#" },
  { icon: "mdi:notebook-outline", label: "Blog", href: "#" },
];

const company = [
  { icon: "mdi:information-outline", label: "About", href: "#" },
  { icon: "mdi:account-group-outline", label: "Careers", href: "#" },
  { icon: "mdi:email-outline", label: "Contact", href: "#" },
  { icon: "mdi:tag-outline", label: "Pricing", href: "#" },
];

export default function FooterCTA() {
  return (
    <footer className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="cta-glow-border relative rounded-2xl overflow-hidden mb-12"
      >
        <div className="relative bg-[#080808] rounded-2xl px-6 py-8 sm:px-10 sm:py-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.07] via-transparent to-accent/[0.05] pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-accent/[0.04] blur-[60px] pointer-events-none" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h2 className="font-heading text-[1.6rem] tracking-tighter leading-[1.1] sm:text-[2.2rem]">
                <span className="font-extralight text-foreground/50">Ready to </span>
                <span className="font-bold text-foreground">ship faster?</span>
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-5">
                {perks.map((perk) => (
                  <div key={perk.label} className="flex items-center gap-1.5">
                    <Icon icon={perk.icon} className="text-xs text-accent/45" />
                    <span className="text-[11px] text-muted/45">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/register"
                className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover shadow-[0_0_28px_rgba(255,107,0,0.2)]"
              >
                <Icon icon="mdi:flash" className="text-sm" />
                Start Building Free
              </Link>
              <a
                href="#"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] px-5 py-3 text-[13px] font-medium text-muted/55 transition-all duration-200 hover:border-white/[0.12] hover:text-foreground"
              >
                Pricing
                <Icon
                  icon="mdi:arrow-right"
                  className="text-xs opacity-50 group-hover:opacity-80 transition-all duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.012] overflow-hidden">
        <div className="px-6 py-8 sm:px-14 sm:py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="flex items-center gap-1.5 w-fit"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/10">
                  <Icon icon="mdi:flash" className="text-[10px] text-accent" />
                </div>
                <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
                  FastProxy
                </span>
              </Link>
              <p className="text-[12px] leading-relaxed text-muted/40">
                Enterprise-grade proxy infrastructure for the modern web.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { icon: "mdi:twitter", href: "#" },
                  { icon: "mdi:github", href: "#" },
                  { icon: "mdi:linkedin", href: "#" },
                  { icon: "mdi:discord", href: "#" },
                ].map((s) => (
                  <a
                    key={s.icon}
                    href={s.href}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.05] bg-white/[0.015] text-muted/30 transition-all duration-200 hover:border-accent/15 hover:text-foreground hover:bg-white/[0.025]"
                  >
                    <Icon icon={s.icon} className="text-xs" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Products", items: products },
              { title: "Resources", items: resources },
              { title: "Company", items: company },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-heading mb-4 text-[10px] font-semibold tracking-widest text-foreground/25 uppercase">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="group flex items-center gap-2 text-[12px] text-muted/40 transition-all duration-200 hover:text-foreground hover:translate-x-0.5"
                      >
                        <Icon
                          icon={item.icon}
                          className="text-xs text-muted/20 transition-colors duration-200 group-hover:text-accent/50"
                        />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

          <div className="mt-6 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-[11px] text-muted/20">
              &copy; {new Date().getFullYear()} FastProxy Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: "mdi:shield-outline", label: "Privacy" },
                { icon: "mdi:file-document-check-outline", label: "Terms" },
                { icon: "mdi:cookie-outline", label: "Cookies" },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="flex items-center gap-1 text-[11px] text-muted/20 transition-colors duration-200 hover:text-foreground/60"
                >
                  <Icon icon={item.icon} className="text-[10px]" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
