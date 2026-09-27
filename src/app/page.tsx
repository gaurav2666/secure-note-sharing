"use client";

import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Link2,
  Clock3,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              NoteShare
            </span>
          </Link>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Simple. Private. Secure.
            </div>

            <h1 className="max-w-2xl text-5xl font-bold tracking-tight sm:text-6xl">
              Make notes.
              <br />
              <span className="text-primary">Share securely.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Create private notes and share them with confidence. Generate
              secure links with password protection, expiration times, and
              one-time access.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border bg-background px-6 text-sm font-medium transition hover:bg-muted"
              >
                Login to your account
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Password protected
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Expiring links
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                One-time sharing
              </span>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="rounded-3xl border bg-card p-3 shadow-2xl shadow-primary/5">
              <div className="rounded-2xl border bg-background">
                {/* Mock window header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Project Credentials
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Shared securely
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs text-green-600">
                    <ShieldCheck className="h-3 w-3" />
                    Secure
                  </div>
                </div>

                {/* Note preview */}
                <div className="space-y-5 p-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      NOTE
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Production Access
                    </h3>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="space-y-2">
                      <div className="h-2.5 w-4/5 rounded-full bg-muted" />
                      <div className="h-2.5 w-full rounded-full bg-muted" />
                      <div className="h-2.5 w-3/5 rounded-full bg-muted" />
                    </div>
                  </div>

                  {/* Security settings */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border p-3">
                      <Lock className="h-4 w-4 text-primary" />

                      <p className="mt-2 text-xs font-medium">
                        Protected
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Access key
                      </p>
                    </div>

                    <div className="rounded-xl border p-3">
                      <Clock3 className="h-4 w-4 text-primary" />

                      <p className="mt-2 text-xs font-medium">
                        Expires
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        In 24 hours
                      </p>
                    </div>

                    <div className="rounded-xl border p-3">
                      <Link2 className="h-4 w-4 text-primary" />

                      <p className="mt-2 text-xs font-medium">
                        Share link
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Ready to share
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating security card */}
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border bg-card p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Secure sharing
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Control who can access your note
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}