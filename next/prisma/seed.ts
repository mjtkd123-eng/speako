import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "node:path";
import { ensureSampleEbook } from "../src/lib/sample-ebook";
import { calcNetPayout, calcPgFee } from "../src/lib/portone";

const prisma = new PrismaClient();
const VOD = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

async function main() {
  const passwordHash = await bcrypt.hash("speako1234", 10);

  const tutor = await prisma.user.upsert({
    where: { email: "tutor@speako.one" },
    update: { role: "TUTOR", passwordHash },
    create: {
      email: "tutor@speako.one",
      name: "Alex Kim",
      phone: "010-1000-1000",
      passwordHash,
      role: "TUTOR",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@speako.one" },
    update: { role: "USER", passwordHash },
    create: {
      email: "student@speako.one",
      name: "민지",
      phone: "010-2000-2000",
      passwordHash,
      role: "USER",
    },
  });

  const ebookPron = "content/ebooks/pronunciation.pdf";
  const ebookBiz = "content/ebooks/business-email.pdf";
  const ebookToeic = "content/ebooks/toeic-speaking.pdf";
  await ensureSampleEbook(path.join(process.cwd(), ebookPron), "English Pronunciation Master");
  await ensureSampleEbook(path.join(process.cwd(), ebookBiz), "Business English Email");
  await ensureSampleEbook(path.join(process.cwd(), ebookToeic), "TOEIC Speaking Pack");

  await prisma.purchase.deleteMany();
  await prisma.course.deleteMany({ where: { tutorId: tutor.id } });

  const pronunciation = await prisma.course.create({
    data: {
      slug: "english-pronunciation",
      title: "영어 발음 마스터",
      subtitle: "원어민처럼 들리는 입 모양과 리듬",
      description:
        "모음·자음·연음을 영상으로 따라 하고, PDF 워크북으로 복습합니다.\n패키지 구매 시 VOD와 전자책이 모두 열립니다.",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      tutorId: tutor.id,
      hasVod: true,
      hasEbook: true,
      vodPrice: 49000,
      ebookPrice: 19000,
      packagePrice: 59000,
      vodUrl: VOD,
      ebookPath: ebookPron,
    },
  });

  await prisma.course.create({
    data: {
      slug: "business-email",
      title: "비즈니스 영어 이메일",
      subtitle: "바로 쓰는 템플릿 전자책",
      description: "거절·요청·팔로업 메일 템플릿과 실전 첨삭 포인트를 담은 PDF입니다.",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      tutorId: tutor.id,
      hasVod: false,
      hasEbook: true,
      vodPrice: 0,
      ebookPrice: 15000,
      packagePrice: 0,
      ebookPath: ebookBiz,
    },
  });

  await prisma.course.create({
    data: {
      slug: "interview-english",
      title: "면접 영어 실전",
      subtitle: "STAR 답변을 영상으로 연습",
      description: "자주 나오는 면접 질문 20개를 영상 시연과 함께 연습합니다.",
      thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      tutorId: tutor.id,
      hasVod: true,
      hasEbook: false,
      vodPrice: 39000,
      ebookPrice: 0,
      packagePrice: 0,
      vodUrl: VOD,
    },
  });

  await prisma.course.create({
    data: {
      slug: "toeic-speaking-pack",
      title: "토익 스피킹 패키지",
      subtitle: "파트별 영상 + 스크립트 전자책",
      description: "VOD 강의와 스크립트 PDF를 묶은 할인 패키지입니다.",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      tutorId: tutor.id,
      hasVod: true,
      hasEbook: true,
      vodPrice: 55000,
      ebookPrice: 22000,
      packagePrice: 68000,
      vodUrl: VOD,
      ebookPath: ebookToeic,
    },
  });

  const samples = [
    { option: "PACKAGE" as const, gross: pronunciation.packagePrice, intl: false, brand: "visa", country: "KR" },
    { option: "VOD" as const, gross: 39000, intl: true, brand: "mastercard", country: "US" },
    { option: "EBOOK" as const, gross: 15000, intl: false, brand: "visa", country: "KR" },
  ];

  for (const sample of samples) {
    const pgFee = calcPgFee(sample.gross);
    await prisma.purchase.create({
      data: {
        userId: student.id,
        courseId: pronunciation.id,
        option: sample.option,
        hasAccess: true,
        amountGross: sample.gross,
        platformFee: 0,
        stripeFee: pgFee,
        netPayout: calcNetPayout(sample.gross, pgFee, 0),
        internationalCard: sample.intl,
        cardBrand: sample.brand,
        cardCountry: sample.country,
        status: "PAID",
        vodProgress: sample.option === "EBOOK" ? 0 : 42,
      },
    });
  }

  console.log("Seeded tutor@speako.one / student@speako.one (password: speako1234)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
