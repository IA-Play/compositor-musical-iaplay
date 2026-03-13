import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Fluxo de doação iniciado. Integrar Stripe Payment Element." });
}
