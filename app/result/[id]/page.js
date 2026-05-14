'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import UrgencyBadge from '@/components/UrgencyBadge';
import ActionStepCard from '@/components/ActionStepCard';
import PlaceCard from '@/components/PlaceCard';
import PrimaryButton from '@/components/PrimaryButton';
import AuthGate from '@/components/AuthGate';
import { MOCK_ANALYSIS_RESULT } from '@/lib/mockData';
import { getAnalysisResultById, createReminder, getReminders } from '@/lib/database';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

export default function ResultPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <AuthGate>
      <ResultContent id={id} />
    </AuthGate>
  );
}

function ResultContent({ id }) {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showKorean, setShowKorean] = useState(false);
  const [reminderSaved, setReminderSaved] = useState(false);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [userLang, setUserLang] = useState('en');

  useEffect(() => {
    // Determine user language
    (async () => {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        if (profile?.preferred_language) {
          setUserLang(profile.preferred_language);
        }
      } else {
        const local = localStorage.getItem('kpass_language');
        if (local) setUserLang(local);
      }
    })();
  }, []);

  useEffect(() => {
    if (!id || id === 'demo-result') {
      setResult(MOCK_ANALYSIS_RESULT);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnalysisResultById(id);
        if (!cancelled) {
          if (data) {
            setResult(data);
            const user = await getCurrentUser();
            if (user) {
              const reminders = await getReminders(user.id);
              const exists = reminders.some(r => r.result_id === id);
              setReminderSaved(exists);
            }
          } else {
            setResult(MOCK_ANALYSIS_RESULT);
          }
        }
      } catch (err) {
        if (!cancelled) setResult(MOCK_ANALYSIS_RESULT);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const toggleStep = (index) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSaveReminder = async () => {
    if (!result || reminderSaved) return;
    setReminderSaving(true);
    try {
      const user = await getCurrentUser();
      await createReminder({
        user_id: user?.id || null,
        title: result.document_type,
        document_type: result.document_type,
        deadline: result.deadline,
        amount: result.amount,
        status: result.urgency === 'urgent' ? 'urgent' : 'upcoming',
        result_id: id,
        created_at: new Date().toISOString(),
      });
      setReminderSaved(true);
    } catch (err) {
      setReminderSaved(true);
    } finally {
      setReminderSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <Header title="Analysis Result" subtitle="..." showBack />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-[#3b6fd4] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  if (!result) return null;

  // Localized Labels
  const labels = {
    amountDue: { ko: '납부 금액', en: 'Amount Due', vi: 'Số tiền phải nộp', zh: '应缴金额', id: 'Jumlah Jatuh Tempo' },
    deadline: { ko: '납부 기한', en: 'Deadline', vi: 'Hạn chót', zh: '截止日期', id: 'Tenggat Waktu' },
    needsConfirmation: { ko: '확인 필요', en: 'Needs confirmation', vi: 'Cần xác nhận', zh: '需要确认', id: 'Perlu konfirmasi' },
    summary: { ko: '내용 요약', en: 'Summary', vi: 'Tóm tắt', zh: '摘要', id: 'Ringkasan' },
    actionSteps: { ko: '행동 단계', en: 'Action Steps', vi: 'Các bước thực hiện', zh: '执行步骤', id: 'Langkah Tindakan' },
    nearbyHelp: { ko: '관련 기관 안내', en: 'Nearby Help', vi: 'Hỗ trợ gần đây', zh: '附近协助', id: 'Bantuan Terdekat' },
    originalImage: { ko: '원본 이미지', en: 'Original Image', vi: 'Ảnh gốc', zh: '原始图像', id: 'Gambar Asli' },
    saveReminder: { ko: '알림 설정', en: 'Save Reminder', vi: 'Lưu nhắc nhở', zh: '保存提醒', id: 'Simpan Pengingat' },
    reminderSaved: { ko: '알림 저장됨', en: 'Reminder Saved!', vi: 'Đã lưu nhắc nhở!', zh: '提醒已保存！', id: 'Pengingat Disimpan!' },
    backHome: { ko: '홈으로', en: 'Back to Home', vi: 'Quay lại Trang chủ', zh: '返回首页', id: 'Kembali ke Beranda' },
    showOriginal: { ko: '원본 한국어 보기', en: 'Show original Korean', vi: 'Xem tiếng Hàn gốc', zh: '显示韩语原文', id: 'Tampilkan bahasa Korea asli' },
    hideOriginal: { ko: '숨기기', en: 'Hide', vi: 'Ẩn', zh: '隐藏', id: 'Sembunyikan' }
  };

  const getLabel = (key) => labels[key]?.[userLang] || labels[key]?.en;

  // Dynamic Risk Title
  const isVisaRisk = (result.risk_if_ignored || '').toLowerCase().match(/visa|immigration|외국인|출입국|체류/);
  const riskTitles = {
    fine: { ko: '중요 납부 안내', en: 'Payment Risk Notice', vi: 'Thông báo thanh toán quan trọng', zh: '重要缴费提醒', id: 'Pemberitahuan Pembayaran Penting' },
    visa: { ko: '비자/체류 중요 안내', en: 'Important Visa Notice', vi: 'Thông báo thị thực quan trọng', zh: '重要签证提醒', id: 'Pemberitahuan Visa Penting' }
  };
  const currentRiskTitle = (isVisaRisk ? riskTitles.visa[userLang] : riskTitles.fine[userLang]) || (isVisaRisk ? riskTitles.visa.en : riskTitles.fine.en);

  const formattedDeadline = result.deadline ? new Date(result.deadline).toLocaleDateString(userLang === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : getLabel('needsConfirmation');

  const processedTime = new Date(result.processed_at || result.created_at || Date.now()).toLocaleString(userLang === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <AppShell>
      <Header title="Result" subtitle={`Processed ${processedTime}`} showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Main info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <UrgencyBadge urgency={result.urgency} />
              <h2 className="text-lg font-bold text-[#1a2b4a] mt-2 leading-tight break-words">{result.document_type}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{result.issuer}</p>
            </div>
            <div className="w-12 h-12 bg-[#eef1f8] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📄</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{getLabel('amountDue')}</p>
              <p className="text-sm font-bold text-red-600 break-words mt-0.5">{result.amount || getLabel('needsConfirmation')}</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">{getLabel('deadline')}</p>
              <p className="text-sm font-bold text-orange-600 mt-0.5">{formattedDeadline}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-[#1a2b4a] mb-2">{getLabel('summary')}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{result.translated_summary}</p>
          <button
            onClick={() => setShowKorean(!showKorean)}
            className="mt-3 text-xs text-[#3b6fd4] font-semibold flex items-center gap-1"
          >
            {showKorean ? `▲ ${getLabel('hideOriginal')}` : `▼ ${getLabel('showOriginal')}`}
          </button>
          {showKorean && (
            <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed font-medium" lang="ko">{result.simple_korean_summary}</p>
            </div>
          )}
        </div>

        {/* Action Steps */}
        {Array.isArray(result.action_steps) && result.action_steps.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#1a2b4a] mb-3">{getLabel('actionSteps')}</h3>
            <div className="space-y-2">
              {result.action_steps.map((step, i) => (
                <ActionStepCard
                  key={i}
                  step={step}
                  index={i}
                  completed={completedSteps.includes(i)}
                  onToggle={() => toggleStep(i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Risk warning */}
        {result.risk_if_ignored && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg mt-0.5">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-red-700 mb-1">{currentRiskTitle}</h3>
                <p className="text-xs text-red-600 leading-relaxed whitespace-pre-wrap">{result.risk_if_ignored}</p>
              </div>
            </div>
          </div>
        )}

        {/* Local context */}
        {result.local_context && (
          <div className="bg-[#eef1f8] border border-[#d8e2f3] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📍</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#1a2b4a] mb-1">{result.local_heading || 'Verified Guidance'}</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{result.local_context}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Place */}
        <div>
          <h3 className="text-sm font-bold text-[#1a2b4a] mb-3">{getLabel('nearbyHelp')}</h3>
          {result.nearby_place ? (
            <PlaceCard place={result.nearby_place} />
          ) : (
            <p className="text-xs text-gray-400 italic px-2">{getLabel('needsConfirmation')}</p>
          )}
        </div>

        {/* Original Image */}
        {result.image_url && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-bold text-[#1a2b4a] mb-3">{getLabel('originalImage')}</h3>
            <div className="aspect-[3/4] relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              <img src={result.image_url} alt="Original" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2 pb-8">
          <PrimaryButton
            onClick={handleSaveReminder}
            disabled={reminderSaving || reminderSaved}
            variant={reminderSaved ? 'success' : 'primary'}
          >
            {reminderSaving ? '...' : reminderSaved ? getLabel('reminderSaved') : getLabel('saveReminder')}
          </PrimaryButton>
          <PrimaryButton onClick={() => router.push('/')} variant="secondary">
            {getLabel('backHome')}
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}
