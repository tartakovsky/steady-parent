"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface KitTagRow {
  id: number;
  kitId: number;
  name: string;
  subscriberCount: number;
  configName: string | null;
}

export default function KitTagsPage() {
  const [tags, setTags] = useState<KitTagRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/kit")
      .then((r) => r.json() as Promise<KitTagRow[]>)
      .then((rows) => {
        setTags(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const mapped = tags.filter((t) => t.configName != null);
  const orphaned = tags.filter((t) => t.configName == null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kit Tags ({tags.length})</h1>
        <p className="text-sm text-muted-foreground">
          {mapped.length} mapped to config, {orphaned.length} orphaned
        </p>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Tag Name</th>
              <th className="px-3 py-2 text-left font-medium">Kit ID</th>
              <th className="px-3 py-2 text-left font-medium">Config Key</th>
              <th className="px-3 py-2 text-right font-medium">Subscribers</th>
              <th className="px-3 py-2 text-center font-medium">Mapped</th>
            </tr>
          </thead>
          <tbody>
            {tags
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((tag) => (
                <tr
                  key={tag.id}
                  className={`border-b ${tag.configName == null ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}
                >
                  <td className="px-3 py-1.5 font-medium">{tag.name}</td>
                  <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                    {tag.kitId}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-xs">
                    {tag.configName ?? (
                      <span className="text-amber-600">orphaned</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right">{tag.subscriberCount}</td>
                  <td className="px-3 py-1.5 text-center">
                    {tag.configName != null ? (
                      <Check className="mx-auto h-4 w-4 text-emerald-600" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-amber-500" />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
