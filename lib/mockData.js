/**
 * Mock data for K-Pass MVP
 * Replace with real Supabase/API data in production
 */

export const MOCK_USER = {
  id: 'user-001',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: null,
  language: 'en',
  region: 'pohang-buk',
  userType: 'foreign-worker',
};

export const MOCK_ANALYSIS_RESULT = {
  id: 'demo-result',
  urgency: 'urgent',
  document_type: 'Local Tax Notice',
  issuer: 'Pohang City Hall',
  deadline: '2026-05-20',
  amount: '35,000 KRW',
  simple_korean_summary:
    '귀하의 2026년도 정기분 주민세(개인분) 납부 고지서입니다. 기한 내 납부하지 않을 경우 가산금이 부과될 수 있습니다.',
  translated_summary:
    'This is your annual resident tax bill. It must be paid by the deadline to avoid late fees.',
  action_steps: [
    'Pay before the deadline to avoid additional fees.',
    'Use the Wetax app or visit a local bank with this notice.',
    'Save the receipt for your records.',
  ],
  risk_if_ignored:
    'Failure to pay local taxes can negatively impact your visa extension or renewal applications with immigration.',
  local_context:
    'Buk-gu district offers a 5% discount if paid 5 days prior to the deadline through the regional app.',
  nearby_place: {
    name: 'Pohang Buk-gu District Office - Tax Division',
    type: 'Public office',
    address: 'Pohang-si Buk-gu, Gyeongsangbuk-do',
    map_url: 'https://map.kakao.com/',
  },
  processed_at: new Date().toISOString(),
};

export const MOCK_REMINDERS = [
  {
    id: 'rem-001',
    title: 'Local Tax Payment',
    document_type: 'Local Tax Notice',
    deadline: '2026-05-20',
    amount: '35,000 KRW',
    status: 'urgent',
    result_id: 'demo-result',
  },
  {
    id: 'rem-002',
    title: 'Health Insurance Premium',
    document_type: 'Health Insurance',
    deadline: '2026-05-25',
    amount: '89,200 KRW',
    status: 'upcoming',
    result_id: 'demo-result',
  },
  {
    id: 'rem-003',
    title: 'Electricity Bill',
    document_type: 'Utility Bill',
    deadline: '2026-04-30',
    amount: '42,500 KRW',
    status: 'done',
    result_id: 'demo-result',
  },
];

export const MOCK_HISTORY = [
  {
    id: 'demo-result',
    document_type: 'Local Tax Notice',
    urgency: 'urgent',
    summary: 'Annual resident tax bill — pay by May 20 to avoid penalties.',
    created_at: '2026-05-11T09:00:00Z',
  },
  {
    id: 'hist-002',
    document_type: 'Health Insurance Notice',
    urgency: 'normal',
    summary: 'Monthly health insurance premium payment reminder for May.',
    created_at: '2026-05-09T14:30:00Z',
  },
  {
    id: 'hist-003',
    document_type: 'Parking Fine',
    urgency: 'urgent',
    summary: 'Parking violation fine — pay within 10 days to avoid surcharge.',
    created_at: '2026-05-07T11:00:00Z',
  },
  {
    id: 'hist-004',
    document_type: 'Trash Disposal Notice',
    urgency: 'info',
    summary: 'Updated trash disposal schedule for Buk-gu residents.',
    created_at: '2026-05-03T08:00:00Z',
  },
];

export const MOCK_LOCAL_GUIDES = [
  {
    id: 'guide-001',
    category: 'Trash Disposal',
    icon: '🗑️',
    title: 'Trash Disposal Rules',
    description:
      'Use designated yellow bags (종량제 봉투) purchased from convenience stores. General waste must be in official bags. Recycling is sorted separately.',
    rules: [
      'Use certified yellow waste bags (종량제 봉투)',
      'Recycling: separate glass, paper, plastic, metal',
      'Food waste goes in designated food waste containers',
      'Collection times: Monday–Saturday mornings',
    ],
    source: 'Pohang City',
    last_updated: '2026-04-01',
  },
  {
    id: 'guide-002',
    category: 'Large Waste Disposal',
    icon: '🛋️',
    title: 'Large Waste Disposal',
    description:
      'Large items (furniture, appliances) require a sticker purchased from the district office or online. Place item outside on designated day.',
    rules: [
      'Buy a disposal sticker (대형폐기물 스티커) online or at district office',
      'Stick it on the item before placing outside',
      'Book a pickup date at pohang.go.kr',
      'Cost varies by item size',
    ],
    source: 'Pohang City',
    last_updated: '2026-03-15',
  },
  {
    id: 'guide-003',
    category: 'Local Tax / Fines',
    icon: '💰',
    title: 'Local Tax & Fines',
    description:
      'Pay local taxes through Wetax app, internet banking, or at any bank. Unpaid taxes may affect visa renewal.',
    rules: [
      'Pay via Wetax app (위택스) or any Korean bank',
      'Bring the notice for in-person bank payment',
      'Buk-gu 5% discount available 5 days before deadline',
      'Late fees start the day after the deadline',
    ],
    source: 'Pohang City',
    last_updated: '2026-04-10',
  },
  {
    id: 'guide-004',
    category: 'Public Offices',
    icon: '🏛️',
    title: 'Nearby Public Offices',
    description:
      'Key offices for foreign residents in Pohang-si Buk-gu for administrative tasks.',
    rules: [
      'Pohang Buk-gu District Office — Mon–Fri 09:00–18:00',
      'Immigration Office — Mon–Fri 09:00–17:00',
      'Health Insurance Corporation (NHIS) — Mon–Fri 09:00–17:00',
      'Bring passport + Alien Registration Card',
    ],
    source: 'Pohang City',
    last_updated: '2026-04-20',
  },
  {
    id: 'guide-005',
    category: 'Foreigner Support',
    icon: '🌍',
    title: 'Foreigner Support Services',
    description:
      'Pohang City offers free interpretation and administrative support for foreign residents.',
    rules: [
      'Free phone interpretation: 1345 (24/7)',
      'Pohang Multicultural Family Support Center',
      'Foreign Worker Support Center — job, legal, health help',
      'Online: pohang.go.kr/foreigner',
    ],
    source: 'Pohang City',
    last_updated: '2026-05-01',
  },
];

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export const REGIONS = [
  { code: 'pohang-buk', label: 'Pohang-si Buk-gu' },
  { code: 'pohang-nam', label: 'Pohang-si Nam-gu' },
];

export const USER_TYPES = [
  { code: 'foreign-worker', label: 'Foreign Worker' },
  { code: 'international-student', label: 'International Student' },
  { code: 'foreign-resident', label: 'Foreign Resident' },
];

export const SUPPORTED_DOCS = [
  { icon: '🏥', label: 'Health Insurance' },
  { icon: '🏙️', label: 'Local Tax' },
  { icon: '⚠️', label: 'Fines & Penalties' },
  { icon: '🗑️', label: 'Trash & Local Rules' },
];
