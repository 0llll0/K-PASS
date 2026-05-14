import { MOCK_ANALYSIS_RESULT } from '@/lib/mockData';
import { analyzeDocumentWithOpenRouter } from '@/lib/ai';
import { getVerifiedLocalRule, getPlaces } from '@/lib/database';

/**
 * POST /api/analyze-document
 * Analyzes a Korean administrative document image using OpenRouter.
 * Then attaches real verified local context and nearby places from Supabase.
 */
export async function POST(request) {
  console.log('[Analyze API] Request received');
  
  try {
    const body = await request.json().catch(() => ({}));
    const { imageUrl, user_language, region } = body;

    const userLang = user_language || 'English';
    const userRegion = region || 'Pohang-si Buk-gu';

    console.log('[Analyze API] context:', { imageUrl, userLang, userRegion });

    if (!imageUrl) {
      return Response.json({ 
        success: true, 
        result: { ...MOCK_ANALYSIS_RESULT, analysis_source: 'mock', fallback_reason: 'no_image_url' } 
      });
    }

    let result;
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      
      // 1. Call AI Analysis
      const aiResult = await analyzeDocumentWithOpenRouter({
        imageUrl,
        base64Image,
        userLanguage: userLang, 
        region: userRegion,
        mimeType: contentType
      });
      
      console.log('[Analyze API] AI analysis success');

      // 2. Detect category
      const category = detectCategory(aiResult);
      console.log('[Analyze API] Detected category:', category);

      // 3. Post-process: Supplement with verified local data
      const localRule = await getVerifiedLocalRule(userRegion, category);
      let localContext = aiResult.local_context;
      let localHeading = getLocalizedHeading(userLang, localRule?.region);
      
      if (localRule) {
        // Prepend verified rule to AI context
        const verifiedLabel = getLocalizedVerifiedLabel(userLang);
        localContext = `${verifiedLabel} ${localRule.content}\n\n${localContext}`;
      } else {
        // Fallback safety notice
        if (!localContext) {
          localContext = getLocalizedNoRuleNotice(userLang);
        }
      }

      // 4. Post-process: Nearby place refinement
      let nearbyPlace = aiResult.nearby_place;
      const verifiedPlaces = await getPlaces(userRegion, category);

      // Issuer specific override (e.g. Pohang Nambu Police Station)
      const issuer = (aiResult.issuer || '').toLowerCase();
      if (issuer.includes('포항남부경찰서') || (userRegion.includes('pohang') && category === 'fine')) {
        nearbyPlace = {
          name: "포항남부경찰서 교통관리계",
          type: "Police Station",
          address: "경상북도 포항시 남구 희망대로 850",
          phone: "054-270-7357",
          map_url: "https://map.kakao.com/?q=%ED%8F%AC%ED%95%AD%EB%82%A8%EB%B6%80%EA%B2%BD%EC%B0%B0%EC%84%9C",
          website_url: "https://www.efine.go.kr/",
          description: getLocalizedPoliceDescription(userLang)
        };
      } else if (verifiedPlaces && verifiedPlaces.length > 0) {
        const p = verifiedPlaces[0];
        nearbyPlace = {
          name: p.name,
          type: p.type,
          address: p.address,
          phone: p.phone,
          map_url: p.map_url,
          website_url: p.website_url || p.map_url,
          description: p.description
        };
      }

      // 5. Final fallback steps if AI is too vague
      const actionSteps = [...(aiResult.action_steps || [])];
      if (actionSteps.length < 4) {
        const fallbacks = getFallbackSteps(userLang, category);
        actionSteps.push(...fallbacks.filter(f => !actionSteps.includes(f)));
      }

      result = {
        ...aiResult,
        action_steps: actionSteps.slice(0, 6), // Limit to 6
        local_context: localContext,
        local_heading: localHeading,
        nearby_place: nearbyPlace,
        image_url: imageUrl,
        processed_at: new Date().toISOString(),
        analysis_source: 'openrouter'
      };
      
      console.log('[Analyze API] Final result normalized');
    } catch (aiError) {
      console.warn('[Analyze API] OpenRouter failed, using mock fallback:', aiError.message);
      result = {
        ...MOCK_ANALYSIS_RESULT,
        image_url: imageUrl,
        processed_at: new Date().toISOString(),
        analysis_source: 'mock',
        fallback_reason: aiError.message
      };
    }

    return Response.json({ success: true, result });
  } catch (error) {
    console.error('[Analyze API] Fatal error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

function detectCategory(result) {
  const text = ((result.document_type || '') + ' ' + (result.translated_summary || '') + ' ' + (result.risk_if_ignored || '')).toLowerCase();
  if (text.match(/traffic|fine|penalty|violation|과태료|범칙금|무인단속/)) return 'fine';
  if (text.match(/tax|resident tax|local tax|지방세|주민세|재산세|자동차세/)) return 'local_tax';
  if (text.match(/trash|waste|garbage|쓰레기|폐기물/)) {
    if (text.match(/food|음식물/)) return 'food_waste';
    if (text.match(/large|furniture|appliance|대형/)) return 'large_waste';
    return 'trash';
  }
  if (text.match(/insurance|premium|보험료|건강보험/)) return 'health_insurance';
  if (text.match(/foreigner|visa|immigration|외국인|출입국|체류/)) return 'foreigner_support';
  return 'public_office';
}

function getLocalizedHeading(lang, region) {
  const isPohang = (region || '').toLowerCase().includes('pohang');
  const headings = {
    'ko': isPohang ? '포항시 기준 행정 안내' : '확인된 행정 정보',
    'en': isPohang ? 'Pohang Local Guidance' : 'Verified Guidance',
    'vi': isPohang ? 'Hướng dẫn địa phương Pohang' : 'Hướng dẫn đã xác minh',
    'zh': isPohang ? '浦项本地行政指南' : '经核实的行政信息',
    'id': isPohang ? 'Panduan Lokal Pohang' : 'Panduan Terverifikasi'
  };
  return headings[lang] || headings['en'];
}

function getLocalizedVerifiedLabel(lang) {
  const labels = {
    'ko': '[확인된 공식 안내]',
    'en': '[Verified Official Guidance]',
    'vi': '[Hướng dẫn chính thức đã xác minh]',
    'zh': '[经核实的官方指南]',
    'id': '[Panduan Resmi Terverifikasi]'
  };
  return labels[lang] || labels['en'];
}

function getLocalizedNoRuleNotice(lang) {
  const notices = {
    'ko': '현재 데이터베이스에서 일치하는 행정 규칙을 찾을 수 없습니다. 공식 홈페이지나 발급기관에 확인하세요.',
    'en': 'No verified local rule was found in the database. Please confirm with the official office or website.',
    'vi': 'Không tìm thấy quy định địa phương nào trong cơ sở dữ liệu. Vui lòng xác nhận với văn phòng hoặc trang web chính thức.',
    'zh': '数据库中未找到经核实的本地规则。请向官方机构或网站确认。',
    'id': 'Tidak ada panduan lokal yang ditemukan dalam database. Harap konfirmasi dengan kantor atau situs web resmi.'
  };
  return notices[lang] || notices['en'];
}

function getLocalizedPoliceDescription(lang) {
  const descs = {
    'ko': '교통 과태료·범칙금 관련 문의는 경찰민원콜센터 182 또는 포항남부경찰서 교통관리계에 확인하세요.',
    'en': 'For inquiries regarding traffic fines, contact the Police Call Center at 182 or Pohang Nambu Police Station.',
    'vi': 'Để biết thông tin về tiền phạt giao thông, hãy liên hệ Tổng đài Cảnh sát 182 hoặc Sở cảnh sát Pohang Nambu.',
    'zh': '有关交通罚款的查询，请联系警察咨询热线 182 或浦项南部警察署交通管理科。',
    'id': 'Untuk pertanyaan mengenai denda lalu lintas, hubungi Call Center Polisi di 182 atau Kantor Polisi Pohang Nambu.'
  };
  return descs[lang] || descs['en'];
}

function getFallbackSteps(lang, category) {
  const steps = {
    'fine': {
      'ko': ['이파인(www.efine.go.kr)에서 상세 내역을 확인하세요.', '경찰민원콜센터 182를 통해 상담받을 수 있습니다.'],
      'en': ['Check details on eFine (www.efine.go.kr).', 'Contact the Police Call Center at 182 for assistance.'],
      'vi': ['Kiểm tra chi tiết trên eFine (www.efine.go.kr).', 'Liên hệ Tổng đài Cảnh sát 182 để được hỗ trợ.'],
      'zh': ['在 eFine (www.efine.go.kr) 查看详细信息。', '联系警察咨询热线 182 寻求帮助。'],
      'id': ['Periksa detail di eFine (www.efine.go.kr).', 'Hubungi Call Center Polisi di 182 untuk bantuan.']
    },
    'local_tax': {
      'ko': ['위택스(www.wetax.go.kr)에서 미납 세금을 조회할 수 있습니다.', '관할 시·구청 세무과에 문의하세요.'],
      'en': ['Check unpaid taxes on Wetax (www.wetax.go.kr).', 'Contact your local city/district tax office.'],
      'vi': ['Kiểm tra thuế chưa nộp trên Wetax (www.wetax.go.kr).', 'Liên hệ với văn phòng thuế thành phố/quận địa phương.'],
      'zh': ['在 Wetax (www.wetax.go.kr) 查看未缴税款。', '联系当地市/区税务局。'],
      'id': ['Periksa pajak yang belum dibayar di Wetax (www.wetax.go.kr).', 'Hubungi kantor pajak kota/distrik setempat.']
    }
  };
  const langSteps = steps[category] || {};
  return langSteps[lang] || langSteps['en'] || [];
}
