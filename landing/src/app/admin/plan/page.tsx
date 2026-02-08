"use client";

import { useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";

interface PlanRow {
  id: number;
  articleTitle: string;
  url: string;
  categorySlug: string;
  isDeployed: boolean;
  deployedSlug: string | null;
}

export default function PlanPage() {
  const [entries, setEntries] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deployed" | "pending">("all");

  useEffect(() => {
    fetch("/api/admin/plan")
      .then((r) => r.json() as Promise<PlanRow[]>)
      .then((rows) => {
        setEntries(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const deployed = entries.filter((e) => e.isDeployed);
  const pending = entries.filter((e) => !e.isDeployed);

  // Group by category
  const categories = new Map<string, { total: number; deployed: number }>();
  for (const entry of entries) {
    const cat = categories.get(entry.categorySlug) ?? { total: 0, deployed: 0 };
    cat.total++;
    if (entry.isDeployed) cat.deployed++;
    categories.set(entry.categorySlug, cat);
  }

  const filtered =
    filter === "all"
      ? entries
      : filter === "deployed"
        ? deployed
        : pending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plan vs Reality</h1>
        <p className="text-sm text-muted-foreground">
          {deployed.length} / {entries.length} articles deployed (
          {entries.length > 0
            ? Math.round((deployed.length / entries.length) * 100)
            : 0}
          %)
        </p>
      </div>

      {/* Category summary */}
      <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {[...categories.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([cat, counts]) => (
            <div
              key={cat}
              className={`rounded border p-2 text-center text-sm ${
                counts.deployed === counts.total
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                  : ""
              }`}
            >
              <div className="font-medium">{cat}</div>
              <div className="text-xs text-muted-foreground">
                {counts.deployed}/{counts.total}
              </div>
            </div>
          ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "deployed", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all"
              ? `All (${entries.length})`
              : f === "deployed"
                ? `Deployed (${deployed.length})`
                : `Pending (${pending.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-10 px-3 py-2 text-center font-medium">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-left font-medium">URL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b hover:bg-muted/30">
                <td className="px-3 py-1.5 text-center">
                  {entry.isDeployed ? (
                    <Check className="mx-auto h-4 w-4 text-emerald-600" />
                  ) : (
                    <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                  )}
                </td>
                <td className="px-3 py-1.5">
                  {entry.isDeployed && entry.deployedSlug ? (
                    <a
                      href={`/admin/articles/${entry.deployedSlug}`}
                      className="text-primary hover:underline"
                    >
                      {entry.articleTitle}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      {entry.articleTitle}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {entry.categorySlug}
                  </span>
                </td>
                <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  {entry.url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
