import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("hub.verify_token") !== process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }
  return new Response(searchParams.get("hub.challenge") ?? "", { status: 200 });
}

export async function POST() {
  return NextResponse.json({ received: true });
}
