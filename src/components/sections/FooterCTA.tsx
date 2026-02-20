"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const perks = [
  { icon: "mdi:credit-card-off-outline", label: "No credit card required" },
  { icon: "mdi:timer-sand", label: "Setup in 2 minutes" },
  { icon: "mdi:infinity", label: "Unlimited bandwidth on paid plans" },
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
    <footer className="relative z-10 mx-auto max-w-5xl px-5 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="rounded-3xl border border-white/[0.04] bg-white/[0.01] overflow-hidden"
      >
        <div className="relative px-6 pt-10 pb-10 sm:px-14">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-accent/15 bg-accent/[0.06]" style={{ animation: "float-slow 6s ease-in-out infinite" }}>
              <Icon icon="mdi:rocket-launch-outline" className="text-lg text-accent/60" />
            </div>

            <h2 className="font-heading text-[1.8rem] tracking-tighter leading-[1.0] sm:text-[3rem]">
              <span className="font-extralight text-foreground/50">Ready to</span>{" "}
              <span className="font-bold text-foreground">scale?</span>
            </h2>

            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted/50">
              Join thousands of engineers shipping with FastProxy. Start free, upgrade when you need to.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row">
              <a
                href="#"
                className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
              >
                <Icon icon="mdi:flash" className="text-sm" />
                Start Building Free
              </a>
              <a
                href="#"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] px-5 py-3 text-[13px] font-medium text-muted transition-all duration-200 hover:border-white/[0.1] hover:text-foreground"
              >
                <Icon icon="mdi:tag-outline" className="text-sm opacity-50 group-hover:opacity-80 transition-opacity duration-200" />
                View Pricing
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {perks.map((perk) => (
                <div key={perk.label} className="flex items-center gap-1.5">
                  <Icon icon={perk.icon} className="text-xs text-accent/40" />
                  <span className="text-[11px] text-muted/40">{perk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent sm:mx-14" />

        <div className="px-6 py-8 sm:px-14 sm:py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:flash" className="text-sm text-accent" />
                <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
                  FastProxy
                </span>
              </div>
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
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.04] bg-white/[0.01] text-muted/30 transition-all duration-200 hover:border-accent/15 hover:text-foreground"
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
                <h4 className="font-heading mb-3 text-[10px] font-semibold tracking-widest text-foreground/30 uppercase">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="group flex items-center gap-2 text-[12px] text-muted/40 transition-colors duration-200 hover:text-foreground"
                      >
                        <Icon icon={item.icon} className="text-xs text-muted/20 transition-colors duration-200 group-hover:text-accent/50" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 h-px bg-white/[0.03]" />

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
                <a key={item.label} href="#" className="flex items-center gap-1 text-[11px] text-muted/20 transition-colors duration-200 hover:text-foreground">
                  <Icon icon={item.icon} className="text-[10px]" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
