import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastProxy - Premium Proxy Infrastructure",
  description:
    "Lightning-fast, reliable proxy infrastructure built for scale. Scrape, automate, and access the web without limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground scroll-smooth">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
