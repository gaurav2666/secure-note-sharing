"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Lock,
  Clock3,
  ShieldCheck,
  AlertCircle,
  Plus,
} from "lucide-react";

interface NoteData {
  title: string;
  content: string;
}

interface ShareData {
  shareType: "one-time" | "time-based";
  expiresAt: string;
  viewCount: number;
}

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState("");

  const [note, setNote] = useState<NoteData | null>(null);
  const [share, setShare] = useState<ShareData | null>(null);

  const [requiresPassword, setRequiresPassword] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }

    hasLoaded.current = true;

    const loadPage = async () => {
      const resolvedParams = await params;

      setToken(resolvedParams.token);

      try {
        const response = await fetch(
          `/api/share/${resolvedParams.token}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to access this note");
          return;
        }

        if (data.requiresPassword) {
          setRequiresPassword(true);
          return;
        }

        setNote(data.note);
        setShare(data.share);
      } catch (error) {
        console.error(error);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [params]);

  const handleUnlock = async () => {
    if (!accessKey.trim()) {
      setError("Please enter the access key");
      return;
    }

    setUnlocking(true);
    setError("");

    try {
      const response = await fetch(`/api/share/${token}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to unlock note");
        return;
      }

      setNote(data.note);
      setShare(data.share);
      setRequiresPassword(false);
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

          <p className="mt-4 text-sm text-muted-foreground">
            Opening secure note...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Unable to open note
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (requiresPassword) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Lock className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Protected Note
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This note requires an access key to continue.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium">
              Access key
            </label>

            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Enter access key"
              className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            <button
              type="button"
              onClick={handleUnlock}
              disabled={unlocking}
              className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />

              {unlocking ? "Unlocking..." : "Unlock Note"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!note || !share) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Shared Note
              </p>

              <p className="text-xs text-muted-foreground">
                Securely shared with you
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>

        {/* Note */}
        <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-7 py-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {note.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />

                Expires{" "}
                {new Date(share.expiresAt).toLocaleString()}
              </span>

              <span>•</span>

              <span>
                {share.shareType === "one-time"
                  ? "One-time access"
                  : "Time-based access"}
              </span>
            </div>
          </div>

          <div className="whitespace-pre-wrap px-7 py-8 text-sm leading-7">
            {note.content}
          </div>
        </article>

        {/* Create Another Note */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/notes/new"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Another Note
          </Link>
        </div>
      </div>
    </main>
  );
}