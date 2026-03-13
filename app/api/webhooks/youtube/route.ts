import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");
  return new Response(challenge ?? "ok", { status: 200 });
}

export async function POST() {
  return NextResponse.json({ queued: true });
}
