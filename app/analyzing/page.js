'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { label: 'Reading the Korean document…', delay: 0 },
  { label: 'Checking Pohang-si Buk-gu local rules…', delay: 700 },
  { label: 'Creating simple action steps…', delay: 1400 },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('[Analyzing] Starting analysis animation');
    
    // Animate steps
    STEPS.forEach((step, i) => {
      setTimeout(() => setActiveStep(i), step.delay);
    });

    // Progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 40);

    // Navigate after 2 seconds (normal flow)
    const timer = setTimeout(() => {
      console.log('[Analyzing] Normal navigation to result');
      router.push('/result/demo-result');
    }, 2500);

    // Safety timeout (5 seconds)
    const safetyTimer = setTimeout(() => {
      console.log('[Analyzing] Safety timeout triggered');
      router.push('/result/demo-result');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, [router]);

  return (
    <div className="app-container min-h-screen bg-[#f5f6fa] flex flex-col items-center justify-center px-4">
      {/* AI visual */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer rings */}
        <div className="absolute w-48 h-48 rounded-full border-2 border-[#1a2b4a]/10 animate-pulse-ring" />
        <div className="absolute w-36 h-36 rounded-full border-2 border-[#3b6fd4]/20 animate-pulse-ring" style={{ animationDelay: '0.3s' }} />

        {/* Inner spinning circle */}
        <div
          className="w-24 h-24 rounded-full border-4 border-[#eef1f8] border-t-[#1a2b4a] animate-spin-slow"
          style={{ borderTopWidth: 4, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 1 }}
        />

        {/* Center icon */}
        <div className="absolute w-14 h-14 bg-[#1a2b4a] rounded-full flex items-center justify-center shadow-xl">
          <span className="text-2xl">🤖</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-[#1a2b4a]">Analyzing Document</h2>
          <p className="text-sm text-gray-400 mt-1">AI is reading your Korean notice…</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-5">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  i < activeStep
                    ? 'bg-green-500'
                    : i === activeStep
                    ? 'bg-[#1a2b4a] animate-pulse'
                    : 'bg-gray-100'
                }`}
              >
                {i < activeStep ? (
                  <span className="text-white text-xs">✓</span>
                ) : i === activeStep ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </div>
              <p
                className={`text-sm transition-all duration-300 ${
                  i <= activeStep ? 'text-[#1a2b4a] font-medium' : 'text-gray-300'
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1a2b4a] to-[#3b6fd4] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{progress}%</p>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        🔒 Your document is processed securely
      </p>
    </div>
  );
}
