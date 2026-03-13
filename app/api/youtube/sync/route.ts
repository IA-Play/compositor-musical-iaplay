import { NextResponse } from "next/server";
import { runYoutubeSync } from "@/lib/jobs/youtube-sync";

export async function POST() {
  try {
    const result = await runYoutubeSync();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
