'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import UploadBox from '@/components/UploadBox';
import PrimaryButton from '@/components/PrimaryButton';
import AuthGate from '@/components/AuthGate';
import { SUPPORTED_DOCS, MOCK_ANALYSIS_RESULT } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';
import { uploadDocumentImage } from '@/lib/storage';
import { saveAnalysisResult, getUserProfile } from '@/lib/database';

const STEPS = {
  ko: [
    "문서를 업로드하고 있어요",
    "이미지 속 한국어를 읽고 있어요",
    "고지서 종류를 확인하고 있어요",
    "공식 안내 정보를 확인하고 있어요",
    "해야 할 일을 쉽게 정리하고 있어요",
    "결과를 저장하고 있어요"
  ],
  en: [
    "Uploading your document",
    "Reading Korean text",
    "Understanding the notice type",
    "Checking official guidance",
    "Creating simple action steps",
    "Saving your result"
  ],
  vi: [
    "Đang tải tài liệu của bạn",
    "Đang đọc văn bản tiếng Hàn",
    "Đang xác định loại thông báo",
    "Đang kiểm tra hướng dẫn chính thức",
    "Đang tạo các bước hành động",
    "Đang lưu kết quả"
  ],
  zh: [
    "正在上传您的文档",
    "正在读取韩文文本",
    "正在识别通知类型",
    "正在查询官方指南",
    "正在生成操作步骤",
    "正在保存结果"
  ],
  id: [
    "Mengunggah dokumen Anda",
    "Membaca teks bahasa Korea",
    "Memahami jenis pemberitahuan",
    "Memeriksa panduan resmi",
    "Membuat langkah tindakan",
    "Menyimpan hasil Anda"
  ]
};

const MESSAGES = {
  ko: {
    longWait: "분석이 조금 오래 걸리고 있어요. 잠시만 기다려 주세요.",
    almostDone: "거의 다 됐어요. 고지서 내용을 꼼꼼히 확인하고 있어요.",
    tooLong: "분석이 오래 걸리고 있어요. 네트워크나 AI 모델이 혼잡할 수 있습니다.",
    backHome: "홈으로 돌아가기",
    analyzing: "분석 중..."
  },
  en: {
    longWait: "Analysis is taking a little longer. Please wait a moment.",
    almostDone: "Almost there. We are carefully checking the notice.",
    tooLong: "Analysis is taking longer than expected. The network or AI model may be busy.",
    backHome: "Back to Home",
    analyzing: "Analyzing..."
  },
  vi: {
    longWait: "Phân tích đang mất thêm một chút thời gian. Vui lòng chờ trong giây lát.",
    almostDone: "Sắp xong rồi. Chúng tôi đang kiểm tra kỹ thông báo.",
    tooLong: "Phân tích đang mất nhiều thời gian hơn dự kiến. Mạng hoặc mô hình AI có thể đang bận.",
    backHome: "Quay lại trang chủ",
    analyzing: "Đang phân tích..."
  },
  zh: {
    longWait: "分析时间比预期稍长。请稍等片刻。",
    almostDone: "快好了。我们正在仔细检查通知内容。",
    tooLong: "分析时间过长。网络或 AI 模型可能比较拥挤。",
    backHome: "返回首页",
    analyzing: "正在分析..."
  },
  id: {
    longWait: "Analisis memakan waktu lebih lama. Harap tunggu sebentar.",
    almostDone: "Hampir selesai. Kami sedang memeriksa pemberitahuan dengan teliti.",
    tooLong: "Analisis memakan waktu lebih lama dari yang diharapkan. Jaringan atau model AI mungkin sedang sibuk.",
    backHome: "Kembali ke Beranda",
    analyzing: "Menganalisis..."
  }
};

export default function UploadPage() {
  return (
    <AuthGate>
      <UploadContent />
    </AuthGate>
  );
}

