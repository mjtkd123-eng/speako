import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PopularTutors from '@/components/PopularTutors';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Faq from '@/components/Faq';
import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';
import BuyPointsModal from '@/components/BuyPointsModal';
import TutorPayout from '@/components/TutorPayout';
import VideoCall from '@/components/VideoCall';
import TutorApply from '@/components/TutorApply';
import TutorGuide from '@/components/TutorGuide';
import Community from '@/components/Community';
import SafetyGuide from '@/components/SafetyGuide';
import FaqPage from '@/components/FaqPage';
import RefundPolicy from '@/components/RefundPolicy';
import TutorAttendancePolicy from '@/components/TutorAttendancePolicy';
import TutorGuideAckModal from '@/components/TutorGuideAckModal';
import BecomeTutorModal from '@/components/BecomeTutorModal';
import AdminLayout, { type AdminPage } from '@/components/admin/AdminLayout';
import AdminGate from '@/components/AdminGate';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminTutors from '@/components/admin/AdminTutors';
import AdminStudents from '@/components/admin/AdminStudents';
import AdminPayments from '@/components/admin/AdminPayments';
import { WalletProvider } from '@/lib/wallet-context';
import { VideoProvider, useVideo } from '@/lib/video-context';
import { AuthProvider } from '@/lib/auth-context';
import { CookieConsentProvider } from '@/hooks/useCookieConsent';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import type { UiLang } from '@/i18n';
import { verifyAdminPassword, clearAdminPassword } from '@/lib/admin-api';
import {
  TUTOR_GUIDE_HASH,
  TUTOR_ONBOARDING_HASH,
} from '@/lib/tutor-onboarding';

type Route =
  | 'home'
  | 'tutor-payout'
  | 'video-call'
  | 'admin'
  | 'tutor-onboarding'
  | 'tutor-guide'
  | 'community'
  | 'safety'
  | 'faq'
  | 'refund'
  | 'tutor-attendance'
  | 'auth-callback';

function getRouteFromHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'tutor/payout') return 'tutor-payout';
  if (hash === 'video-call') return 'video-call';
  if (hash === 'tutor/onboarding' || hash.startsWith('tutor/onboarding')) return 'tutor-onboarding';
  if (hash === 'tutor/guide' || hash.startsWith('tutor/guide')) return 'tutor-guide';
  if (hash === 'community' || hash.startsWith('community')) return 'community';
  if (hash === 'safety' || hash.startsWith('safety')) return 'safety';
  if (hash === 'faq' || hash.startsWith('faq')) return 'faq';
  if (hash === 'refund' || hash.startsWith('refund')) return 'refund';
  if (hash === 'tutor-attendance' || hash.startsWith('tutor-attendance')) return 'tutor-attendance';
  if (hash === 'auth/callback' || hash.startsWith('auth/callback')) return 'auth-callback';
  if (hash === 'admin' || hash.startsWith('admin/')) return 'admin';
  return 'home';
}

function getAdminPageFromHash(): AdminPage {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'admin/tutors') return 'tutors';
  if (hash === 'admin/students') return 'students';
  if (hash === 'admin/payments') return 'payments';
  return 'dashboard';
}

export default function App() {
  return (
    <AuthProvider>
      <CookieConsentProvider>
        <AppInner />
      </CookieConsentProvider>
    </AuthProvider>
  );
}

