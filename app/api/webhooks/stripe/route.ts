import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const signature = headers().get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const event = await req.json();
  return NextResponse.json({ received: true, type: event.type });
}