function UploadContent() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Progress states
  const [analysisStep, setAnalysisStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [userLang, setUserLang] = useState('en');

  // Handle timer
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Determine language on mount
  useEffect(() => {
    const fetchLang = async () => {
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
    };
    fetchLang();
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (loading) return; // Prevent double click
    
    console.log('[Upload] Starting analysis');
    setLoading(true);
    setError(null);
    setAnalysisStep(0);
    
    try {
      let imageUrl = null;
      let imagePath = null;

      // 1. Upload image to Supabase Storage
      const user = await getCurrentUser();
      if (selectedFile) {
        try {
          setAnalysisStep(0); // Uploading document
          console.log('[Upload] Attempting Supabase upload...');
          const userId = user?.id || 'anonymous';
          const uploaded = await uploadDocumentImage(selectedFile, userId);
          imageUrl = uploaded.publicUrl;
          imagePath = uploaded.path;
          console.log('[Upload] Upload success:', imagePath);
          setAnalysisStep(1); // Reading Korean text
        } catch (uploadErr) {
          console.warn('[Upload] Upload failed, continuing with mock fallback:', uploadErr.message);
        }
      }

      // 2. Call /api/analyze-document
      let resultData = MOCK_ANALYSIS_RESULT;
      try {
        setAnalysisStep(2); // Understanding notice type
        console.log('[Upload] Fetching user context...');
        let userProfile = null;
        if (user) {
          userProfile = await getUserProfile(user.id);
        }

        const lang = userProfile?.preferred_language || 
                        (typeof window !== 'undefined' ? localStorage.getItem('kpass_language') : null) || 
                        'English';
        const userRegion = userProfile?.region || 
                          (typeof window !== 'undefined' ? localStorage.getItem('kpass_region') : null) || 
                          'Pohang-si Buk-gu';

        setAnalysisStep(3); // Checking official guidance
        console.log('[Upload] Calling analyze API with context:', { lang, userRegion });
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          body: JSON.stringify({
            filename: selectedFile?.name || 'sample.jpg',
            imagePath,
            imageUrl,
            user_language: lang,
            region: userRegion,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
        
        setAnalysisStep(4); // Creating simple action steps
        
        if (response.ok) {
          const { result } = await response.json();
          resultData = result;
          
          if (result.analysis_source === 'openrouter') {
            console.log('[Upload] OpenRouter analysis result received');
          } else if (result.analysis_source === 'gemini') {
            console.log('[Upload] Gemini analysis result received');
          } else {
            console.warn('[Upload] Mock fallback result received. Reason:', result.fallback_reason);
          }
        } else {
          console.warn('[Upload] API returned error, using internal mock fallback');
        }
      } catch (apiErr) {
        console.warn('[Upload] API call failed:', apiErr.message);
      }

      // 3. Save analysis result ONLY if it's from a real AI source
      let savedId = 'demo-result';
      const isRealAI = resultData.analysis_source === 'openrouter' || resultData.analysis_source === 'gemini';

      if (isRealAI) {
        try {
          setAnalysisStep(5); // Saving your result
          console.log('[Upload] AI analysis succeeded, saving to DB...');
          const { id, ...cleanResultData } = resultData;
          
          const toSave = {
            ...cleanResultData,
            user_id: user?.id || null,
            image_path: imagePath || null,
            image_url: imageUrl || null,
            processed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };

          const saved = await saveAnalysisResult(toSave);
          if (saved && saved.id) {
            savedId = saved.id;
            console.log('[Upload] Document saved with ID:', savedId);
          }
        } catch (dbErr) {
          console.warn('[Upload] Document save failed (UUID error or other):', dbErr.message);
        }
      } else {
        console.log('[Upload] AI analysis failed (using mock), skipping DB save');
      }

      // 4. Navigate to result page
      console.log('[Upload] Navigating to result:', savedId);
      router.push(`/result/${savedId}`);
    } catch (err) {
      console.warn('[Upload] Unexpected error in handleAnalyze:', err.message);
      setError(err.message);
      setTimeout(() => router.push('/result/demo-result'), 1500);
    } finally {
      // Don't set loading false immediately to keep the UI smooth during navigation
      // setLoading(false); 
    }
  };

  const handleUseSample = () => {
    console.log('[Upload] Using sample, navigating to demo-result');
    router.push('/result/demo-result');
  };

  const currentSteps = STEPS[userLang] || STEPS['en'];
  const currentMessages = MESSAGES[userLang] || MESSAGES['en'];

  return (
    <AppShell>
      <Header title="Upload Notice" subtitle="Scan or upload a document" showBack />

      <div className="px-4 py-5 space-y-5">
        {/* Upload box */}
        <UploadBox onFileSelect={handleFileSelect} preview={preview} />

        {/* Supported document types */}
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Supported Documents</p>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_DOCS.map((doc) => (
              <div
                key={doc.label}
                className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm"
              >
                <span className="text-base">{doc.icon}</span>
                <span className="text-xs font-medium text-gray-600">{doc.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-[#eef1f8] rounded-2xl p-4 border border-[#d8e2f3]">
          <p className="text-xs font-bold text-[#1a2b4a] mb-2">📸 Tips for best results</p>
          <ul className="space-y-1">
            {[
              'Lay document flat on a table',
              'Ensure all text is visible',
              'Good lighting works best',
              'Avoid blurry photos',
            ].map((tip) => (
              <li key={tip} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-[#3b6fd4]">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Analyze button */}
        <div className="space-y-3">
          <PrimaryButton
            id="btn-analyze-with-ai"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? currentMessages.analyzing : '🤖 Analyze with AI'}
          </PrimaryButton>

          {!selectedFile && !loading && (
            <PrimaryButton
              id="btn-use-sample"
              onClick={handleUseSample}
              variant="secondary"
            >
              Try with sample document
            </PrimaryButton>
          )}
        </div>

        {/* Safety text */}
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          🔒 K-Pass gives guidance, not legal advice.{'\n'}Your document is processed securely.
        </p>
      </div>

      {/* Analyzing Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 text-center">
          <div className="w-full max-w-sm space-y-8">
            {/* Animated Spinner */}
            <div className="flex justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-[#3b6fd4]/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#3b6fd4] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">🤖</span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#1a2b4a]">{currentSteps[analysisStep]}</h2>
              <div className="flex justify-center gap-1.5 mt-4">
                {currentSteps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < analysisStep ? 'w-4 bg-green-500' : 
                      i === analysisStep ? 'w-8 bg-[#3b6fd4]' : 'w-4 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Vertical Checklist */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left space-y-4">
              {currentSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    i < analysisStep ? 'bg-green-500 text-white' : 
                    i === analysisStep ? 'border-2 border-[#3b6fd4] text-[#3b6fd4] animate-pulse' : 
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {i < analysisStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    i < analysisStep ? 'text-gray-400' : 
                    i === analysisStep ? 'text-[#1a2b4a]' : 'text-gray-300'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Long Wait Messages */}
            <div className="min-h-[60px] flex flex-col items-center justify-center">
              {elapsedSeconds >= 8 && elapsedSeconds < 20 && (
                <p className="text-sm text-gray-500 animate-in fade-in slide-in-from-bottom-2">
                  {currentMessages.longWait}
                </p>
              )}
              {elapsedSeconds >= 20 && elapsedSeconds < 35 && (
                <p className="text-sm text-[#3b6fd4] font-medium animate-in fade-in slide-in-from-bottom-2">
                  {currentMessages.almostDone}
                </p>
              )}
              {elapsedSeconds >= 35 && (
                <div className="space-y-4 animate-in fade-in zoom-in">
                  <p className="text-sm text-red-500 font-medium">
                    {currentMessages.tooLong}
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-xs font-bold text-gray-500 underline underline-offset-4"
                  >
                    {currentMessages.backHome}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
