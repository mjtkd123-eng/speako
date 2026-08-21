import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentStatement } from "@/lib/statement-pdf";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TUTOR") {
    return NextResponse.json({ error: "튜터만 다운로드할 수 있습니다." }, { status: 403 });
  }

  const tutor = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!tutor) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const rows = await prisma.purchase.findMany({
    where: { course: { tutorId: tutor.id }, hasAccess: true },
    include: { course: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  const bytes = await buildPaymentStatement({
    tutorName: tutor.name ?? "Tutor",
    tutorEmail: tutor.email ?? "",
    rows,
  });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="speako-payment-statement.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
