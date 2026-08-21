import { useEffect, useRef, useState } from 'react';
import {
  X,
  Upload,
  FileVideo,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Briefcase,
  Video,
  Send,
  BadgeCheck,
  Users,
} from 'lucide-react';
import { LANGUAGES } from '@/data';
import { t, type UiLang } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { TutorType } from '@/lib/tutor-onboarding';
import { clearTutorApplyIntent } from '@/lib/tutor-onboarding';

type Props = {
  uiLang: UiLang;
  onClose: () => void;
};

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_DOC_SIZE = 20 * 1024 * 1024;
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function TutorApply({ uiLang, onClose }: Props) {
  const { user } = useAuth();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teachesLang, setTeachesLang] = useState('');
  const [nativeLang, setNativeLang] = useState('');
  const [origin, setOrigin] = useState('');
  const [rate, setRate] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [tutorType, setTutorType] = useState<TutorType | ''>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata ?? {};
    if (!name && (meta.full_name || meta.name)) {
      setName(String(meta.full_name || meta.name));
    }
    if (!email && user.email) setEmail(user.email);
  }, [user, name, email]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !uploading) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, submitting, uploading]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('apply', 'required', uiLang);
    if (!email.trim()) {
      errs.email = t('apply', 'required', uiLang);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = t('apply', 'invalidEmail', uiLang);
    }
    if (!teachesLang) errs.teachesLang = t('apply', 'required', uiLang);
    if (!nativeLang) errs.nativeLang = t('apply', 'required', uiLang);
    if (!origin.trim()) errs.origin = t('apply', 'required', uiLang);
    if (!rate.trim()) {
      errs.rate = t('apply', 'required', uiLang);
    } else if (Number.isNaN(Number(rate)) || Number(rate) <= 0) {
      errs.rate = t('apply', 'invalidRate', uiLang);
    }
    if (!bio.trim()) errs.bio = t('apply', 'required', uiLang);
    if (!tutorType) errs.tutorType = t('apply', 'required', uiLang);
    if (!videoFile) errs.video = t('apply', 'videoRequired', uiLang);
    if (tutorType === 'professional' && !credentialFile) {
      errs.credential = t('apply', 'credentialRequired', uiLang);
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (!VIDEO_TYPES.includes(file.type)) {
      setError(t('apply', 'videoWrongFormat', uiLang));
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setError(t('apply', 'videoTooLarge', uiLang));
      return;
    }
    setVideoFile(file);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.video;
      return next;
    });
  }

  function handleCredentialChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (!DOC_TYPES.includes(file.type)) {
      setError(t('apply', 'credentialWrongFormat', uiLang));
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      setError(t('apply', 'credentialTooLarge', uiLang));
      return;
    }
    setCredentialFile(file);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.credential;
      return next;
    });
  }

  async function uploadToBucket(
    bucket: string,
    file: File,
    prefix: string,
  ): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { data, error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadErr) {
      setError(t('apply', 'uploadError', uiLang));
      return null;
    }
    return data.path;
  }

  async function handleSubmit() {
    setError('');
    if (!validate()) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setUploading(true);
    const videoPath = await uploadToBucket('tutor-intro-videos', videoFile!, 'intro');
    if (!videoPath) {
      setUploading(false);
      return;
    }

    let credentialPath: string | null = null;
    if (credentialFile) {
      credentialPath = await uploadToBucket('tutor-credentials', credentialFile, 'cred');
      if (!credentialPath) {
        setUploading(false);
        return;
      }
    }
    setUploading(false);

    setSubmitting(true);
    const { error: insertErr } = await supabase.from('tutor_applications').insert({
      applicant_name: name.trim(),
      email: email.trim(),
      teaches_language: teachesLang,
      native_language: nativeLang,
      origin: origin.trim(),
      hourly_rate: Number(rate),
      bio: bio.trim(),
      experience_years: parseInt(experienceYears) || 0,
      video_url: null,
      video_path: videoPath,
      tutor_type: tutorType,
      credential_path: credentialPath,
      user_id: user?.id ?? null,
      status: 'pending',
    });

    setSubmitting(false);

    if (insertErr) {
      setError(t('apply', 'submitError', uiLang));
      return;
    }

    clearTutorApplyIntent();
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white animate-fade-up">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-brand-500 text-white">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-extrabold text-ink-900 sm:text-xl">
              {t('apply', 'heading', uiLang)}
            </h1>
            <p className="hidden text-xs text-ink-500 sm:block">{t('apply', 'sub', uiLang)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={submitting || uploading}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
          {submitted ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
                <CheckCircle2 className="h-10 w-10 text-success-600" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-extrabold text-ink-900">
                {t('apply', 'submitSuccess', uiLang)}
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-600">{t('apply', 'pendingHint', uiLang)}</p>
              <button
                onClick={onClose}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-700 active:scale-[0.98]"
              >
                {t('apply', 'backToHome', uiLang)}
              </button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-ink-500 sm:hidden">{t('apply', 'sub', uiLang)}</p>

              <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
                {/* Tutor type */}
                <div className="border-b border-ink-100 px-6 py-7 sm:px-8">
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                      <BadgeCheck className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink-900">
                      {t('apply', 'tutorTypeTitle', uiLang)}
                    </h3>
                  </div>
                  <p className="mb-4 text-sm text-ink-500">{t('apply', 'tutorTypeHint', uiLang)}</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <TutorTypeOption
                      selected={tutorType === 'professional'}
                      onSelect={() => setTutorType('professional')}
                      icon={BadgeCheck}
                      title={t('apply', 'typeProfessional', uiLang)}
                      desc={t('apply', 'typeProfessionalDesc', uiLang)}
                    />
                    <TutorTypeOption
                      selected={tutorType === 'community'}
                      onSelect={() => setTutorType('community')}
                      icon={Users}
                      title={t('apply', 'typeCommunity', uiLang)}
                      desc={t('apply', 'typeCommunityDesc', uiLang)}
                    />
                  </div>
                  {fieldErrors.tutorType && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-error-600">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.tutorType}
                    </p>
                  )}
                </div>

                {/* Basic info */}
                <div className="border-b border-ink-100 px-6 py-7 sm:px-8">
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                      <User className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink-900">
                      {t('apply', 'step1', uiLang)}
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t('apply', 'fullName', uiLang)} error={fieldErrors.name}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-base"
                        placeholder={t('apply', 'fullName', uiLang)}
                      />
                    </Field>

                    <Field label={t('apply', 'email', uiLang)} error={fieldErrors.email}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-base"
                        placeholder="you@example.com"
                      />
                    </Field>

                    <Field label={t('apply', 'teachesLanguage', uiLang)} error={fieldErrors.teachesLang}>
                      <LanguageSelect
                        value={teachesLang}
                        onChange={setTeachesLang}
                        placeholder={t('apply', 'selectLanguage', uiLang)}
                        uiLang={uiLang}
                      />
                    </Field>

                    <Field label={t('apply', 'nativeLanguage', uiLang)} error={fieldErrors.nativeLang}>
                      <LanguageSelect
                        value={nativeLang}
                        onChange={setNativeLang}
                        placeholder={t('apply', 'selectLanguage', uiLang)}
                        uiLang={uiLang}
                      />
                    </Field>

                    <Field label={t('apply', 'origin', uiLang)} error={fieldErrors.origin}>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="input-base"
                        placeholder={t('apply', 'originPlaceholder', uiLang)}
                      />
                    </Field>

                    <Field label={t('apply', 'rate', uiLang)} error={fieldErrors.rate}>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-400">
                          $
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          className="input-base pl-7"
                          placeholder={t('apply', 'ratePlaceholder', uiLang)}
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Profile */}
                <div className="border-b border-ink-100 px-6 py-7 sm:px-8">
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink-900">
                      {t('apply', 'step2', uiLang)}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <Field label={t('apply', 'experienceYears', uiLang)}>
                      <input
                        type="number"
                        min="0"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="input-base w-32"
                        placeholder="0"
                      />
                    </Field>

                    <Field label={t('apply', 'bio', uiLang)} error={fieldErrors.bio}>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="input-base resize-none"
                        placeholder={t('apply', 'bioPlaceholder', uiLang)}
                      />
                    </Field>
                  </div>
                </div>

                {/* Intro video — required for all */}
                <div className="border-b border-ink-100 px-6 py-7 sm:px-8">
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                      <Video className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink-900">
                      {t('apply', 'step3', uiLang)}
                      <span className="ml-2 text-sm font-semibold text-error-600">*</span>
                    </h3>
                  </div>

                  <p className="mb-4 text-sm text-ink-500">{t('apply', 'videoHint', uiLang)}</p>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoChange}
                    className="hidden"
                  />

                  {!videoFile ? (
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 px-6 py-10 text-ink-500 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                    >
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-semibold">{t('apply', 'selectFile', uiLang)}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-ink-50 p-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                        <FileVideo className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-800">{videoFile.name}</p>
                        <p className="text-xs text-ink-500">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="shrink-0 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-100"
                      >
                        {t('apply', 'changeFile', uiLang)}
                      </button>
                    </div>
                  )}
                  {fieldErrors.video && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-error-600">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.video}
                    </p>
                  )}

                  {videoPreviewUrl && (
                    <div className="mt-3 overflow-hidden rounded-xl bg-ink-900">
                      <video src={videoPreviewUrl} controls className="w-full" />
                    </div>
                  )}
                </div>

                {/* Credentials — required for professional */}
                <div className="px-6 py-7 sm:px-8">
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                      <FileText className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink-900">
                      {t('apply', 'step4', uiLang)}
                      {tutorType === 'professional' && (
                        <span className="ml-2 text-sm font-semibold text-error-600">*</span>
                      )}
                    </h3>
                  </div>

                  <p className="mb-4 text-sm text-ink-500">
                    {tutorType === 'professional'
                      ? t('apply', 'credentialHintRequired', uiLang)
                      : t('apply', 'credentialHintOptional', uiLang)}
                  </p>

                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,application/pdf,image/*"
                    onChange={handleCredentialChange}
                    className="hidden"
                    disabled={tutorType === ''}
                  />

                  <div
                    className={
                      tutorType === ''
                        ? 'pointer-events-none opacity-45'
                        : ''
                    }
                  >
                    {!credentialFile ? (
                      <button
                        type="button"
                        onClick={() => docInputRef.current?.click()}
                        disabled={tutorType === ''}
                        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 px-6 py-8 text-ink-500 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed"
                      >
                        <Upload className="h-7 w-7" />
                        <span className="text-sm font-semibold">
                          {t('apply', 'selectCredential', uiLang)}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-ink-50 p-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                          <FileText className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-800">
                            {credentialFile.name}
                          </p>
                          <p className="text-xs text-ink-500">
                            {(credentialFile.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => docInputRef.current?.click()}
                          className="shrink-0 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-100"
                        >
                          {t('apply', 'changeFile', uiLang)}
                        </button>
                      </div>
                    )}
                  </div>
                  {fieldErrors.credential && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-error-600">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.credential}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!submitted && (
        <div className="border-t border-ink-100 bg-white/90 px-5 py-4 backdrop-blur-lg sm:px-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <button
              onClick={onClose}
              disabled={submitting || uploading}
              className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40"
            >
              {t('apply', 'backToHome', uiLang)}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploading ? t('apply', 'uploading', uiLang) : t('apply', 'submitting', uiLang)}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('apply', 'submit', uiLang)}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TutorTypeOption({
  selected,
  onSelect,
  icon: Icon,
  title,
  desc,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: typeof BadgeCheck;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
          : 'border-ink-200 bg-white hover:border-primary-200 hover:bg-primary-50/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? 'border-primary-600 bg-primary-600' : 'border-ink-300'
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary-600" />
            <p className="font-semibold text-ink-900">{title}</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">{desc}</p>
        </div>
      </div>
    </button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-error-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function LanguageSelect({
  value,
  onChange,
  placeholder,
  uiLang,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  uiLang: UiLang;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base appearance-none bg-white"
    >
      <option value="">{placeholder}</option>
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.name[uiLang]}
        </option>
      ))}
    </select>
  );
}
