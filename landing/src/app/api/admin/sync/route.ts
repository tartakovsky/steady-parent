import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { syncs } from "@/lib/db/schema";
import { runFullSync } from "@/lib/admin/sync-orchestrator";

export async function POST() {
  try {
    const summary = await runFullSync();
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const latest = await db
    .select()
    .from(syncs)
    .orderBy(desc(syncs.id))
    .limit(1);

  if (latest.length === 0) {
    return NextResponse.json({ status: "never_run" });
  }

  return NextResponse.json(latest[0]);
}
