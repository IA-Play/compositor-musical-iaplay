import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  preferences: z.array(z.string()).default([])
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, email, preferences } = parsed.data;
  const subscriber = await prisma.subscriber.upsert({
    where: { email },
    update: { name },
    create: { name, email }
  });

  await Promise.all(
    preferences.map((topic) =>
      prisma.subscriberPreference.upsert({
        where: { subscriberId_topic: { subscriberId: subscriber.id, topic } },
        update: { enabled: true },
        create: { subscriberId: subscriber.id, topic, enabled: true }
      })
    )
  );

  return NextResponse.json({ ok: true, id: subscriber.id });
}
