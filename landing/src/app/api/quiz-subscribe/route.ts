import { NextRequest, NextResponse } from "next/server";
import {
  subscribeWithTags,
  removeTagFromSubscriber,
  addTagToSubscriber,
} from "@/lib/kit-api";
import { kitTags } from "@/lib/kit-config";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      quizSlug?: string;
      resultUrl?: string;
      fromGate?: boolean;
      timezone?: string;
    };

    const { email, quizSlug, resultUrl, fromGate, timezone } = body;

    if (!email || !quizSlug || !resultUrl) {
      return NextResponse.json(
        { error: "Missing required fields: email, quizSlug, resultUrl" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const slug = `quiz/${quizSlug}`;

    // Build custom fields
    const fields: Record<string, string> = { quiz_result_url: resultUrl };
    if (timezone) fields["timezone"] = timezone;

    // Step 1: Create/update subscriber + apply quiz-specific tags + set custom fields
    const { subscriberId } = await subscribeWithTags(email, slug, fields);

    // Step 2: If user went through the email gate, trigger the results email
    // by removing then re-adding quiz-completed tag (forces Kit automation)
    if (fromGate) {
      const quizCompletedTagId = kitTags["quiz-completed"];
      if (quizCompletedTagId) {
        await removeTagFromSubscriber(subscriberId, quizCompletedTagId);
        await addTagToSubscriber(email, quizCompletedTagId);
      }
    }

    return NextResponse.json({ success: true, subscriberId });
  } catch (err) {
    console.error("Quiz subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 },
    );
  }
}
