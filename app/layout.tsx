import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { HeaderAuth } from "@/components/HeaderAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { PrivateKeyProvider } from "@/components/private-key-context";
import { HeaderLink } from "@/components/HeaderLink";
import { Shield } from "lucide-react";
import { RecoveryKeyDialog } from "@/components/RecoveryKeyDialog";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EEEVault",
  description:
    "Military-grade encryption for your files. Truly private, truly secure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <PrivateKeyProvider>
            <div className="min-h-screen">
              <header className="w-full border-b border-2 p-4">
                <div className="h-full container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      <Link
                        href="/"
                        className="text-xl font-semibold cursor-pointer hover:text-muted-foreground"
                      >
                        EEEVault
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <HeaderLink href="/my-files" title="My Files" />
                      <HeaderLink href="/shared-files" title="Shared Files" />
                      <RecoveryKeyDialog />
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <ThemeToggle />
                    <HeaderAuth />
                  </div>
                </div>
              </header>
              <main className="container mx-auto p-4">{children}</main>
            </div>
          </PrivateKeyProvider>
          <div id="preview-portal" className="pointer-events-auto"></div>
        </ThemeProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
