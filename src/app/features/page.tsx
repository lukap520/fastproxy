import Header from "@/components/Header";
import FooterCTA from "@/components/sections/FooterCTA";
import { Icon } from "@iconify/react";

export default function FeaturesPage() {
    return (
        <div className="relative min-h-screen bg-black">
            <div className="bg-depth" />
            <div className="grid-bg" />
            <Header />

            <main className="relative z-10 pt-28 pb-20 px-5 sm:px-6 max-w-6xl mx-auto w-full">
                <div className="mb-16 mt-8 text-center">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-10 bg-accent/60" />
                        <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
                            Infrastructure Specs
                        </span>
                        <div className="h-[1px] w-10 bg-accent/60" />
                    </div>

                    <h1 className="font-heading text-4xl md:text-6xl font-bold text-white tracking-tighter leading-[1.05] mb-5 drop-shadow-md">
                        Engineered for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover drop-shadow-sm">Absolute Scale</span>
                    </h1>

                    <p className="font-sans text-[15px] md:text-[16px] text-white/50 leading-relaxed font-medium max-w-2xl mx-auto">
                        A premium proxy ecosystem. Zero analytics. Zero tracking. Just raw IP performance engineered for high-frequency operations, with complete anonymity.
                    </p>
                </div>

                {/* Core Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">

                    {/* Feature 1: No KYC */}
                    <div className="group rounded-[20px] border border-white/[0.04] bg-gradient-to-br from-white/[0.015] to-transparent backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:bg-white/[0.025] hover:border-white/[0.08] hover:shadow-2xl hover:-translate-y-1">
                        <div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white mb-6 shadow-inner transition-colors group-hover:bg-white/[0.05]">
                                <Icon icon="ph:eye-closed-bold" className="text-xl text-white/80" />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">
                                Complete Anonymity. <br /> <span className="text-accent">Zero KYC.</span>
                            </h3>
                            <p className="font-sans text-[14px] leading-relaxed text-white/50 font-medium">
                                We don't ask for passports. We don't verify identities. Deploy millions of IPs instantly without onboarding hurdles or background checks. Your operational privacy is structural, not just a promise.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: Crypto */}
                    <div className="group rounded-[20px] border border-white/[0.04] bg-gradient-to-bl from-white/[0.015] to-transparent backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:bg-white/[0.025] hover:border-white/[0.08] hover:shadow-2xl hover:-translate-y-1">
                        <div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white mb-6 shadow-inner transition-colors group-hover:bg-white/[0.05]">
                                <Icon icon="ph:currency-btc-bold" className="text-xl text-white/80" />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">
                                Crypto Native. Instant Deposits.
                            </h3>
                            <p className="font-sans text-[14px] leading-relaxed text-white/50 font-medium max-w-md">
                                Fund your account immediately via BTC, ETH, LTC, or USDT. No fiat gateways required. Automated confirmations mean you go from deposit to deployment in minutes.
                            </p>
                            <div className="mt-6 flex gap-3">
                                <Icon icon="cryptocurrency-color:btc" className="text-2xl drop-shadow-lg" />
                                <Icon icon="cryptocurrency-color:eth" className="text-2xl drop-shadow-lg" />
                                <Icon icon="cryptocurrency-color:usdt" className="text-2xl drop-shadow-lg" />
                                <Icon icon="cryptocurrency-color:ltc" className="text-2xl drop-shadow-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Success Rate */}
                    <div className="group rounded-[20px] border border-white/[0.04] bg-gradient-to-tr from-white/[0.015] to-transparent backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:bg-white/[0.025] hover:border-white/[0.08] hover:shadow-2xl hover:-translate-y-1">
                        <div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white mb-6 shadow-inner transition-colors group-hover:bg-white/[0.05]">
                                <Icon icon="ph:target-bold" className="text-xl text-white/80" />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">
                                99.9% Success Rate.
                            </h3>
                            <p className="font-sans text-[14px] leading-relaxed text-white/50 font-medium">
                                Proprietary dynamic routing handles IP fatigue automatically. Target Cloudflare, Datadome, Kasada, and Akamai directly without triggering CAPTCHAs or blocks.
                            </p>
                        </div>
                    </div>

                    {/* Feature 4: Latency */}
                    <div className="group rounded-[20px] border border-white/[0.04] bg-gradient-to-tl from-white/[0.015] to-transparent backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:bg-white/[0.025] hover:border-white/[0.08] hover:shadow-2xl hover:-translate-y-1">
                        <div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white mb-6 shadow-inner transition-colors group-hover:bg-white/[0.05]">
                                <Icon icon="ph:lightning-bold" className="text-xl text-white/80" />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">
                                Sub-10ms Latency.
                            </h3>
                            <p className="font-sans text-[14px] leading-relaxed text-white/50 font-medium">
                                Milliseconds matter. Direct peering across Tier 1 backbones guarantees that your requests are executed with the absolute lowest structural latency possible.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Global Network Section */}
                <div className="mb-20 rounded-[20px] border border-white/[0.04] bg-gradient-to-b from-white/[0.015] to-transparent backdrop-blur-xl p-6 md:p-10">
                    <div className="flex flex-col lg:flex-row gap-8 justify-between items-end border-b border-white/[0.04] pb-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-[1px] w-6 bg-accent/60" />
                                <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-accent uppercase drop-shadow-sm">
                                    Coverage
                                </span>
                            </div>
                            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">
                                Global Network
                            </h2>
                            <p className="font-sans text-[14px] text-white/50 font-medium max-w-sm leading-relaxed">
                                40M+ active residential IPs across 195+ countries. Granular targeting down to specific cities and ASNs.
                            </p>
                        </div>
                        <div className="text-left lg:text-right w-full lg:w-auto">
                            <span className="font-heading text-5xl md:text-6xl font-bold text-accent tracking-tighter drop-shadow-sm">195+</span>
                            <span className="block font-sans text-[11px] font-bold text-white/40 uppercase tracking-widest mt-1">Target Geographies</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <CountryCard code="US" name="United States" count="6.2M IPs" />
                        <CountryCard code="GB" name="United Kingdom" count="3.1M IPs" />
                        <CountryCard code="DE" name="Germany" count="2.8M IPs" />
                        <CountryCard code="FR" name="France" count="2.1M IPs" />
                        <CountryCard code="JP" name="Japan" count="1.9M IPs" />
                        <CountryCard code="CA" name="Canada" count="1.5M IPs" />
                        <CountryCard code="AU" name="Australia" count="1.2M IPs" />
                        <CountryCard code="BR" name="Brazil" count="4.8M IPs" />
                    </div>
                </div>

                {/* Use Cases Sections (Merged) */}
                <div className="mb-16">
                    <div className="mb-10 text-center">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">
                            Any Workload
                        </h2>
                        <p className="font-sans text-[15px] text-white/50 font-medium max-w-2xl mx-auto">
                            Whether you're scraping data behind Cloudflare or botting limited releases, FastProxy provides the raw network muscle to execute your operations.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">

                        {/* Use Case 1: Web Scraping */}
                        <UseCaseBlock
                            title="Web Scraping"
                            subtitle="& Data Extraction"
                            icon="ph:database-bold"
                            description="Bypass the most aggressive anti-bot protections in the industry. Cloudflare, DataDome, and Kasada rely on IP reputation to block automated requests. FastProxy routes your scrapers through pristine connections, guaranteeing payload retrieval."
                            bullets={["Auto-Rotation", "100% Success Rate SLA", "Geographical Unblocking"]}
                        />

                        {/* Use Case 2: Sneaker Botting */}
                        <UseCaseBlock
                            title="E-Commerce Botting"
                            subtitle="& Limited Releases"
                            icon="ph:sneaker-bold"
                            description="Millisecond advantages win drops. FastProxy's infrastructure is connected directly to Tier 1 backbones to ensure the absolute lowest latency possible. Combined with immediate Crypto deposits and zero identity verification."
                            bullets={["Sub-10ms Response", "Instant Crypto Funding", "Unlimited Concurrent Tasks"]}
                        />

                        {/* Use Case 3: Market Research */}
                        <UseCaseBlock
                            title="Market Research"
                            subtitle="& SEO Analysis"
                            icon="ph:chart-line-up-bold"
                            description="See the web exactly as your target demographic sees it. Our granular targeting allows you to route requests through specific ISPs in over 195 countries. Verify ad placements, scrape pricing and track rankings."
                            bullets={["City-Level Targeting", "ASN Filtering", "Unbiased Data"]}
                        />

                        {/* Use Case 4: Social Media */}
                        <UseCaseBlock
                            title="Social Media"
                            subtitle="& Account Management"
                            icon="ph:users-three-bold"
                            description="Manage thousands of accounts simultaneously without triggering shadowbans or lockouts. Our sticky sessions allow you to bind a specific IP address to an account for up to 30 minutes, maintaining trust scores."
                            bullets={["Sticky Sessions", "Zero IP Leakage", "Protocol Security"]}
                        />

                    </div>
                </div>

            </main>

            <FooterCTA />
        </div>
    );
}

