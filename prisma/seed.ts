import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const passwordHash = await hash("ChangeMe123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@canalnoalvo.com" },
    update: {},
    create: {
      name: "NoAlvo Admin",
      email: "admin@canalnoalvo.com",
      passwordHash,
      role: "SUPER_ADMIN"
    }
  });

  await prisma.category.upsert({
    where: { slug: "comunicados" },
    update: {},
    create: { name: "Comunicados", slug: "comunicados" }
  });

  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: {
        name: "NoAlvo Platform",
        domain: "https://canalnoalvo.com",
        youtubeChannelId: "",
        newsletterDoubleOptIn: true
      }
    }
  });

  console.log("Seed complete", { adminId: admin.id });
}

main().finally(() => prisma.$disconnect());
