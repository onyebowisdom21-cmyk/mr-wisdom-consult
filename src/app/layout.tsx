import "./globals.css";
import { ChatWidget } from "@/components/features/ChatWidget";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export const metadata = {
  title: {
    default: "Mr Wisdom Tech Media & Business Consult",
    template: "%s | Mr Wisdom Consult",
  },
  description:
    "Practical technology, media and business consulting, alongside a curated hub of opportunities and resources.",
  icons: { icon: "/icon.jpeg", apple: "/icon.jpeg" },
  openGraph: {
    images: [{ url: "/mr-wisdom-logo.jpeg", alt: "Mr Wisdom Tech Media and Business Consult logo" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ChatWidget />
      </body>
    </html>
  )
}