function CountryCard({ code, name, count }: { code: string, name: string, count: string }) {
    return (
        <div className="rounded-[14px] border border-white/[0.04] bg-white/[0.015] backdrop-blur-md p-3.5 flex items-center justify-between transition-all hover:bg-white/[0.03] hover:border-white/[0.08]">
            <div className="flex items-center gap-3">
                <img src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`} alt={name} className="w-6 h-auto shadow-sm rounded-sm" />
                <div>
                    <div className="font-sans text-[12px] font-bold text-white drop-shadow-sm">{name}</div>
                    <div className="font-sans text-[10px] font-medium text-accent">{count}</div>
                </div>
            </div>
        </div>
    );
}

function UseCaseBlock({ title, subtitle, icon, description, bullets }: { title: string, subtitle: string, icon: string, description: string, bullets: string[] }) {
    return (
        <div className="rounded-[20px] border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-10 justify-between items-start group transition-all duration-300 hover:bg-white/[0.025] hover:border-white/[0.08]">
            <div className="w-full md:w-1/3 shrink-0">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white mb-5 shadow-inner transition-colors group-hover:bg-white/[0.05]">
                    <Icon icon={icon} className="text-xl text-accent drop-shadow-sm" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white tracking-tight leading-[1.1] mb-2 drop-shadow-sm">
                    {title} <br /> <span className="text-white/50">{subtitle}</span>
                </h3>
            </div>

            <div className="w-full md:w-2/3 flex flex-col h-full justify-center">
                <p className="font-sans text-[13px] md:text-[14px] leading-relaxed text-white/60 font-medium mb-6 max-w-2xl">
                    {description}
                </p>
                <div className="flex flex-wrap gap-2.5">
                    {bullets.map(b => (
                        <div key={b} className="flex items-center gap-1.5 font-sans text-[10px] font-bold text-white/50 uppercase tracking-widest rounded-md border border-white/[0.06] px-2.5 py-1 bg-white/[0.02] shadow-inner">
                            <div className="w-1 h-1 rounded-full bg-accent/80 shadow-[0_0_8px_rgba(255,107,0,0.6)]" />
                            {b}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
