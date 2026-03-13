export interface YoutubeVideoPayload {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export async function fetchYoutubeUploads() {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!key || !channelId) throw new Error("YouTube credentials missing");

  const base = "https://www.googleapis.com/youtube/v3/search";
  const url = `${base}?part=snippet&channelId=${channelId}&maxResults=25&order=date&type=video&key=${key}`;

  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) throw new Error(`YouTube API error ${response.status}`);
  return response.json();
}
