import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  ChevronRight,
  File,
  FileKey,
  Lock,
  Shield,
  Unlock,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted pt-16 md:pt-24 lg:pt-32 rounded-2xl">
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
                    <Lock className="mr-1 h-3 w-3" />
                    <span>End-to-End Encryption</span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                    Your files.{" "}
                    <span className="text-primary">Truly private.</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Military-grade encryption that ensures only you can access
                    your data. Not even we can see your files.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="group" asChild>
                    <Link href={"/my-files"}>
                      Get started
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center lg:justify-end">
                <div className="relative h-[350px] w-[350px] md:h-[450px] md:w-[450px] lg:h-[500px] lg:w-[500px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur-3xl" />
                  </div>
                  <div className="relative z-10 h-full w-full rounded-xl bg-gradient-to-br from-background/80 to-background/30 p-6 backdrop-blur-sm border border-border/50">
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-2">
                          <FileKey className="h-5 w-5 text-primary" />
                          <span className="font-medium">Encrypted Files</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span className="text-sm">Secure</span>
                        </div>
                      </div>
                      <p className="font-medium my-2">What you see:</p>
                      <div className="grid gap-3">
                        {[1].map((item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-muted p-2">
                                <File className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  Document-{item}.pdf
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  2.4 MB
                                </div>
                              </div>
                            </div>
                            <Unlock className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                        <p className="font-medium my-2">
                          What our servers see:
                        </p>
                        {[1].map((item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-muted p-2">
                                <FileKey className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  9f2d1a5c6f7e4d7a...
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  a3d4f56d98712c4f...
                                </div>
                              </div>
                            </div>
                            <Lock className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-5" />
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
                  <Shield className="mr-1 h-3 w-3" />
                  <span>Advanced Security</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Uncompromising security features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is built from the ground up with security and
                  privacy as the foundation.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Lock className="h-10 w-10 text-primary" />,
                  title: "End-to-End Encryption",
                  description:
                    "Your files are encrypted before they leave your device, ensuring only you can access them.",
                },
                {
                  icon: <FileKey className="h-10 w-10 text-primary" />,
                  title: "Zero-Knowledge Architecture",
                  description:
                    "We can never access your encryption keys or decrypt your data, even if compelled by law.",
                },
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "Secure Sharing",
                  description:
                    "Share files securely with others while maintaining end-to-end encryption.",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden transition-all hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardHeader>
                    <div className="mb-2">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-background px-3 py-1 text-sm">
                  <Lock className="mr-1 h-3 w-3" />
                  <span>The Process</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  How our encryption works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Understanding the technology that keeps your files secure
                </p>
              </div>
            </div>
            <div className="mx-auto mt-12 max-w-5xl">
              <div className="relative">
                {/* Timeline line - visible on md screens and up */}
                <div className="absolute left-8 top-0 h-full w-px bg-border md:left-1/2 md:-ml-px hidden md:block" />
                <div className="space-y-12 md:space-y-24">
                  {[
                    {
                      step: "01",
                      title: "Password-Based Key Protection",
                      description:
                        "On first login, you're asked to set a password. A secure RSA-4096 keypair is generated on your device. The public key is saved to our server, while the private key is encrypted using a strong password-derived AES-256-GCM key and then stored securely. We can never decrypt your private key.",
                    },
                    {
                      step: "02",
                      title: "Safe Multi-Device Access",
                      description:
                        "When you log in from any device, your encrypted private key is downloaded and decrypted locally using your password. This means your private key never leaves your device in a readable form, enabling secure access across devices.",
                    },
                    {
                      step: "03",
                      title: "End-to-End File Encryption",
                      description:
                        "Every file you upload is encrypted on your device using AES-256-GCM. The encryption key for each file is itself encrypted using your public RSA key and stored securely. Only you can decrypt it.",
                    },
                    {
                      step: "04",
                      title: "Private, Secure Access",
                      description:
                        "When accessing your files, your device decrypts the file key using your private RSA key (which only you can unlock), then decrypts the file. We never have access to your files or your keys.",
                    },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="relative flex flex-col md:flex-row"
                    >
                      {/* Mobile layout (stacked) */}
                      <div className="flex md:hidden mb-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <span className="text-xl font-bold">{step.step}</span>
                        </div>
                        <div className="ml-6 flex flex-col justify-center">
                          <h3 className="text-xl font-bold">{step.title}</h3>
                        </div>
                      </div>

                      {/* Desktop layout (side by side) */}
                      <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <span className="text-xl font-bold">{step.step}</span>
                        </div>
                      </div>

                      <div
                        className={`md:w-[calc(50%-40px)] ${
                          index % 2 === 0
                            ? "md:pr-12 md:text-right md:mr-auto"
                            : "md:pl-12 md:ml-auto"
                        }`}
                      >
                        <h3 className="text-xl font-bold md:mt-4 hidden md:block">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-background px-3 py-1 text-sm">
                  <Shield className="mr-1 h-3 w-3" />
                  <span>FAQ</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Frequently asked questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about our secure storage solution
                </p>
              </div>
            </div>
            <div className="mx-auto mt-12 max-w-3xl space-y-4">
              {[
                {
                  question: "How secure is your encryption?",
                  answer:
                    "We use AES-256 encryption, which is virtually unbreakable with current technology. It's the same standard used by governments and military organizations worldwide to protect classified information.",
                },
                {
                  question: "Can you access my files?",
                  answer:
                    "No. Our zero-knowledge architecture means we never have access to your encryption keys or unencrypted data. Your files are encrypted before they leave your device, and only you have the key to decrypt them.",
                },
                {
                  question: "What happens if I forget my password?",
                  answer:
                    "Since we use end-to-end encryption and don't store your password or encryption keys, we cannot recover your account if you forget your password.", // However, we offer an optional recovery key that you can save securely to regain access.
                },
                {
                  question: "How do I share files securely?",
                  answer:
                    "Our platform allows you to share files while maintaining end-to-end encryption. When you share a file, a unique decryption key is generated for that specific share, which can be revoked at any time.",
                },
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative overflow-hidden rounded-lg bg-primary p-8 md:p-12">
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10" />
              <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center text-primary-foreground">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Ready to secure your data?
                  </h2>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="group"
                    asChild
                  >
                    <Link href={"/my-files"}>
                      Get Started
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">EEEVault</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Military-grade encryption for your files. Truly private, truly
                secure.
              </p>
            </div>
          </div>
          <div className="mt-12 border-t pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} EEEVault. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="https://www.instagram.com/b1rigu/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </Link>
                <Link
                  href="https://github.com/b1rigu"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
