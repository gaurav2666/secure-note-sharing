"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Link2,
  Lock,
  Globe2,
  Clock3,
  Eye,
  Ban,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface NoteData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ShareLinkData {
  id: string;
  token: string;
  shareType: "one-time" | "time-based";
  accessType: "public" | "password";
  expiresAt: string;
  viewCount: number;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [note, setNote] = useState<NoteData | null>(null);
  const [shareLinks, setShareLinks] = useState<ShareLinkData[]>([]);

  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`);

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Unable to load note");
          router.push("/notes/new");
          return;
        }

        setNote(data.note);
        setShareLinks(data.shareLinks);
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [id, router]);

  const revokeShareLink = async (shareLinkId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this share link?"
    );

    if (!confirmed) {
      return;
    }

    setRevokingId(shareLinkId);

    try {
      const response = await fetch(
        `/api/share-links/${shareLinkId}/revoke`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to revoke share link");
        return;
      }

      setShareLinks((current) =>
        current.map((link) =>
          link.id === shareLinkId
            ? {
                ...link,
                revokedAt: new Date().toISOString(),
              }
            : link
        )
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setRevokingId(null);
    }
  };

  const copyShareLink = async (
    shareLink: ShareLinkData
  ) => {
    const url = `${window.location.origin}/share/${shareLink.token}`;

    await navigator.clipboard.writeText(url);

    setCopiedId(shareLink.id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading note...
        </p>
      </main>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}

        <button
          type="button"
          onClick={() => router.push("/notes/new")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold">
                  {note.title}
                </h1>

                <p className="text-sm text-muted-foreground">
                  Note details and shared links
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note content */}

        <section className="mb-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-6 py-5">
            <p className="text-sm font-medium">
              Note content
            </p>
          </div>

          <div className="whitespace-pre-wrap px-6 py-6 text-sm leading-7">
            {note.content}
          </div>
        </section>

        {/* Share links */}

        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-6 py-5">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />

              <p className="text-sm font-medium">
                Share links
              </p>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage access to this note.
            </p>
          </div>

          {shareLinks.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No share links created yet.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {shareLinks.map((link) => {
                const isRevoked = Boolean(link.revokedAt);

                const isExpired =
                  new Date(link.expiresAt) <= new Date();

                const isUsed =
                  link.shareType === "one-time" &&
                  Boolean(link.usedAt);

                const isInactive =
                  isRevoked || isExpired || isUsed;

                return (
                  <div
                    key={link.id}
                    className="p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                            {link.accessType === "password" ? (
                              <Lock className="h-3 w-3" />
                            ) : (
                              <Globe2 className="h-3 w-3" />
                            )}

                            {link.accessType === "password"
                              ? "Protected"
                              : "Public"}
                          </span>

                          <span className="rounded-full border px-2.5 py-1 text-xs">
                            {link.shareType === "one-time"
                              ? "One-time"
                              : "Time-based"}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              isInactive
                                ? "bg-muted text-muted-foreground"
                                : "bg-green-500/10 text-green-600"
                            }`}
                          >
                            {isRevoked
                              ? "Revoked"
                              : isUsed
                              ? "Used"
                              : isExpired
                              ? "Expired"
                              : "Active"}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            Expires{" "}
                            {new Date(
                              link.expiresAt
                            ).toLocaleString()}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            {link.viewCount} view
                            {link.viewCount === 1
                              ? ""
                              : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            copyShareLink(link)
                          }
                          className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                        >
                          {copiedId === link.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}

                          {copiedId === link.id
                            ? "Copied"
                            : "Copy link"}
                        </button>

                        {!isInactive && (
                          <button
                            type="button"
                            onClick={() =>
                              revokeShareLink(
                                link.id
                              )
                            }
                            disabled={
                              revokingId === link.id
                            }
                            className="flex h-10 items-center gap-2 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/5 disabled:opacity-50"
                          >
                            <Ban className="h-4 w-4" />

                            {revokingId === link.id
                              ? "Revoking..."
                              : "Revoke"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}