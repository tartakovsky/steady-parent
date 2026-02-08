import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";

export async function GET() {
  const rows = await db.select().from(articles);
  return NextResponse.json(rows);
}
