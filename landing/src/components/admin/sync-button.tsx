"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SyncButtonProps {
  onSyncComplete?: () => void;
}

export function SyncButton({ onSyncComplete }: SyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Sync failed");
      }
      onSyncComplete?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleSync} disabled={loading} size="sm">
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Syncing..." : "Sync Now"}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
