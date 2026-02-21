"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/ui/Toast";

const ease = [0.25, 0.1, 0.25, 1] as const;

const field = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease },
});

export default function LoginPage() {
    const router = useRouter();
    const toast = useToast();
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = trpc.auth.login.useMutation({
        onSuccess: () => {
            toast("success", "Welcome back! Redirecting to your dashboard…");
            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 800);
        },
        onError: (err) => {
            toast("error", err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login.mutate({ email, password });
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-5 py-16">
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px] rounded-full bg-accent/[0.01] blur-[200px] -mt-10" />

            <div className="w-full max-w-[420px]">
                <motion.div {...field(0.05)} className="flex items-center justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                            <Icon icon="mdi:flash" className="text-accent text-sm" />
                        </div>
                        <span className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                            FastProxy
                        </span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.08, ease }}
                    className="relative rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent rounded-t-2xl" />

                    <motion.div {...field(0.15)} className="mb-6">
                        <h1 className="font-heading text-[1.6rem] font-bold tracking-tight text-foreground leading-tight">
                            Welcome back
                        </h1>
                        <p className="mt-1 text-[13px] text-muted/50">
                            Sign in to your FastProxy account
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <motion.div {...field(0.22)}>
                            <label className="auth-label">Email address</label>
                            <div className="auth-input-wrap">
                                <Icon icon="mdi:email-outline" className="auth-input-icon" />
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    className="auth-input"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div {...field(0.28)}>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="auth-label">Password</label>
                                <button
                                    type="button"
                                    className="text-[11px] text-accent/55 hover:text-accent transition-colors duration-200"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="auth-input-wrap">
                                <Icon icon="mdi:lock-outline" className="auth-input-icon" />
                                <input
                                    type={show ? "text" : "password"}
                                    placeholder="••••••••••"
                                    className="auth-input pr-10"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/30 hover:text-muted/70 transition-colors duration-200"
                                >
                                    <Icon icon={show ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="text-sm" />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div {...field(0.35)}>
                            <button
                                type="submit"
                                disabled={login.isPending}
                                className="shimmer-btn w-full flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover mt-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {login.isPending ? (
                                    <Icon icon="mdi:loading" className="text-sm animate-spin" />
                                ) : (
                                    <Icon icon="mdi:login" className="text-sm" />
                                )}
                                {login.isPending ? "Signing in..." : "Sign In"}
                            </button>
                        </motion.div>
                    </form>

                    <motion.p {...field(0.54)} className="mt-6 text-center text-[12px] text-muted/40">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-accent/70 hover:text-accent transition-colors duration-200 font-medium"
                        >
                            Create an account
                        </Link>
                    </motion.p>
                </motion.div>

                <motion.div {...field(0.58)} className="mt-6 flex justify-center">
                    <Link
                        href="/"
                        className="group flex items-center gap-1.5 text-[12px] text-muted/30 transition-colors duration-200 hover:text-foreground/60"
                    >
                        <Icon
                            icon="mdi:arrow-left"
                            className="text-xs transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Back to home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
