export type CookieLocale = 'ko' | 'en' | 'fr' | 'de' | 'es';

export type CookieTranslation = {
  title: string;
  description: string;
  descriptionEu: string;
  acceptAll: string;
  rejectAll: string;
  customize: string;
  save: string;
  necessary: string;
  necessaryDesc: string;
  analytics: string;
  analyticsDesc: string;
  marketing: string;
  marketingDesc: string;
  settingsLink: string;
  close: string;
  alwaysOn: string;
};

export const COOKIE_TRANSLATIONS: Record<CookieLocale, CookieTranslation> = {
  ko: {
    title: '쿠키 사용 안내',
    description:
      'Speako는 사이트 운영에 필요한 필수 쿠키와, 선택적으로 분석·마케팅 쿠키를 사용할 수 있습니다. 자세한 내용은 쿠키 정책을 확인해 주세요.',
    descriptionEu:
      'EU 개인정보 보호법(GDPR)에 따라, 분석·마케팅 쿠키는 동의 후에만 사용됩니다. 원하시는 항목만 선택하거나 모두 거부할 수 있습니다.',
    acceptAll: '모두 수락',
    rejectAll: '모두 거부',
    customize: '상세 설정',
    save: '선택 저장',
    necessary: '필수 쿠키',
    necessaryDesc: '로그인·보안·기본 기능에 필요하며 끌 수 없습니다.',
    analytics: '분석 쿠키',
    analyticsDesc: '방문·이용 통계(예: Google Analytics)로 서비스를 개선합니다.',
    marketing: '마케팅 쿠키',
    marketingDesc: '맞춤형 안내와 캠페인 성과 측정에 사용됩니다.',
    settingsLink: '쿠키 설정',
    close: '닫기',
    alwaysOn: '항상 활성',
  },
  en: {
    title: 'Cookie notice',
    description:
      'Speako uses necessary cookies to run the site, and may use analytics and marketing cookies. See our cookie policy for details.',
    descriptionEu:
      'Under the GDPR, analytics and marketing cookies are used only after you consent. You can accept all, reject all, or choose categories.',
    acceptAll: 'Accept all',
    rejectAll: 'Reject all',
    customize: 'Customize',
    save: 'Save choices',
    necessary: 'Necessary',
    necessaryDesc: 'Required for security and core features. Always on.',
    analytics: 'Analytics',
    analyticsDesc: 'Helps us improve Speako with usage stats (e.g. Google Analytics).',
    marketing: 'Marketing',
    marketingDesc: 'Used for tailored messages and campaign measurement.',
    settingsLink: 'Cookie settings',
    close: 'Close',
    alwaysOn: 'Always on',
  },
  fr: {
    title: 'Avis sur les cookies',
    description:
      'Speako utilise des cookies nécessaires au fonctionnement du site et peut utiliser des cookies d’analyse et de marketing. Voir notre politique cookies.',
    descriptionEu:
      'Conformément au RGPD, les cookies d’analyse et de marketing ne sont utilisés qu’après votre consentement. Vous pouvez tout accepter, tout refuser ou personnaliser.',
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout refuser',
    customize: 'Personnaliser',
    save: 'Enregistrer',
    necessary: 'Nécessaires',
    necessaryDesc: 'Indispensables à la sécurité et aux fonctions de base. Toujours actifs.',
    analytics: 'Analytiques',
    analyticsDesc: 'Nous aident à améliorer Speako (ex. Google Analytics).',
    marketing: 'Marketing',
    marketingDesc: 'Utilisés pour des messages ciblés et la mesure des campagnes.',
    settingsLink: 'Paramètres cookies',
    close: 'Fermer',
    alwaysOn: 'Toujours actifs',
  },
  de: {
    title: 'Cookie-Hinweis',
    description:
      'Speako verwendet notwendige Cookies für den Betrieb der Website und kann Analyse- und Marketing-Cookies nutzen. Details in der Cookie-Richtlinie.',
    descriptionEu:
      'Nach der DSGVO werden Analyse- und Marketing-Cookies erst nach Ihrer Einwilligung verwendet. Sie können alle akzeptieren, ablehnen oder auswählen.',
    acceptAll: 'Alle akzeptieren',
    rejectAll: 'Alle ablehnen',
    customize: 'Einstellungen',
    save: 'Auswahl speichern',
    necessary: 'Notwendig',
    necessaryDesc: 'Erforderlich für Sicherheit und Kernfunktionen. Immer aktiv.',
    analytics: 'Analyse',
    analyticsDesc: 'Hilft uns, Speako zu verbessern (z. B. Google Analytics).',
    marketing: 'Marketing',
    marketingDesc: 'Für personalisierte Hinweise und Kampagnenmessung.',
    settingsLink: 'Cookie-Einstellungen',
    close: 'Schließen',
    alwaysOn: 'Immer aktiv',
  },
  es: {
    title: 'Aviso de cookies',
    description:
      'Speako usa cookies necesarias para el sitio y puede usar cookies de análisis y marketing. Consulta nuestra política de cookies.',
    descriptionEu:
      'Según el RGPD, las cookies de análisis y marketing solo se usan tras tu consentimiento. Puedes aceptar todo, rechazar todo o personalizar.',
    acceptAll: 'Aceptar todo',
    rejectAll: 'Rechazar todo',
    customize: 'Personalizar',
    save: 'Guardar',
    necessary: 'Necesarias',
    necessaryDesc: 'Imprescindibles para seguridad y funciones básicas. Siempre activas.',
    analytics: 'Analíticas',
    analyticsDesc: 'Nos ayudan a mejorar Speako (p. ej. Google Analytics).',
    marketing: 'Marketing',
    marketingDesc: 'Para mensajes personalizados y medición de campañas.',
    settingsLink: 'Configuración de cookies',
    close: 'Cerrar',
    alwaysOn: 'Siempre activas',
  },
};

export const SUPPORTED_COOKIE_LOCALES: CookieLocale[] = ['ko', 'en', 'fr', 'de', 'es'];
