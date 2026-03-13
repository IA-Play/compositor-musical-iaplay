import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q) return NextResponse.json([]);

  const segments = await prisma.transcriptSegment.findMany({
    where: { searchableText: { contains: q.toLowerCase() } },
    take: 30,
    include: { transcript: { include: { video: true } } }
  });

  const results = segments.map((s) => ({
    videoTitle: s.transcript.video.title,
    snippet: s.text,
    second: s.startSeconds,
    url: `${s.transcript.video.url}&t=${s.startSeconds}s`
  }));

  return NextResponse.json(results);
}
