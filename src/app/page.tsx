import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Products from "@/components/sections/Products";
import Reviews from "@/components/sections/Reviews";
import FAQ from "@/components/sections/FAQ";
import FooterCTA from "@/components/sections/FooterCTA";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-depth" />
      <div className="grid-bg" />
      <div className="grain-overlay" />
      <Header />
      <main>
        <Hero />
        <Products />
        <Reviews />
        <FAQ />
      </main>
      <FooterCTA />
    </div>
  );
}
