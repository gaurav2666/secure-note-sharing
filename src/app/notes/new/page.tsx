"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Link2,
  Lock,
  Globe2,
  Clock3,
  Zap,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Eye,
} from "lucide-react";

export default function NewNotePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [shareType, setShareType] = useState<"one-time" | "time-based">(
    "time-based"
  );

  const [accessType, setAccessType] = useState<"public" | "password">(
    "public"
  );

  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  const [shareResult, setShareResult] = useState<{
    shareUrl: string;
    accessKey?: string;
    noteId: string;
  } | null>(null);

  const [copied, setCopied] = useState<"url" | "key" | null>(null);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setShareResult(null);
    setError("");

    try {
      // 1. Create the note
      const noteResponse = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const noteData = await noteResponse.json();

      if (!noteResponse.ok) {
        setError(noteData.message || "Failed to create note");
        return;
      }

      const noteId = noteData.note._id;

      // 2. Create the share link
      const shareResponse = await fetch("/api/share-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId,
          shareType,
          accessType,
          expiresAt,
        }),
      });

      const shareData = await shareResponse.json();

      if (!shareResponse.ok) {
        setError(
          shareData.message || "Failed to create share link"
        );
        return;
      }

      setShareResult({
        shareUrl: shareData.shareLink.shareUrl,
        accessKey: shareData.shareLink.accessKey,
        noteId,
      });

      setTitle("");
      setContent("");
      setExpiresAt("");
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (
    value: string,
    type: "url" | "key"
  ) => {
    await navigator.clipboard.writeText(value);

    setCopied(type);

    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ================= HEADER ================= */}

      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight">
                NoteShare
              </p>

              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Secure note sharing
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure workspace
          </div>
        </div>
      </header>

      {/* ================= PAGE ================= */}

      <div className="relative overflow-hidden">
        {/* Background decoration */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-12">
          {/* Page heading */}

          <div className="mb-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Private sharing made simple
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Create a note.
              <br />
              <span className="text-primary">
                Share it on your terms.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Write something important, choose exactly how it can be
              accessed, and generate a secure link in seconds.
            </p>
          </div>

          {/* ================= FORM ================= */}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              {/* ================= EDITOR ================= */}

              <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className="border-b bg-muted/20 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        Note details
                      </h2>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Add the information you want to share.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-6 sm:p-8">
                  {/* Title */}

                  <div>
                    <label className="mb-2.5 block text-sm font-medium">
                      Note title
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)
                      }
                      placeholder="e.g. Project credentials"
                      className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                      required
                    />
                  </div>

                  {/* Content */}

                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Note content
                      </label>

                      <span className="text-xs text-muted-foreground">
                        {content.length} characters
                      </span>
                    </div>

                    <textarea
                      value={content}
                      onChange={(e) =>
                        setContent(e.target.value)
                      }
                      placeholder="Write your note here..."
                      rows={16}
                      className="w-full resize-none rounded-xl border bg-background p-4 text-sm leading-7 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                      required
                    />

                    <p className="mt-2.5 text-xs text-muted-foreground">
                      Keep sensitive information secure by choosing
                      protected access.
                    </p>
                  </div>
                </div>
              </section>

              {/* ================= SHARING SETTINGS ================= */}

              <aside className="h-fit overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className="border-b bg-muted/20 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Link2 className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        Sharing settings
                      </h2>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Decide how your note can be accessed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-6">
                  {/* Share type */}

                  <div>
                    <div className="mb-3">
                      <p className="text-sm font-medium">
                        Link duration
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Choose how long the link remains usable.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {/* Time based */}

                      <button
                        type="button"
                        onClick={() =>
                          setShareType("time-based")
                        }
                        className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                          shareType === "time-based"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              shareType === "time-based"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Clock3 className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              Time-based
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Link works until the selected expiry
                              time.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* One time */}

                      <button
                        type="button"
                        onClick={() =>
                          setShareType("one-time")
                        }
                        className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                          shareType === "one-time"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              shareType === "one-time"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Zap className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              One-time
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Link becomes unavailable after one
                              successful view.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Expiry */}

                  <div>
                    <label className="mb-2.5 block text-sm font-medium">
                      Expiry date & time
                    </label>

                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) =>
                        setExpiresAt(e.target.value)
                      }
                      className="h-11 w-full cursor-pointer rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      required
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      The link automatically stops working after this
                      time.
                    </p>
                  </div>

                  {/* Access type */}

                  <div>
                    <div className="mb-3">
                      <p className="text-sm font-medium">
                        Access control
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Decide who can open your note.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Public */}

                      <button
                        type="button"
                        onClick={() =>
                          setAccessType("public")
                        }
                        className={`cursor-pointer rounded-2xl border p-4 text-center transition ${
                          accessType === "public"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <Globe2
                          className={`mx-auto h-5 w-5 ${
                            accessType === "public"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />

                        <p className="mt-2 text-xs font-semibold">
                          Public
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          No password
                        </p>
                      </button>

                      {/* Protected */}

                      <button
                        type="button"
                        onClick={() =>
                          setAccessType("password")
                        }
                        className={`cursor-pointer rounded-2xl border p-4 text-center transition ${
                          accessType === "password"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <Lock
                          className={`mx-auto h-5 w-5 ${
                            accessType === "password"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />

                        <p className="mt-2 text-xs font-semibold">
                          Protected
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Access key
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                      <div>
                        <p className="text-xs font-semibold">
                          Sharing summary
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {accessType === "password"
                            ? "Your note will require an access key."
                            : "Anyone with the link can access the note."}{" "}
                          It will{" "}
                          {shareType === "one-time"
                            ? "expire after one successful view."
                            : "remain available until the expiry time."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Create */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Creating secure link...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Create & Generate Link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </aside>
            </div>
          </form>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ================= RESULT ================= */}

          {shareResult && (
            <section className="mt-10 overflow-hidden rounded-3xl border bg-card shadow-sm">
              {/* Result header */}

              <div className="border-b bg-muted/20 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                    <Check className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Your secure link is ready
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Share the link below with the person who needs
                      access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                {/* URL */}

                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Share link
                    </label>

                    <span className="flex items-center gap-1.5 text-xs text-green-600">
                      <Check className="h-3.5 w-3.5" />
                      Ready
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1 rounded-xl border bg-muted/30 px-4 py-3.5">
                      <p className="break-all text-sm">
                        {shareResult.shareUrl}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          shareResult.shareUrl,
                          "url"
                        )
                      }
                      className="flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
                    >
                      {copied === "url" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}

                      <span className="hidden sm:inline">
                        {copied === "url"
                          ? "Copied"
                          : "Copy"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Access key */}

                {shareResult.accessKey && (
                  <div>
                    <div className="mb-2.5 flex items-center gap-2">
                      <label className="text-sm font-medium">
                        Access key
                      </label>

                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Required
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="min-w-0 flex-1 rounded-xl border bg-muted/30 px-4 py-3.5">
                        <p className="break-all font-mono text-sm">
                          {shareResult.accessKey}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            shareResult.accessKey!,
                            "key"
                          )
                        }
                        className="flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
                      >
                        {copied === "key" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}

                        <span className="hidden sm:inline">
                          {copied === "key"
                            ? "Copied"
                            : "Copy"}
                        </span>
                      </button>
                    </div>

                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/5 px-3 py-2.5 text-xs text-muted-foreground">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                      <p>
                        Keep this access key private. The recipient
                        needs it to unlock the protected note.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}

                <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
                  <Link
                    href={shareResult.shareUrl}
                    className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    <Eye className="h-4 w-4" />
                    View Shared Note
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={`/notes/${shareResult.noteId}`}
                    className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 text-sm font-medium transition hover:bg-muted"
                  >
                    Manage Note
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}