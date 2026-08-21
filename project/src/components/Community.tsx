import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  Mic,
  Plus,
  Shield,
  ThumbsUp,
  TriangleAlert,
  Volume2,
  X,
} from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import {
  CORRECTION_REASONS,
  DAILY_MISSIONS,
  MOCK_BALANCE,
  MOCK_QUESTIONS,
  QA_CATEGORIES,
  bountyRange,
  categoryLabel,
  formatUsdFromPoints,
  splitBounty,
  suggestedBounty,
  type CorrectionReason,
  type CorrectionSegment,
  type QaAnswer,
  type QaCategory,
  type QaQuestion,
} from '@/lib/community-qa';

type Props = {
  uiLang: UiLang;
  onBack: () => void;
};

type SortMode = 'newest' | 'bounty' | 'unanswered';

export default function Community({ uiLang, onBack }: Props) {
  const [questions, setQuestions] = useState<QaQuestion[]>(MOCK_QUESTIONS);
  const [balance, setBalance] = useState(MOCK_BALANCE);
  const [category, setCategory] = useState<QaCategory | 'all'>('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selected = questions.find((q) => q.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    let list = [...questions];
    if (category !== 'all') list = list.filter((q) => q.category === category);
    if (sort === 'bounty') list.sort((a, b) => b.bountyPoints - a.bountyPoints);
    else if (sort === 'unanswered') list.sort((a, b) => a.answerCount - b.answerCount);
    return list;
  }, [questions, category, sort]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }

  function handleAsk(payload: {
    category: QaCategory;
    title: string;
    body: string;
    bounty: number;
  }) {
    if (payload.bounty > balance) {
      showToast(t('community', 'insufficientPoints', uiLang));
      return;
    }
    const q: QaQuestion = {
      id: `q-${Date.now()}`,
      askerName: uiLang === 'KR' ? '나' : 'You',
      askerId: 'me',
      isMine: true,
      category: payload.category,
      level: 'beginner',
      purpose: 'daily',
      title: { KR: payload.title, EN: payload.title },
      body: { KR: payload.body, EN: payload.body },
      languagePair: 'ko-en',
      bountyPoints: payload.bounty,
      status: 'open',
      answerCount: 0,
      createdAtLabel: { KR: '방금', EN: 'Just now' },
      answers: [],
    };
    setBalance((b) => b - payload.bounty);
    setQuestions((prev) => [q, ...prev]);
    setAskOpen(false);
    setSelectedId(q.id);
    showToast(t('community', 'askPosted', uiLang).replace('{n}', String(payload.bounty)));
  }

  function handleAnswer(questionId: string, answer: QaAnswer) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          answers: [...q.answers, answer],
          answerCount: q.answerCount + 1,
          status: q.status === 'adopted' ? q.status : 'answered',
        };
      }),
    );
    showToast(t('community', 'answerPosted', uiLang));
  }

  function handleAdopt(questionId: string, answerId: string) {
    const q = questions.find((item) => item.id === questionId);
    if (!q || !q.isMine || q.status === 'adopted') return;
    const answer = q.answers.find((a) => a.id === answerId);
    if (!answer) return;
    const sorted = [...q.answers].sort((a, b) => b.likeCount - a.likeCount);
    const runnerUp = sorted.find((a) => a.id !== answerId && a.likeCount > 0);
    const split = splitBounty(q.bountyPoints, {
      verifiedTutor: answer.isVerifiedTutor,
      runnerUpLikes: Boolean(runnerUp),
    });
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === questionId
          ? { ...item, status: 'adopted' as const, adoptedAnswerId: answerId }
          : item,
      ),
    );
    showToast(
      t('community', 'adoptSuccess', uiLang)
        .replace('{name}', answer.authorName)
        .replace('{n}', String(split.totalToAdopter)),
    );
  }

  function handleLike(questionId: string, answerId: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          answers: q.answers.map((a) => {
            if (a.id !== answerId) return a;
            if (a.likedByMe) return a;
            return { ...a, likedByMe: true, likeCount: a.likeCount + 1 };
          }),
        };
      }),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('community', 'back', uiLang)}
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            {t('community', 'eyebrow', uiLang)}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink-900">
            {t('community', 'headingQa', uiLang)}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
            {t('community', 'subQa', uiLang)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink-800">
            <Coins className="h-4 w-4 text-primary-600" />
            {balance.toLocaleString()}p
            <span className="font-normal text-ink-500">
              ≈ ${formatUsdFromPoints(balance)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setAskOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            {t('community', 'askCta', uiLang)}
          </button>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800">
        <Shield className="h-3.5 w-3.5" />
        {t('community', 'safetyBadge', uiLang)}
      </div>

      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
        <div className="flex gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-bold text-rose-950">
              {t('community', 'policyTitle', uiLang)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-rose-900/90">
              {t('community', 'policyBody', uiLang)}
            </p>
            <a
              href="#/safety"
              className="mt-2 inline-block text-xs font-semibold text-rose-800 underline-offset-2 hover:underline"
            >
              {t('community', 'policyLink', uiLang)}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={category === 'all'}
              onClick={() => setCategory('all')}
              label={t('community', 'filterAll', uiLang)}
            />
            {QA_CATEGORIES.map((c) => (
              <FilterChip
                key={c.id}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
                label={c.label[uiLang]}
              />
            ))}
          </div>

          <div className="mt-4 flex gap-2 text-xs">
            {(
              [
                ['newest', 'sortNewest'],
                ['bounty', 'sortBounty'],
                ['unanswered', 'sortUnanswered'],
              ] as const
            ).map(([id, key]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSort(id)}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  sort === id
                    ? 'bg-ink-900 text-white'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {t('community', key, uiLang)}
              </button>
            ))}
          </div>

          <ul className="mt-6 space-y-3">
            {filtered.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(q.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                    selectedId === q.id
                      ? 'border-primary-300 bg-primary-50/40'
                      : 'border-ink-100 bg-white hover:border-ink-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                      {q.bountyPoints}p
                    </span>
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                      {categoryLabel(q.category, uiLang)}
                    </span>
                    <StatusPill status={q.status} uiLang={uiLang} />
                    {q.voiceSeconds ? (
                      <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                        <Mic className="h-3 w-3" />
                        {q.voiceSeconds}s
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 font-display text-base font-bold text-ink-900">
                    {q.title[uiLang]}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-600">{q.body[uiLang]}</p>
                  <p className="mt-2 text-xs text-ink-400">
                    {q.askerName} · {q.createdAtLabel[uiLang]} · {q.answerCount}{' '}
                    {t('community', 'answers', uiLang)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <section>
            <h2 className="font-display text-lg font-bold text-ink-900">
              {t('community', 'missionsTitle', uiLang)}
            </h2>
            <p className="mt-1 text-xs text-ink-500">{t('community', 'missionsSub', uiLang)}</p>
            <ul className="mt-3 space-y-2">
              {DAILY_MISSIONS.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 border-b border-ink-100 py-2.5 last:border-0"
                >
                  <span className={`text-sm ${m.done ? 'text-ink-400 line-through' : 'text-ink-800'}`}>
                    {m.title[uiLang]}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-primary-700">
                    +{m.rewardPoints}p
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <h2 className="text-sm font-bold text-ink-900">
              {t('community', 'economyTitle', uiLang)}
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-ink-600">
              <li>{t('community', 'economy1', uiLang)}</li>
              <li>{t('community', 'economy2', uiLang)}</li>
              <li>{t('community', 'economy3', uiLang)}</li>
              <li>{t('community', 'economy4', uiLang)}</li>
            </ul>
          </section>
        </aside>
      </div>

      {selected && (
        <QuestionDetail
          uiLang={uiLang}
          question={selected}
          onClose={() => setSelectedId(null)}
          onAnswer={handleAnswer}
          onAdopt={handleAdopt}
          onLike={handleLike}
        />
      )}

      {askOpen && (
        <AskModal
          uiLang={uiLang}
          balance={balance}
          onClose={() => setAskOpen(false)}
          onSubmit={handleAsk}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-white shadow-lift">
          {toast}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
      }`}
    >
      {label}
    </button>
  );
}

function StatusPill({
  status,
  uiLang,
}: {
  status: QaQuestion['status'];
  uiLang: UiLang;
}) {
  const map = {
    open: { key: 'statusOpen' as const, className: 'bg-sky-50 text-sky-800' },
    answered: { key: 'statusAnswered' as const, className: 'bg-violet-50 text-violet-800' },
    adopted: { key: 'statusAdopted' as const, className: 'bg-emerald-50 text-emerald-800' },
  };
  const s = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {t('community', s.key, uiLang)}
    </span>
  );
}

function QuestionDetail({
  uiLang,
  question,
  onClose,
  onAnswer,
  onAdopt,
  onLike,
}: {
  uiLang: UiLang;
  question: QaQuestion;
  onClose: () => void;
  onAnswer: (questionId: string, answer: QaAnswer) => void;
  onAdopt: (questionId: string, answerId: string) => void;
  onLike: (questionId: string, answerId: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                {question.bountyPoints}p
              </span>
              <StatusPill status={question.status} uiLang={uiLang} />
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-ink-900">
              {question.title[uiLang]}
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              {question.askerName} · {categoryLabel(question.category, uiLang)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-500 hover:bg-ink-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <p className="text-sm leading-relaxed text-ink-700">{question.body[uiLang]}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600"
              >
                {t('community', 'inlineTranslate', uiLang)}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600"
              >
                <Volume2 className="h-3.5 w-3.5" />
                TTS
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink-900">
              {t('community', 'answers', uiLang)} ({question.answers.length})
            </h3>
            <ul className="mt-3 space-y-4">
              {question.answers.map((a) => {
                const adopted = question.adoptedAnswerId === a.id;
                return (
                  <li
                    key={a.id}
                    className={`rounded-2xl border p-4 ${
                      adopted ? 'border-emerald-300 bg-emerald-50/40' : 'border-ink-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink-900">{a.authorName}</span>
                      {a.isVerifiedTutor && (
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-800">
                          Verified
                        </span>
                      )}
                      {adopted && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t('community', 'adoptedBadge', uiLang)}
                        </span>
                      )}
                    </div>

                    {a.corrections.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {a.corrections.map((c) => (
                          <div key={c.id} className="rounded-xl bg-ink-50 px-3 py-2 text-sm">
                            <p className="text-ink-400 line-through">{c.originalText}</p>
                            <p className="mt-0.5 font-medium text-emerald-800">{c.correctedText}</p>
                            <p className="mt-1 text-[11px] text-ink-500">
                              {CORRECTION_REASONS.find((r) => r.id === c.reason)?.label[uiLang]}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {a.body && <p className="mt-2 text-sm text-ink-700">{a.body}</p>}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLike(question.id, a.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {a.likeCount}
                      </button>
                      {a.voiceSeconds ? (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                          <Mic className="h-3 w-3" />
                          {a.voiceSeconds}s
                        </span>
                      ) : null}
                      {question.isMine && question.status !== 'adopted' && (
                        <button
                          type="button"
                          onClick={() => onAdopt(question.id, a.id)}
                          className="ml-auto rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          {t('community', 'adoptCta', uiLang)}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
              {question.answers.length === 0 && (
                <p className="text-sm text-ink-500">{t('community', 'noAnswers', uiLang)}</p>
              )}
            </ul>
          </div>

          {!question.isMine && question.status !== 'adopted' && (
            <div>
              {!replyOpen ? (
                <button
                  type="button"
                  onClick={() => setReplyOpen(true)}
                  className="w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  {t('community', 'writeAnswer', uiLang)}
                </button>
              ) : (
                <AnswerComposer
                  uiLang={uiLang}
                  sourceText={question.body[uiLang]}
                  onCancel={() => setReplyOpen(false)}
                  onSubmit={(payload) => {
                    onAnswer(question.id, {
                      id: `a-${Date.now()}`,
                      authorName: uiLang === 'KR' ? '나' : 'You',
                      authorId: 'me',
                      isVerifiedTutor: false,
                      body: payload.body,
                      corrections: payload.corrections,
                      likeCount: 0,
                      createdAtLabel: { KR: '방금', EN: 'Just now' },
                    });
                    setReplyOpen(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AskModal({
  uiLang,
  balance,
  onClose,
  onSubmit,
}: {
  uiLang: UiLang;
  balance: number;
  onClose: () => void;
  onSubmit: (p: { category: QaCategory; title: string; body: string; bounty: number }) => void;
}) {
  const [cat, setCat] = useState<QaCategory>('grammar');
  const range = bountyRange(cat);
  const [bounty, setBounty] = useState(suggestedBounty('grammar'));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const split = splitBounty(bounty, { verifiedTutor: false, runnerUpLikes: false });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {t('community', 'askTitle', uiLang)}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-100">
            <X className="h-5 w-5 text-ink-500" />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-600">{t('community', 'askGuide', uiLang)}</p>

        <label className="mt-5 block text-xs font-semibold text-ink-700">
          {t('community', 'category', uiLang)}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {QA_CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={cat === c.id}
              label={c.label[uiLang]}
              onClick={() => {
                setCat(c.id);
                setBounty(c.bounty[1]);
              }}
            />
          ))}
        </div>

        <label className="mt-4 block text-xs font-semibold text-ink-700">
          {t('community', 'titleLabel', uiLang)}
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-primary-400"
          placeholder={t('community', 'titlePlaceholder', uiLang)}
        />

        <label className="mt-4 block text-xs font-semibold text-ink-700">
          {t('community', 'bodyLabel', uiLang)}
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-primary-400"
          placeholder={t('community', 'bodyPlaceholder', uiLang)}
        />

        <label className="mt-4 block text-xs font-semibold text-ink-700">
          {t('community', 'bountyLabel', uiLang)} ({range[0]}–{range[2]}p)
        </label>
        <input
          type="range"
          min={range[0]}
          max={range[2]}
          step={10}
          value={bounty}
          onChange={(e) => setBounty(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <p className="mt-1 text-sm font-semibold text-ink-800">
          {bounty}p · {t('community', 'bountyHint', uiLang).replace('{n}', String(split.adopter))}
        </p>
        <p className="text-xs text-ink-500">
          {t('community', 'balanceLabel', uiLang)}: {balance.toLocaleString()}p
        </p>

        <button
          type="button"
          disabled={!title.trim() || !body.trim()}
          onClick={() =>
            onSubmit({ category: cat, title: title.trim(), body: body.trim(), bounty })
          }
          className="mt-6 w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-40"
        >
          {t('community', 'postQuestion', uiLang)}
        </button>
      </div>
    </div>
  );
}

function AnswerComposer({
  uiLang,
  sourceText,
  onCancel,
  onSubmit,
}: {
  uiLang: UiLang;
  sourceText: string;
  onCancel: () => void;
  onSubmit: (p: { body: string; corrections: CorrectionSegment[] }) => void;
}) {
  const [body, setBody] = useState('');
  const [original, setOriginal] = useState(sourceText.slice(0, 80));
  const [corrected, setCorrected] = useState('');
  const [reason, setReason] = useState<CorrectionReason>('grammar');
  const [segments, setSegments] = useState<CorrectionSegment[]>([]);

  function addSegment() {
    if (!original.trim() || !corrected.trim()) return;
    setSegments((prev) => [
      ...prev,
      {
        id: `seg-${Date.now()}`,
        originalText: original.trim(),
        correctedText: corrected.trim(),
        reason,
      },
    ]);
    setCorrected('');
  }

  return (
    <div className="rounded-2xl border border-ink-200 p-4">
      <h4 className="text-sm font-bold text-ink-900">{t('community', 'correctionTool', uiLang)}</h4>
      <p className="mt-1 text-xs text-ink-500">{t('community', 'correctionHint', uiLang)}</p>

      <label className="mt-3 block text-xs font-semibold text-ink-600">
        {t('community', 'originalLabel', uiLang)}
      </label>
      <input
        value={original}
        onChange={(e) => setOriginal(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink-200 px-2.5 py-2 text-sm"
      />
      <label className="mt-2 block text-xs font-semibold text-ink-600">
        {t('community', 'correctedLabel', uiLang)}
      </label>
      <input
        value={corrected}
        onChange={(e) => setCorrected(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink-200 px-2.5 py-2 text-sm"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CORRECTION_REASONS.map((r) => (
          <FilterChip
            key={r.id}
            active={reason === r.id}
            label={r.label[uiLang]}
            onClick={() => setReason(r.id)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addSegment}
        className="mt-2 text-xs font-semibold text-primary-700 hover:underline"
      >
        + {t('community', 'addCorrection', uiLang)}
      </button>

      {segments.length > 0 && (
        <ul className="mt-3 space-y-2">
          {segments.map((s) => (
            <li key={s.id} className="rounded-lg bg-ink-50 px-2.5 py-2 text-xs">
              <span className="text-ink-400 line-through">{s.originalText}</span>
              <span className="mx-1 text-ink-300">→</span>
              <span className="font-medium text-emerald-800">{s.correctedText}</span>
            </li>
          ))}
        </ul>
      )}

      <label className="mt-3 block text-xs font-semibold text-ink-600">
        {t('community', 'explainLabel', uiLang)}
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-ink-200 px-2.5 py-2 text-sm"
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-ink-200 py-2 text-sm font-medium text-ink-600"
        >
          {t('community', 'cancel', uiLang)}
        </button>
        <button
          type="button"
          onClick={() => onSubmit({ body: body.trim(), corrections: segments })}
          className="flex-1 rounded-full bg-primary-600 py-2 text-sm font-semibold text-white"
        >
          {t('community', 'submitAnswer', uiLang)}
        </button>
      </div>
    </div>
  );
}
