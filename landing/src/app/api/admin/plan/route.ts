import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { linkPlanEntries } from "@/lib/db/schema";

export async function GET() {
  const rows = await db.select().from(linkPlanEntries);
  return NextResponse.json(rows);
}
