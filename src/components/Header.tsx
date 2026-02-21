"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

const navLinks = [
  { label: "Products", href: "/#products" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-3 left-0 right-0 z-50 px-4"
    >
      <nav
        className={`relative mx-auto flex max-w-3xl items-center rounded-full border px-5 py-2.5 backdrop-blur-2xl transition-all duration-500 ease-out ${scrolled
          ? "border-white/[0.09] bg-background/80 shadow-[0_4px_32px_-4px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,107,0,0.04)]"
          : "border-white/[0.05] bg-background/55"
          }`}
      >
        <a
          href="#"
          className="flex items-center gap-2 w-[130px] group"
        >
          <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 ring-1 ring-accent/10 group-hover:ring-accent/25 transition-all duration-300">
            <Icon icon="mdi:flash" className="text-accent text-[11px]" />
          </div>
          <span className="font-heading text-[13px] font-semibold tracking-tight text-foreground">
            FastProxy
          </span>
        </a>

        <AnimatePresence mode="wait">
          {isHome && (
            <motion.div
              key="nav-links"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-muted/50 transition-all duration-200 hover:text-foreground hover:bg-white/[0.05]"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Link
            href="/login"
            className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-muted/50 transition-all duration-200 hover:text-foreground hover:bg-white/[0.04]"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="shimmer-btn inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
          >
            Get Started
            <Icon icon="mdi:arrow-right" className="text-[10px]" />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 transition-colors duration-200 hover:bg-white/[0.05]"
          aria-label="Toggle menu"
        >
          <Icon icon={mobileOpen ? "mdi:close" : "mdi:menu"} className="text-base" />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="mx-auto mt-1.5 max-w-3xl rounded-3xl border border-white/[0.06] bg-background/85 px-4 py-3 backdrop-blur-xl md:hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
          >
            <div className="flex flex-col gap-0.5">
              {isHome && navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted/60 transition-all duration-200 hover:bg-white/[0.04] hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="my-1.5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted/60 transition-all duration-200 hover:bg-white/[0.04] hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="shimmer-btn mt-1 flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
              >
                Get Started
                <Icon icon="mdi:arrow-right" className="text-xs" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
