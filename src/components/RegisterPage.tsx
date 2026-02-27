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

function StrengthBar({ password }: { password: string }) {
    const score =
        password.length === 0
            ? 0
            : password.length < 6
                ? 1
                : password.length < 10 && !/[A-Z]/.test(password)
                    ? 2
                    : password.length >= 10 && /[A-Z]/.test(password) && /[0-9!@#$%^&*]/.test(password)
                        ? 4
                        : 3;

    const colors = [
        "bg-white/[0.04]",
        "bg-red-500/60",
        "bg-orange-400/70",
        "bg-yellow-400/80",
        "bg-emerald-400/80",
    ];
    const textColors = [
        "",
        "text-red-400/60",
        "text-orange-400/60",
        "text-yellow-400/60",
        "text-emerald-400/60",
    ];
    const labels = ["", "Weak", "Fair", "Good", "Strong"];

    return (
        <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-400 ${i <= score ? colors[score] : "bg-white/[0.04]"
                            }`}
                    />
                ))}
            </div>
            {password.length > 0 && (
                <span className={`text-[10px] font-medium transition-colors duration-300 ${textColors[score]}`}>
                    {labels[score]}
                </span>
            )}
        </div>
    );
}

function CustomCheckbox({
    id,
    checked,
    onChange,
}: {
    id: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            id={id}
            role="checkbox"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${checked
                ? "border-accent bg-accent shadow-[0_0_8px_rgba(255,107,0,0.25)]"
                : "border-white/[0.12] bg-white/[0.03] hover:border-white/[0.2]"
                }`}
        >
            <motion.svg
                viewBox="0 0 10 7"
                fill="none"
                className="h-2.5 w-2.5"
                initial={false}
                animate={checked ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <motion.path
                    d="M1 3L3.8 6L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={false}
                    animate={checked ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                />
            </motion.svg>
        </button>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const toast = useToast();
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [tos, setTos] = useState(false);

    const register = trpc.auth.register.useMutation({
        onSuccess: () => {
            toast("success", "Account created! Taking you to your dashboard…");
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

        if (password.length < 8) {
            toast("error", "Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            toast("error", "Passwords do not match");
            return;
        }
        if (!tos) {
            toast("error", "You must agree to the Terms of Service");
            return;
        }

        register.mutate({ name, email, password, tos });
    };

    return (
        <div className="relative min-h-screen bg-black flex items-center justify-center px-5 py-16">
            <div className="bg-depth" />
            <div className="grid-bg" />

            <div className="w-full max-w-[440px]">
                <motion.div {...field(0.05)} className="flex items-center justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                            <Icon icon="ph:lightning" className="text-accent text-sm" />
                        </div>
                        <span className="font-heading text-[15px] font-bold tracking-tight text-white drop-shadow-sm">
                            FastProxy
                        </span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.08, ease }}
                    className="relative rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]"
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent rounded-t-2xl" />

                    <motion.div {...field(0.15)} className="mb-6">
                        <h1 className="font-heading text-[1.65rem] font-bold tracking-tight text-white leading-tight drop-shadow-md">
                            Create your account
                        </h1>
                        <p className="mt-1 text-[13px] font-semibold text-gray-300 drop-shadow-sm">
                            Get started — no credit card required
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <motion.div {...field(0.2)}>
                            <label className="auth-label text-white/90 font-bold">Full name</label>
                            <div className="auth-input-wrap">
                                <Icon icon="mdi:account-outline" className="auth-input-icon" />
                                <input
                                    type="text"
                                    placeholder="Jane Smith"
                                    className="auth-input"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div {...field(0.25)}>
                            <label className="auth-label text-white/90 font-bold">Email address</label>
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

                        <motion.div {...field(0.3)}>
                            <label className="auth-label text-white/90 font-bold">Password</label>
                            <div className="auth-input-wrap">
                                <Icon icon="mdi:lock-outline" className="auth-input-icon" />
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    className="auth-input pr-10"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/30 hover:text-muted/70 transition-colors duration-200"
                                >
                                    <Icon
                                        icon={showPass ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                                        className="text-sm"
                                    />
                                </button>
                            </div>
                            <StrengthBar password={password} />
                        </motion.div>

                        <motion.div {...field(0.35)}>
                            <label className="auth-label text-white/90 font-bold">Confirm password</label>
                            <div className="auth-input-wrap">
                                <Icon icon="mdi:lock-check-outline" className="auth-input-icon" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat password"
                                    className="auth-input pr-10"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/30 hover:text-muted/70 transition-colors duration-200"
                                >
                                    <Icon
                                        icon={showConfirm ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                                        className="text-sm"
                                    />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div {...field(0.40)} className="flex items-start gap-2.5 mt-1">
                            <CustomCheckbox id="tos" checked={tos} onChange={setTos} />
                            <label
                                htmlFor="tos"
                                onClick={() => setTos(!tos)}
                                className="text-[11px] text-gray-400 leading-relaxed cursor-pointer select-none font-medium"
                            >
                                I agree to the{" "}
                                <span className="text-accent/80 hover:text-accent transition-colors duration-200 font-bold">
                                    Terms of Service
                                </span>{" "}
                                and{" "}
                                <span className="text-accent/80 hover:text-accent transition-colors duration-200 font-bold">
                                    Privacy Policy
                                </span>
                            </label>
                        </motion.div>

                        <motion.div {...field(0.46)}>
                            <button
                                type="submit"
                                disabled={register.isPending}
                                className="shimmer-btn w-full flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover mt-1 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {register.isPending ? (
                                    <Icon icon="mdi:loading" className="text-sm animate-spin" />
                                ) : (
                                    <Icon icon="mdi:account-plus-outline" className="text-sm" />
                                )}
                                {register.isPending ? "Creating Account..." : "Create Account"}
                            </button>
                        </motion.div>
                    </form>

                    <motion.p {...field(0.52)} className="mt-6 text-center text-[12px] font-medium text-gray-500">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-accent/80 hover:text-accent transition-colors duration-200 font-bold"
                        >
                            Sign in
                        </Link>
                    </motion.p>
                </motion.div>

                <motion.div {...field(0.56)} className="mt-6 flex justify-center">
                    <Link
                        href="/"
                        className="group flex items-center gap-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-200 hover:text-white"
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
