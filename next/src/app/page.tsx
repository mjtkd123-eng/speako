import Link from "next/link";

const TUTORS = [
  { name: "Emma Wilson", lang: "영어 · 미국", price: "$21", trial: "$9", blurb: "비즈니스 영어와 IELTS 밀착 코칭" },
  { name: "Haruto Tanaka", lang: "일본어 · 일본", price: "$18", trial: "$7", blurb: "JLPT 레벨 맞춤 커리큘럼" },
  { name: "Sofia García", lang: "스페인어 · 스페인", price: "$16", trial: "$7", blurb: "DELE 대비와 실생활 회화" },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-semibold text-brand-700">30,000+ 튜터가 온라인 대기 중</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              원어민 튜터와 함께하는
              <br />
              <span className="text-brand-700">1:1 맞춤형 언어 학습</span>
            </h1>
            <p className="mt-4 max-w-lg text-ink-600">
              전 세계 검증된 튜터와 내 수준·목표·예산에 맞춘 수업. 언제 어디서나 화상으로 시작하세요.
            </p>
            <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-ink-100 bg-white p-3 shadow-lg sm:flex-row sm:items-center">
              <select
                className="h-12 flex-1 rounded-2xl border border-ink-200 px-3 text-sm"
                defaultValue="en"
              >
                <option value="en">영어</option>
                <option value="ja">일본어</option>
                <option value="es">스페인어</option>
                <option value="ko">한국어</option>
              </select>
              <select className="h-12 flex-1 rounded-2xl border border-ink-200 px-3 text-sm" defaultValue="all">
                <option value="all">가격 전체</option>
                <option value="low">$15 이하</option>
                <option value="mid">$15~22</option>
              </select>
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700"
              >
                튜터 찾기
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-400">4.9/5 평균 평점 · 150+ 지원 언어 · 트라이얼 수업으로 시작</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-500">지금 2,340개 수업이 열려 있어요</p>
            <p className="mt-1 font-display text-2xl font-extrabold">실시간 1:1 수업</p>
            <p className="mt-2 text-sm text-ink-600">예약하면 브라우저에서 바로 화상 수업이 시작됩니다.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold">이번 주 추천 튜터</h2>
            <p className="text-sm text-ink-500">학습자 평점이 높은 원어민 튜터입니다.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {TUTORS.map((tutor) => (
            <article key={tutor.name} className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
              <h3 className="font-display text-lg font-bold">{tutor.name}</h3>
              <p className="text-sm text-ink-500">{tutor.lang}</p>
              <p className="mt-2 text-sm text-ink-600">{tutor.blurb}</p>
              <p className="mt-4 text-sm">
                트라이얼 <span className="font-bold text-brand-700">{tutor.trial}</span>
                <span className="ml-2 text-ink-400">정가 {tutor.price}/회</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold">VOD · 전자책 스토어</h2>
            <p className="mt-1 text-sm text-ink-500">수업 외에 영상과 PDF를 결제하고 바로 볼 수 있습니다.</p>
          </div>
          <Link
            href="/courses"
            className="inline-flex h-12 items-center rounded-2xl bg-ink-900 px-6 font-bold text-white hover:bg-ink-800"
          >
            콘텐츠 페이지로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}
