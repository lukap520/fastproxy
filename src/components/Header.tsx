"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
const navLinks = [
  { label: "Products", href: "#products", icon: "mdi:package-variant-closed" },
  { label: "Reviews", href: "#reviews", icon: "mdi:star-outline" },
  { label: "FAQ", href: "#faq", icon: "mdi:help-circle-outline" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-3 left-0 right-0 z-50 px-4"
    >
      <nav className="relative mx-auto flex max-w-3xl items-center rounded-full border border-white/[0.05] bg-background/70 px-5 py-2 backdrop-blur-xl">
        <a href="#" className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
            <Icon icon="mdi:flash" className="text-accent text-[10px]" />
          </div>
          <span className="font-heading text-[13px] font-semibold tracking-tight text-foreground">
            FastProxy
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-muted/70 transition-all duration-200 hover:bg-white/[0.03] hover:text-foreground"
            >
              <Icon icon={link.icon} className="text-[11px] opacity-40" />
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          <a
            href="#"
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-muted/70 transition-all duration-200 hover:bg-white/[0.03] hover:text-foreground"
          >
            <Icon icon="mdi:login-variant" className="text-[11px] opacity-40" />
            Log in
          </a>
          <a
            href="#"
            className="shimmer-btn inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
          >
            Get Started
            <Icon icon="mdi:arrow-right" className="text-[10px]" />
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 transition-colors duration-200 hover:bg-white/[0.04]"
          aria-label="Toggle menu"
        >
          <Icon
            icon={mobileOpen ? "mdi:close" : "mdi:menu"}
            className="text-base"
          />
        </button>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto mt-1.5 max-w-3xl rounded-3xl border border-white/[0.05] bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:bg-white/[0.03] hover:text-foreground"
              >
                <Icon icon={link.icon} className="text-xs text-muted/40" />
                {link.label}
              </a>
            ))}
            <div className="my-1.5 h-px bg-white/[0.04]" />
            <a
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:bg-white/[0.03] hover:text-foreground"
            >
              <Icon icon="mdi:login-variant" className="text-xs text-muted/40" />
              Log in
            </a>
            <a
              href="#"
              className="shimmer-btn mt-1 flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
            >
              Get Started
              <Icon icon="mdi:arrow-right" className="text-xs" />
            </a>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
