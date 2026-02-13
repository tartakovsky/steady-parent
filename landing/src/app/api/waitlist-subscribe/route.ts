import { NextRequest, NextResponse } from "next/server";
import { subscribeWithTags } from "@/lib/kit-api";
import { freebieConfig } from "@/lib/kit-config";

const VALID_CATEGORIES = new Set(
  Object.keys(freebieConfig)
    .filter((k) => k.startsWith("waitlist/"))
    .map((k) => k.replace("waitlist/", "")),
);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      category?: string;
      timezone?: string;
    };

    const { email, category, timezone } = body;

    if (!email || !category) {
      return NextResponse.json(
        { error: "Missing required fields: email, category" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 },
      );
    }

    const slug = `waitlist/${category}`;

    const fields: Record<string, string> = {};
    if (timezone) fields["timezone"] = timezone;

    const { subscriberId } = await subscribeWithTags(email, slug, fields);

    return NextResponse.json({ success: true, subscriberId });
  } catch (err) {
    console.error("Waitlist subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 },
    );
  }
}
