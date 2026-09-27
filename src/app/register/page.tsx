"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      console.error(error);
      setError(error.message || "Unable to create your account");
      setLoading(false);
      return;
    }

    console.log("Registered:", data);

    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              NoteShare
            </span>
          </Link>

          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground transition hover:text-primary"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-81px)] max-w-6xl items-center gap-16 px-6 py-12 lg:grid-cols-2">
          {/* Left content */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Secure note sharing
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-bold tracking-tight">
              Start sharing
              <br />
              <span className="text-primary">with confidence.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              Create your NoteShare account and keep control over every note
              you share. Simple tools, secure links, and flexible access
              controls.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Create private notes
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Keep your information organized in one secure place.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Share with control
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Choose between public and password-protected access.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Set access limits
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Use expiration times and one-time links when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Register card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border bg-card p-8 shadow-xl shadow-primary/5 sm:p-10">
              {/* Card header */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <FileText className="h-6 w-6" />
                </div>

                <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Start creating and securely sharing notes.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegister} className="mt-8 space-y-5">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                      required
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Choose a strong password to protect your account.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Register */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-7 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-foreground transition hover:text-primary"
                >
                  Sign in
                </Link>
              </div>

              {/* Security note */}
              <div className="mt-7 flex items-center justify-center gap-2 border-t pt-6 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Your account is protected with secure authentication.
              </div>
            </div>

            {/* Back */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                ← Back to NoteShare
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}