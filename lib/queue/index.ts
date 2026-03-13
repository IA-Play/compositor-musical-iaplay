import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });

export const queues = {
  youtubeSync: new Queue("youtube-sync", { connection }),
  transcriptIngestion: new Queue("transcript-ingestion", { connection }),
  notifications: new Queue("notifications", { connection }),
  whatsapp: new Queue("whatsapp", { connection }),
  analytics: new Queue("analytics", { connection })
};
