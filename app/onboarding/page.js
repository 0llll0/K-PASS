'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';
import RegionSelector from '@/components/RegionSelector';
import PrimaryButton from '@/components/PrimaryButton';
import { USER_TYPES } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';
import { upsertProfile } from '@/lib/database';

const STEPS = [
  { title: 'Select Language', subtitle: 'Choose your preferred language' },
  { title: 'Select Region', subtitle: 'Where do you live in Korea?' },
  { title: 'Who are you?', subtitle: 'Tell us about yourself' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('en');
  const [region, setRegion] = useState('pohang-buk');
  const [userType, setUserType] = useState('foreign-worker');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    // Last step — save profile to Supabase
    setSaving(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      if (user) {
        await upsertProfile({
          id: user.id,
          preferred_language: language,
          region,
          user_type: userType,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Not logged in — persist locally as fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('kpass_language', language);
          localStorage.setItem('kpass_region', region);
          localStorage.setItem('kpass_usertype', userType);
        }
      }
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="app-container min-h-screen bg-[#f5f6fa] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100">
        <button
          id="btn-back"
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 active:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 text-[#1a2b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-medium">Step {step + 1} of {STEPS.length}</p>
          <h1 className="text-base font-bold text-[#1a2b4a]">{STEPS[step].title}</h1>
        </div>
        {/* K-Pass logo */}
        <div className="w-7 h-7 bg-[#1a2b4a] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-black">K</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-[#1a2b4a] transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <p className="text-sm text-gray-500 mb-5">{STEPS[step].subtitle}</p>

        {step === 0 && (
          <LanguageSelector selected={language} onChange={setLanguage} />
        )}

        {step === 1 && (
          <RegionSelector selected={region} onChange={setRegion} />
        )}

        {step === 2 && (
          <div className="space-y-2">
            {USER_TYPES.map((type) => (
              <button
                key={type.code}
                id={`usertype-${type.code}`}
                onClick={() => setUserType(type.code)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left ${
                  userType === type.code
                    ? 'border-[#1a2b4a] bg-[#eef1f8]'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-xl">
                  {type.code === 'foreign-worker' ? '👷' : type.code === 'international-student' ? '🎓' : '🏠'}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${userType === type.code ? 'text-[#1a2b4a]' : 'text-gray-700'}`}>
                    {type.label}
                  </p>
                </div>
                {userType === type.code && (
                  <div className="w-5 h-5 rounded-full bg-[#1a2b4a] flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-4 pb-8 pt-4 bg-white border-t border-gray-100">
        <PrimaryButton
          id={isLastStep ? 'btn-get-started' : 'btn-next-step'}
          onClick={handleNext}
          disabled={saving}
        >
          {saving ? 'Saving…' : isLastStep ? '🚀 Get Started' : 'Continue →'}
        </PrimaryButton>
      </div>
    </div>
  );
}
