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
  { icon: "mdi:view-dashboard-outline", label: "Dashboard", href: "/dashboard" },
  { icon: "mdi:login", label: "Login", href: "/login" },
  { icon: "mdi:account-plus-outline", label: "Register", href: "/register" },
];

const company = [
  { icon: "mdi:tag-outline", label: "Pricing", href: "/#products" },
  { icon: "mdi:email-outline", label: "Contact", href: "mailto:support@fastproxy.com" },
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
                <span className="font-extralight text-white drop-shadow-sm">Ready to </span>
                <span className="font-bold text-white drop-shadow-sm">scale your operations?</span>
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-5">
                {perks.map((perk) => (
                  <div key={perk.label} className="flex items-center gap-1.5">
                    <Icon icon={perk.icon} className="text-[13px] text-accent drop-shadow-sm" />
                    <span className="text-[12px] font-medium text-gray-200">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/register"
                className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover shadow-[0_0_28px_rgba(255,107,0,0.2)]"
              >
                Get Started
              </Link>
              <a
                href="#"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] px-5 py-3 text-[13px] font-semibold text-white transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.05]"
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
                className="flex items-center gap-1.5 w-fit group"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/20 ring-1 ring-accent/10 group-hover:ring-accent/40 transition-all duration-300">
                  <Icon icon="ph:lightning" className="text-[10px] text-accent drop-shadow-sm" />
                </div>
                <span className="font-heading text-[15px] font-bold tracking-tight text-white drop-shadow-sm">
                  FastProxy
                </span>
              </Link>
              <p className="text-[13px] font-medium leading-relaxed text-gray-200">
                Enterprise-grade proxy infrastructure for the modern web.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { icon: "mdi:telegram", href: "#" },
                  { icon: "mdi:discord", href: "#" },
                ].map((s) => (
                  <a
                    key={s.icon}
                    href={s.href}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.05] bg-white/[0.015] text-muted/60 transition-all duration-200 hover:border-accent/30 hover:text-foreground hover:bg-white/[0.05]"
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
                <h4 className="font-heading mb-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-2 text-[13px] font-medium text-gray-200 transition-all duration-200 hover:text-white hover:translate-x-0.5"
                      >
                        <Icon
                          icon={item.icon}
                          className="text-xs text-gray-400 transition-colors duration-200 group-hover:text-accent drop-shadow-sm"
                        />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

          <div className="mt-6 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-[12px] font-medium text-gray-400">
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
                  className="flex items-center gap-1 text-[12px] font-medium text-gray-400 transition-colors duration-200 hover:text-white"
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
