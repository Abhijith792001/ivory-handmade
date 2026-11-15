import type { Metadata, Viewport } from "next";
import "./globals.css";
import { sans, script, serif } from "@/lib/fonts";
import { siteConfig } from "@/lib/config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SplashScreen } from "@/components/brand/loader";
import { MotionProvider } from "@/components/layout/motion-provider";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Ivory · Handmade gifts, frames & hampers from Kerala", template: "%s · Ivory Handmade" },
  description: siteConfig.description,
  keywords: ["handmade gifts Kerala", "custom photo frame", "gift hamper Kochi", "build your own gift box", "dried flower bouquet", "Ivory handmade"],
  openGraph: {
    type: "website",
    siteName: "Ivory Handmade",
    locale: "en_IN",
    title: "Ivory · Handmade with love",
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FBF3EA",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Ivory Handmade",
  slogan: siteConfig.tagline,
  url: siteConfig.url,
  email: siteConfig.email,
  address: { "@type": "PostalAddress", addressRegion: "Kerala", addressCountry: "IN" },
  sameAs: [siteConfig.instagram],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body className="min-h-screen">
        <a href="#main" className="sr-only z-[200] rounded-full bg-sage-dark px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <MotionProvider>
        <SplashScreen />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppFloat />
        </MotionProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
