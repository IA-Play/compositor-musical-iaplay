import { prisma } from "@/lib/prisma";
import { fetchYoutubeUploads } from "@/lib/integrations/youtube";

export async function runYoutubeSync() {
  const payload = await fetchYoutubeUploads();
  const items = payload.items ?? [];

  for (const item of items) {
    const youtubeId = item.id.videoId as string;
    await prisma.video.upsert({
      where: { youtubeId },
      update: {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.high?.url ?? "",
        publishedAt: new Date(item.snippet.publishedAt)
      },
      create: {
        youtubeId,
        slug: youtubeId,
        type: "VIDEO",
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.high?.url ?? "",
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        publishedAt: new Date(item.snippet.publishedAt),
        status: "published",
        tags: []
      }
    });
  }

  return { imported: items.length };
}
