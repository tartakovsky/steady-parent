"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  AlertTriangle,
  XCircle,
  Map,
  Clock,
} from "lucide-react";

import { StatsCard } from "@/components/admin/stats-card";
import { SyncButton } from "@/components/admin/sync-button";

interface SyncData {
  id: number;
  startedAt: string;
  completedAt: string | null;
  status: string;
  articleCount: number | null;
  registeredCount: number | null;
  errorCount: number | null;
  warningCount: number | null;
  planEntryCount: number | null;
  deployedCount: number | null;
  summary: string | null;
}

export default function AdminDashboard() {
  const [sync, setSync] = useState<SyncData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSync = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sync");
      const data = (await res.json()) as SyncData | { status: "never_run" };
      if ("id" in data) {
        setSync(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSync();
  }, [fetchSync]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const articleCount = sync?.articleCount ?? 0;
  const planCount = sync?.planEntryCount ?? 245;
  const deployedCount = sync?.deployedCount ?? 0;
  const errorCount = sync?.errorCount ?? 0;
  const warningCount = sync?.warningCount ?? 0;
  const registeredCount = sync?.registeredCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {sync && (
            <p className="text-sm text-muted-foreground">
              Last sync:{" "}
              {sync.completedAt
                ? new Date(sync.completedAt).toLocaleString()
                : "in progress"}{" "}
              — {sync.status}
            </p>
          )}
          {!sync && (
            <p className="text-sm text-muted-foreground">
              No sync has been run yet. Click Sync Now.
            </p>
          )}
        </div>
        <SyncButton onSyncComplete={() => void fetchSync()} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Deployed Articles"
          value={`${articleCount}`}
          subtitle={`${registeredCount} registered in posts.ts`}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Plan Coverage"
          value={`${deployedCount} / ${planCount}`}
          subtitle={`${planCount > 0 ? Math.round((deployedCount / planCount) * 100) : 0}% deployed`}
          icon={Map}
          variant={deployedCount === planCount ? "success" : "default"}
        />
        <StatsCard
          title="Errors"
          value={errorCount}
          subtitle="Across all articles"
          icon={XCircle}
          variant={errorCount > 0 ? "error" : "success"}
        />
        <StatsCard
          title="Warnings"
          value={warningCount}
          subtitle="Across all articles"
          icon={AlertTriangle}
          variant={warningCount > 0 ? "warning" : "success"}
        />
      </div>

      {sync?.summary && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Sync Summary
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{sync.summary}</p>
        </div>
      )}
    </div>
  );
}