function AppInner() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [uiLang, setUiLang] = useState<UiLang>('KR');
  const [route, setRoute] = useState<Route>(getRouteFromHash());
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPage, setAdminPage] = useState<AdminPage>(getAdminPageFromHash());
  const [gateOpen, setGateOpen] = useState(false);
  const [guideAckOpen, setGuideAckOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      const newRoute = getRouteFromHash();
      setRoute(newRoute);
      if (newRoute === 'admin') {
        setAdminPage(getAdminPageFromHash());
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Auth gate for onboarding is deferred until publish; during development
  // open the tutor application form directly without the signup modal.

  const navigateToPayout = () => {
    window.location.hash = '#/tutor/payout';
  };

  const navigateToVideoCall = () => {
    window.location.hash = '#/video-call';
  };

  const navigateToHome = useCallback(() => {
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToGuide = () => {
    window.location.hash = TUTOR_GUIDE_HASH;
  };

  const openTutorApply = () => {
    window.location.hash = TUTOR_ONBOARDING_HASH;
  };

  const handleBecomeTutor = () => {
    setGuideAckOpen(true);
  };

  const handleGuideAckContinue = () => {
    setGuideAckOpen(false);
    openTutorApply();
  };

  const handleNavBecomeTutor = () => {
    const scrollToCta = () => {
      document.getElementById('become-tutor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (route !== 'home') {
      window.location.hash = 'become-tutor';
      window.setTimeout(scrollToCta, 80);
      return;
    }

    if (window.location.hash.replace(/^#\/?/, '') !== 'become-tutor') {
      window.location.hash = 'become-tutor';
    }
    scrollToCta();
  };

  const navigateToAdmin = (page: AdminPage) => {
    const hash = page === 'dashboard' ? '#/admin' : `#/admin/${page}`;
    window.location.hash = hash;
  };

  const handleAdminToggle = () => {
    if (!adminMode) {
      setGateOpen(true);
    } else {
      clearAdminPassword();
      setAdminMode(false);
    }
  };

  const handleGateSubmit = async (password: string): Promise<boolean> => {
    const ok = await verifyAdminPassword(password);
    if (ok) {
      setAdminMode(true);
      setGateOpen(false);
      return true;
    }
    return false;
  };

  const navigateBackToSite = () => {
    clearAdminPassword();
    setAdminMode(false);
    window.location.hash = '';
  };

  if (route === 'auth-callback') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-ink-600">
          {uiLang === 'KR' ? '로그인 처리 중...' : 'Finishing sign-in...'}
        </p>
      </div>
    );
  }

  if (route === 'admin') {
    if (!adminMode) return null;

    return (
      <AdminLayout
        uiLang={uiLang}
        activePage={adminPage}
        onNavigate={navigateToAdmin}
        adminMode={adminMode}
        onToggleAdmin={handleAdminToggle}
        onBackToSite={navigateBackToSite}
      >
        {adminPage === 'dashboard' && <AdminDashboard uiLang={uiLang} />}
        {adminPage === 'tutors' && <AdminTutors uiLang={uiLang} />}
        {adminPage === 'students' && <AdminStudents uiLang={uiLang} />}
        {adminPage === 'payments' && <AdminPayments uiLang={uiLang} />}
      </AdminLayout>
    );
  }

  return (
    <WalletProvider>
      <VideoProvider>
        <div className="min-h-screen bg-white">
          <Navbar
            selectedLang={selectedLang}
            onSelectLang={setSelectedLang}
            uiLang={uiLang}
            onUiLangChange={setUiLang}
            onBuyPoints={() => setBuyModalOpen(true)}
            onNavigatePayout={navigateToPayout}
            onBecomeTutor={handleNavBecomeTutor}
            adminMode={adminMode}
            onToggleAdmin={handleAdminToggle}
            onNavigateAdmin={() => navigateToAdmin('dashboard')}
          />

          {route === 'tutor-payout' ? (
            <TutorPayout uiLang={uiLang} onBack={navigateToHome} />
          ) : route === 'video-call' ? (
            <VideoCallPage uiLang={uiLang} onBack={navigateToHome} />
          ) : route === 'tutor-guide' ? (
            <TutorGuide
              uiLang={uiLang}
              onBack={navigateToHome}
              onApply={handleBecomeTutor}
            />
          ) : route === 'community' ? (
            <Community uiLang={uiLang} onBack={navigateToHome} />
          ) : route === 'safety' ? (
            <SafetyGuide
              uiLang={uiLang}
              onBack={navigateToHome}
              onContactSupport={() => {
                window.location.href = 'mailto:support@speako.app';
              }}
              onReport={() => {
                window.location.hash = '/safety#report';
                window.alert(
                  uiLang === 'KR'
                    ? '신고가 접수되면 운영팀이 검토합니다. (데모: 신고 폼은 곧 연결됩니다)'
                    : 'Reports are reviewed by Trust & Safety. (Demo: report form coming soon)',
                );
              }}
            />
          ) : route === 'faq' ? (
            <FaqPage uiLang={uiLang} onBack={navigateToHome} />
          ) : route === 'refund' ? (
            <RefundPolicy uiLang={uiLang} onBack={navigateToHome} />
          ) : route === 'tutor-attendance' ? (
            <TutorAttendancePolicy uiLang={uiLang} onBack={navigateToHome} />
          ) : (
            <main>
              <Hero selectedLang={selectedLang} onSelectLang={setSelectedLang} uiLang={uiLang} />
              <PopularTutors uiLang={uiLang} onJoinLesson={navigateToVideoCall} />
              <Features uiLang={uiLang} />
              <HowItWorks uiLang={uiLang} />
              <Testimonials uiLang={uiLang} />
              <CtaBanner
                uiLang={uiLang}
                onApply={handleBecomeTutor}
                onGuide={navigateToGuide}
              />
              <Faq uiLang={uiLang} />
            </main>
          )}

          {route === 'tutor-onboarding' && (
            <TutorApply
              uiLang={uiLang}
              onClose={() => {
                window.location.hash = '';
              }}
            />
          )}

          {/* Signup/login modal: kept for publish later — disabled during development */}
          <BecomeTutorModal
            uiLang={uiLang}
            open={false}
            onClose={() => {}}
          />

          <Footer uiLang={uiLang} />

          <CookieConsentBanner />

          <BuyPointsModal open={buyModalOpen} onClose={() => setBuyModalOpen(false)} uiLang={uiLang} />

          {gateOpen && (
            <AdminGate
              uiLang={uiLang}
              onSubmit={handleGateSubmit}
              onClose={() => setGateOpen(false)}
            />
          )}

          <TutorGuideAckModal
            uiLang={uiLang}
            open={guideAckOpen}
            onClose={() => setGuideAckOpen(false)}
            onContinue={handleGuideAckContinue}
          />
        </div>
      </VideoProvider>
    </WalletProvider>
  );
}

function VideoCallPage({ uiLang, onBack }: { uiLang: UiLang; onBack: () => void }) {
  const { joinRoom, status } = useVideo();

  useEffect(() => {
    if (status === 'idle') {
      joinRoom(null, 'Student');
    }
  }, [joinRoom, status]);

  return (
    <div className="container-page mx-auto max-w-4xl py-8">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-ink-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">
          {uiLang === 'KR' ? '화상 수업' : 'Video Lesson'}
        </h1>
      </div>
      <VideoCall uiLang={uiLang} onLeave={onBack} />
    </div>
  );
}
