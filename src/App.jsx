import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Sun, CloudSun, Droplets, Wind, Sprout, Leaf, Camera, Plus, X,
  ChevronLeft, ChevronRight, Home as HomeIcon, NotebookText, Stethoscope,
  Trees, Settings, Check, AlertTriangle, Clock, Wallet, ImagePlus,
  Sparkles, MapPin, Calendar, TrendingUp
} from "lucide-react";

/* ============================================================
   الهوية البصرية — نفس الألوان والخطوط المعتمدة سابقاً
   ============================================================ */
const C = {
  navy: "#1C2541",
  navyDeep: "#12192E",
  gold: "#E8B94A",
  goldSoft: "#F0CE7C",
  olive: "#4A6741",
  clay: "#A85C32",
  cream: "#F5F0E6",
  creamDeep: "#EDE4D0",
};

function useGoogleFonts() {
  useEffect(() => {
    const id = "mawasem-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ============================================================
   قاعدة بيانات الأنواء الـ 28 (شهر/يوم بدون سنة — تُطبَّق تلقائياً كل عام)
   ============================================================ */
const NAWAT = [
  { name: "الثريا", season: "الصيف", month: 6, day: 7, duration: 13 },
  { name: "الدبران", season: "الصيف", month: 6, day: 20, duration: 13 },
  { name: "الهقعة", season: "الصيف", month: 7, day: 3, duration: 13 },
  { name: "الهنعة", season: "الصيف", month: 7, day: 16, duration: 13 },
  { name: "الذراع", season: "الصيف", month: 7, day: 29, duration: 13 },
  { name: "النثرة", season: "الصيف", month: 8, day: 11, duration: 13 },
  { name: "الطرفة", season: "الصيف", month: 8, day: 24, duration: 13 },
  { name: "الجبهة", season: "الخريف", month: 9, day: 6, duration: 14 },
  { name: "الزبرة", season: "الخريف", month: 9, day: 20, duration: 13 },
  { name: "الصرفة", season: "الخريف", month: 10, day: 3, duration: 13 },
  { name: "العواء", season: "الخريف", month: 10, day: 16, duration: 13 },
  { name: "السماك", season: "الخريف", month: 10, day: 29, duration: 13 },
  { name: "الغفر", season: "الخريف", month: 11, day: 11, duration: 13 },
  { name: "الزبانا", season: "الخريف", month: 11, day: 24, duration: 13 },
  { name: "الإكليل", season: "الشتاء", month: 12, day: 7, duration: 13 },
  { name: "القلب", season: "الشتاء", month: 12, day: 20, duration: 13 },
  { name: "الشولة", season: "الشتاء", month: 1, day: 2, duration: 13 },
  { name: "النعايم", season: "الشتاء", month: 1, day: 15, duration: 13 },
  { name: "البلدة", season: "الشتاء", month: 1, day: 28, duration: 13 },
  { name: "سعد الذابح", season: "الشتاء", month: 2, day: 10, duration: 13 },
  { name: "سعد بلع", season: "الشتاء", month: 2, day: 23, duration: 13 },
  { name: "سعد السعود", season: "الربيع", month: 3, day: 8, duration: 13 },
  { name: "سعد الأخبية", season: "الربيع", month: 3, day: 21, duration: 13 },
  { name: "المقدم", season: "الربيع", month: 4, day: 3, duration: 13 },
  { name: "المؤخر", season: "الربيع", month: 4, day: 16, duration: 13 },
  { name: "الرشاء", season: "الربيع", month: 4, day: 29, duration: 13 },
  { name: "الشرطين", season: "الربيع", month: 5, day: 12, duration: 13 },
  { name: "البطين", season: "الربيع", month: 5, day: 25, duration: 13 },
];

// توصيات عامة لكل فصل (تُستخدم إن لم توجد توصية شخصية)
const SEASON_TIPS = {
  الصيف: [
    { icon: "🌴", text: "النخيل الحين بمرحلة تكوين الثمار، حاول تحمي العذوق من الحر وثبّت الري" },
    { icon: "🐦", text: "غطّي العذوق القريبة من النضج بشبك حماية عشان الطيور" },
    { icon: "🍅", text: "قلّل الري وقت الظهر للمحاصيل الموسمية وزد فيه وقت الفجر" },
    { icon: "🐛", text: "خلّ بالك من سوسة النخيل الحمراء والحشرات القشرية، تنشط أكثر بهالحر" },
  ],
  الخريف: [
    { icon: "🌾", text: "وقت زين تغرس فيه الشتلات الشتوية وتجهّز التربة" },
    { icon: "💧", text: "قلّل الري شوي شوي مع نزول الحرارة" },
    { icon: "🌴", text: "بعض أصناف التمر تجي بموسم الجني الحين، جهّز أدواتك" },
  ],
  الشتاء: [
    { icon: "🧊", text: "احمِ الشتلات الصغيرة من الصقيع، خصوصاً بالليل" },
    { icon: "🌱", text: "وقت ممتاز تسمّد فيه الأشجار المثمرة قبل ما يبدأ موسم النمو" },
    { icon: "☀️", text: "استغل شمس الظهر، وخفف الري لأقل معدل بالسنة" },
  ],
  الربيع: [
    { icon: "🌸", text: "موسم الإزهار، تجنّب الرش بالمبيدات وقت تفتح الأزهار" },
    { icon: "💦", text: "زد الري شوي شوي مع ارتفاع الحرارة" },
    { icon: "🐝", text: "خلّ بالك من النحل والملقحات، فترة حساسة لعقد الثمار" },
  ],
};

// توصيات موثّقة خاصة بنوء محدد (وليست تعميماً على الفصل كامل)
// مبنية على معالم فلكية-مناخية معروفة ومؤكدة تاريخياً (نجم سهيل ومنازله، والوسم)
const NAWA_SPECIFIC_TIPS = {
  الطرفة: [
    { icon: "🌅", text: "بداية سهيل، الحر يبدأ ينكسر تدريجياً والليل يعتدل، بينما النهار لسا حامي" },
    { icon: "💧", text: "قلّل الري الليلي شوي مع اعتدال الأجواء ليلاً، وخلّي التركيز على ري الفجر" },
  ],
  الجبهة: [
    { icon: "🍂", text: "أول نجوم الخريف، الليل يبرد والجو يتحسن بالنهار" },
    { icon: "🌱", text: "وقت زين تبدأ تجهّز التربة لغرس شتلات الخريف" },
  ],
  الزبرة: [
    { icon: "🥶", text: "برد الليل يزيد وايد الحين، غطّي الشتلات الحساسة بالليل" },
  ],
  الصرفة: [
    { icon: "☀️", text: "آخر نجوم سهيل، وسمّيت كذا لأن الحر ينصرف عند طلوعها — دخلنا فعلياً بجو الخريف" },
    { icon: "🌾", text: "خلّك على جدول الري المخفف بتاع الخريف كامل الوقت" },
  ],
  العواء: [
    { icon: "🌧️", text: "دخلنا فترة الوسم (٥٢ يوماً بعد سهيل)، أول أمطار الخريف المتوقعة تكون نافعة للزرع" },
    { icon: "🍄", text: "من مواسم ظهور الكمأة/الفقع تقليدياً إذا جا المطر بوقته" },
  ],
};

// مستويات التقييم وألوانها
const LEVEL_STYLES = {
  excellent: { bg: "#F0EBD2", color: "#4A6741", badge: "✅ الأفضل" },
  verygood: { bg: "#F0EBD2", color: "#4A6741", badge: "✅ ممتاز جداً" },
  good: { bg: "#F3EEDF", color: "#5A7A50", badge: "🟢 جيد" },
  medium: { bg: "#FDF6E3", color: "#A87C1E", badge: "🟡 متوسط" },
  acceptable: { bg: "#FDF6E3", color: "#A87C1E", badge: "🟡 مقبول بمحاذير" },
  forbidden: { bg: "#FBEAE0", color: "#B0402B", badge: "⛔ ممنوع" },
  dangerous: { bg: "#F8D7D7", color: "#9B2C2C", badge: "🚫 محرّم زراعياً" },
};

// مواسم غرس النخيل العشرة — مبنية على فهارس الأنواء (NAWAT) وليس تواريخ ثابتة
// بيانات مقدّمة مباشرة من خبرة المستخدم، تغطي الـ28 نوءاً بالكامل بالتسلسل
const PALM_SEASONS = [
  {
    name: "زرع البارح الصغير",
    startIdx: 26, endIdx: 27, level: "excellent",
    summary: "ممتاز جداً ومن أفضل الأوقات المضمونة للزراعة",
    details: [
      { label: "النمو والاندفاع", text: "اندفاع خيالي في الجمّارة وسرعة نمو خضري عالية جداً، قد تصل الفسيلة لنص متر خلال 3 أشهر فقط" },
      { label: "السعف والجذع", text: "سعف وشوك قصير، وجذع ناعم ومتناسق" },
      { label: "التلقيح والإنتاج", text: "قليلة اللقاح (2-3 شماريخ)، تثمر سريعاً من السنة الثانية بجودة عالية ونواة طويلة" },
    ],
  },
  {
    name: "زرع البارح الكبير / العود",
    startIdx: 0, endIdx: 3, level: "excellent",
    summary: "الأفضل والقمة على الإطلاق في نظام الزراعة الصيفية",
    details: [
      { label: "الإنتاج والوفرة", text: "نخلة كريمة جداً، كل سعفة جديدة يخرج تحتها عذق دون تفويت أي سعفة" },
      { label: "خصائص الثمرة", text: "نواة طويلة تجعل الثمرة أطول وأجمل، مليئة باللحم، وتعطي صفاراً ناصعاً بأصناف النخيل الأصفر مثل الخلاص" },
      { label: "التلقيح", text: "تكتفي بـ2-3 شماريخ، تلقّح بسهولة دون شيص، ولا تحتاج تلقيحاً يدوياً كثيفاً لما تكبر" },
      { label: "النمو والعمر الإنتاجي", text: "نموها الطولي بطيء جداً (10 سم بالسنة)، فعمرها الإنتاجي يوصل 130 سنة دون أن تطول وتخرج من الخدمة" },
    ],
  },
  {
    name: "زرع المرزم / جمدة الحاتمية",
    startIdx: 4, endIdx: 5, level: "verygood",
    summary: "جيد جداً، تلي البارح في الجودة",
    details: [
      { label: "المواصفات", text: "قريبة من كنة الربيع، السعف أطول من البارح بذراع، والشوك أخشن، والجذع أكبر وأسرع نمواً" },
      { label: "التلقيح والإنتاج", text: "لقاحها سهل ولا تستجدي اللقاح بكثرة، وتفقد سعفتين بالسنة بدون حمل عذوق" },
    ],
  },
  {
    name: "زرع سهيل",
    startIdx: 6, endIdx: 9, level: "medium",
    summary: "متوسط — عقد ثمار كثير لكن حجم صغير",
    details: [
      { label: "الإيجابيات", text: "عقد الثمار كثير جداً وتتراكم العذوق، وتطلب لقاحاً أقل من زرع سوقة العذق" },
      { label: "السلبيات", text: "تمراتها صغيرة الحجم لقصر النواة، وتفقد 4 سعفات بالسنة دون أن تثمر تحتها" },
    ],
  },
  {
    name: "زرع الوسم",
    startIdx: 10, endIdx: 13, level: "acceptable",
    summary: "مقبول مع محاذير — شرهة جداً للتلقيح",
    details: [
      { label: "المواصفات", text: "سعفها أطول من البارح بذراعين، الشوك قوي مضاعف، والجذع ضخم شديد الشراهة للنمو والماء" },
      { label: "السلبيات", text: "إن لم تُلقّح يدوياً بكثافة واستمرار لن تعقد التمر مطلقاً" },
    ],
  },
  {
    name: "زرع المربعانية",
    startIdx: 14, endIdx: 16, level: "forbidden",
    summary: "ممنوع ومحذر منه تماماً",
    details: [
      { label: "السلبيات", text: "الأرض بحال جمود وبرودة عالية تمنع حركة العروق، وتظل الفسيلة متعطلة عن النمو 8 أشهر لسنة، وغالباً تتعفن وتموت قبل أن تدفع" },
    ],
  },
  {
    name: "زرع الشبط / الحوت",
    startIdx: 17, endIdx: 18, level: "dangerous",
    summary: "محرّم زراعياً — خطر وحرج جداً",
    details: [
      { label: "السلبيات", text: "أشد أوقات البرد، الفسيلة تظل خضراء لكن العروق ما تمشي بالأرض الباردة فتتعفن. إن عاشت لاحقاً تصير متعبة وشرهة للقاح (20-30 شمروخ) ولا تقبل اللقاح بسهولة" },
    ],
  },
  {
    name: "زرع السعودات",
    startIdx: 19, endIdx: 21, level: "acceptable",
    summary: "مقبول",
    details: [
      { label: "المواصفات", text: "مشابهة لزرع الوسم، سعف وجذع ضخم جداً، شوك قوي ودبل، ونمو سريع" },
      { label: "السلبيات", text: "تطلب كميات كبيرة جداً من اللقاح عند إثمارها مستقبلاً، أكثر من الوسم" },
    ],
  },
  {
    name: "زرع سوقة العذق",
    startIdx: 22, endIdx: 23, level: "medium",
    summary: "متوسط",
    details: [
      { label: "المواصفات", text: "النخلة أجبر وأطول سعفاً من زرع سهيل، ونواتها طويلة نسبياً" },
      { label: "الإيجابيات والسلبيات", text: "ثمرها أقل عدداً من سهيل والبارح، وتحتاج لقاحاً أكثر من سهيل" },
    ],
  },
  {
    name: "زرع كنة الربيع",
    startIdx: 24, endIdx: 25, level: "good",
    summary: "جيد",
    details: [
      { label: "المواصفات", text: "قريبة من البارح لكن السعف أطول بذراع، والشوك أخشن، والجذع أكبر وأسرع نمواً" },
      { label: "التلقيح والإنتاج", text: "لقاحها سهل جداً، وتفقد سعفتين بالسنة بدون حمل ثمار" },
    ],
  },
];

function getPalmSeasonRange(season, today = new Date()) {
  const startN = NAWAT[season.startIdx];
  const endN = NAWAT[season.endIdx];
  const candidates = [];
  [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].forEach((y) => {
    const start = new Date(y, startN.month - 1, startN.day);
    const end = new Date(y, endN.month - 1, endN.day);
    end.setDate(end.getDate() + endN.duration);
    if (end <= start) end.setFullYear(end.getFullYear() + 1);
    candidates.push({ start, end });
  });
  const active = candidates.find((c) => today >= c.start && today < c.end);
  if (active) return { ...active, isActive: true };
  const upcoming = candidates.filter((c) => c.start >= today).sort((a, b) => a.start - b.start)[0];
  return { ...(upcoming || candidates[1]), isActive: false };
}

// كنيات/عبارات ترحيب عامية متنوعة
const GENERIC_GREETINGS = ["يا مزارعنا", "يا ذيبان", "هلا بالفلاح الفطين", "يا أبو الخير", "يا نجم المزرعة"];

function getRandomGreeting(kunya) {
  // مزيج: أحياناً الكنية الشخصية وأحياناً عبارة عامة
  const useKunya = kunya && Math.random() < 0.5;
  if (useKunya) return `هلا ${kunya}`;
  const g = GENERIC_GREETINGS[Math.floor(Math.random() * GENERIC_GREETINGS.length)];
  return `${g}!`;
}

/* ============================================================
   حساب النوء الحالي — يعمل لأي سنة قادمة تلقائياً
   ============================================================ */
function getCurrentNawaInfo(today = new Date()) {
  const candidates = [];
  [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].forEach((y) => {
    NAWAT.forEach((n, idx) => {
      const start = new Date(y, n.month - 1, n.day);
      const end = new Date(start);
      end.setDate(end.getDate() + n.duration);
      candidates.push({ ...n, idx, start, end });
    });
  });
  const hit = candidates.find((c) => today >= c.start && today < c.end);
  if (!hit) return null;
  const daysPassed = Math.floor((today - hit.start) / 86400000) + 1;
  const daysLeft = hit.duration - daysPassed;
  return { ...hit, daysPassed, daysLeft };
}

function getNawaOccurrence(idx, today = new Date()) {
  const n = NAWAT[idx];
  const candidates = [];
  [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].forEach((y) => {
    const start = new Date(y, n.month - 1, n.day);
    const end = new Date(start);
    end.setDate(end.getDate() + n.duration);
    candidates.push({ start, end });
  });
  const active = candidates.find((c) => today >= c.start && today < c.end);
  if (active) return { ...active, isActive: true };
  const upcoming = candidates.filter((c) => c.start >= today).sort((a, b) => a.start - b.start)[0];
  return { ...(upcoming || candidates[1]), isActive: false };
}

/* ============================================================
   قاعدة معرفة محلية مبسطة للنباتات (تعمل بدون إنترنت)
   ============================================================ */
const PLANT_KB = {
  نخلة: {
    stages: [
      { max: 365, name: "تأسيس الجذور" },
      { max: 365 * 4, name: "نمو خضري" },
      { max: 365 * 8, name: "بداية الإثمار" },
      { max: Infinity, name: "إنتاج كامل" },
    ],
    waterDays: 4,
    fertilizeDays: 60,
  },
  حمضيات: {
    stages: [
      { max: 180, name: "تأسيس الجذور" },
      { max: 365 * 2, name: "نمو خضري" },
      { max: 365 * 4, name: "إزهار وإثمار مبكر" },
      { max: Infinity, name: "إنتاج كامل" },
    ],
    waterDays: 3,
    fertilizeDays: 45,
  },
  خضروات: {
    stages: [
      { max: 20, name: "إنبات" },
      { max: 45, name: "نمو خضري" },
      { max: 70, name: "إزهار" },
      { max: Infinity, name: "إثمار وجني" },
    ],
    waterDays: 2,
    fertilizeDays: 21,
  },
  default: {
    stages: [
      { max: 30, name: "تأسيس" },
      { max: 120, name: "نمو خضري" },
      { max: Infinity, name: "نمو مستقر" },
    ],
    waterDays: 3,
    fertilizeDays: 30,
  },
};

function computeAge(plantDate) {
  const diff = Math.floor((new Date() - new Date(plantDate)) / 86400000);
  return Math.max(diff, 0);
}
function computeStage(type, ageDays) {
  const kb = PLANT_KB[type] || PLANT_KB.default;
  const stage = kb.stages.find((s) => ageDays <= s.max);
  return stage ? stage.name : kb.stages[kb.stages.length - 1].name;
}
function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
}

/* ============================================================
   مخطط المزرعة — مربعات ← أجزاء ← صفوف ← خانات
   بيانات ابتدائية دقيقة من المستخدم — قابلة للتعديل والتوسعة من داخل التطبيق
   ============================================================ */
const INITIAL_FARM_LAYOUT = [
  {
    id: "b1", name: "المربع الأول", note: "شمال",
    parts: [
      { id: "b1p1", name: "الجزء الأول", pattern: "hex", startOffset: false, rowCounts: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5] },
      { id: "b1p2", name: "الجزء الثاني", pattern: "hex", startOffset: true, rowCounts: [5, 5, 5, 6, 6, 7, 6, 6, 6, 6, 5, 6, 5, 6, 5] },
    ],
  },
  {
    id: "b2", name: "المربع الثاني", note: "منتصف",
    parts: [
      { id: "b2p1", name: "الجزء الأول", pattern: "hex", startOffset: true, rowCounts: Array(15).fill(5) },
      { id: "b2p2", name: "الجزء الثاني", pattern: "hex", startOffset: false, rowCounts: [6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6] },
    ],
  },
  {
    id: "b3", name: "المربع الثالث", note: "جنوب",
    parts: [
      { id: "b3p1", name: "الجزء الأول", pattern: "hex", startOffset: false, rowCounts: Array(25).fill(5) },
      { id: "b3p2", name: "الجزء الثاني", pattern: "hex", startOffset: true, rowCounts: [5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 5, 5, 5, 5, 5, 5] },
    ],
  },
];

function blockTotal(block) {
  return block.parts.reduce((sum, p) => sum + p.rowCounts.reduce((a, b) => a + b, 0), 0);
}
function farmTotal(layout) {
  return layout.reduce((sum, b) => sum + blockTotal(b), 0);
}
// عنوان النخلة الثابت — مثال: م1-ج1-ص4-ن2
function slotAddress(blockIdx, partIdx, rowIdx, posIdx) {
  return `م${blockIdx + 1}-ج${partIdx + 1}-ص${rowIdx + 1}-ن${posIdx + 1}`;
}
const HEALTH_STYLES = {
  healthy: { color: C.olive, bg: "#EAF0E4", label: "سليمة", dot: "#4A6741" },
  stressed: { color: "#A87C1E", bg: "#FDF6E3", label: "متضررة", dot: "#E8B94A" },
  dead: { color: "#B0402B", bg: "#FBEAE0", label: "يابسة", dot: "#B0402B" },
};

// أصناف النخيل الشائعة
const PALM_VARIETIES = [
  "فحل", "عجوة", "عنبرة", "صقعي", "مجدول", "برني العيص", "روثانة مدني",
  "روثانة الشرق", "إخلاص", "رشودية", "ربيعة", "بيض", "حلوة", "صفاوي",
];
// فئات الغرس البديلة (لو أُلغيت نخلة واستُبدلت)
const REPLACEMENT_CATEGORIES = {
  "شجرة مثمرة": ["سدر", "لوز", "ليمون", "برتقال", "زيتون"],
  "شجرة زينة": ["نخيل زينة", "أثل", "سرو", "غاف"],
};

/* ============================================================
   المكوّن الرئيسي
   ============================================================ */
export default function MawasemApp() {
  useGoogleFonts();

  const [tab, setTab] = useState("home");
  const [kunya, setKunya] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("idle"); // idle | loading | done | error

  // بيانات المزرعة والدفتر — حالة ذاكرة فقط لهذه المعاينة
  // (ملاحظة: في التطبيق المنشور فعلياً ستُستبدل بـ LocalStorage + مزامنة سحابية تلقائية)
  const [plants, setPlants] = useState([
    { id: 1, name: "نخلة الفناء الشرقي", type: "نخلة", plantDate: daysAgoISO(220), photo: null },
    { id: 2, name: "شجرة ليمون", type: "حمضيات", plantDate: daysAgoISO(60), photo: null },
    { id: 3, name: "شتلة طماطم", type: "خضروات", plantDate: daysAgoISO(18), photo: null },
  ]);
  const [logs, setLogs] = useState([
    { id: 1, plantId: 1, type: "ري", date: daysAgoISO(2), cost: 0, note: "" },
    { id: 2, plantId: 2, type: "تسميد", date: daysAgoISO(50), cost: 35, note: "سماد عضوي" },
  ]);

  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showPalmSeasons, setShowPalmSeasons] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [showFarmMap, setShowFarmMap] = useState(false);
  const [addPlantLocation, setAddPlantLocation] = useState(null); // موقع مُعبّأ مسبقاً عند الإضافة من الخريطة
  const [openProfileId, setOpenProfileId] = useState(null); // معرّف النخلة المفتوح ملفها الآن

  // مخطط المزرعة نفسه — قابل للتعديل والتوسعة (مربع/صف جديد) من داخل التطبيق
  const [farmLayout, setFarmLayout] = useState(INITIAL_FARM_LAYOUT);
  // partsConfig: مصفوفة من الأنماط، مثال ["hex"] أو ["hex","square"] أو ["hex","hex","square"]
  function addBlock(name, note, partsConfig) {
    const n = farmLayout.length + 1;
    const partNames = ["الجزء الأول", "الجزء الثاني", "الجزء الثالث", "الجزء الرابع", "الجزء الخامس"];
    setFarmLayout((prev) => [
      ...prev,
      {
        id: `b${n}`, name, note,
        parts: partsConfig.map((pattern, i) => ({
          id: `b${n}p${i + 1}`,
          name: partNames[i] || `الجزء ${i + 1}`,
          pattern,
          startOffset: i % 2 === 1,
          rowCounts: [],
        })),
      },
    ]);
  }
  function addRow(blockIdx, partIdx, count) {
    setFarmLayout((prev) =>
      prev.map((b, bi) =>
        bi !== blockIdx ? b : { ...b, parts: b.parts.map((p, pi) => (pi !== partIdx ? p : { ...p, rowCounts: [...p.rowCounts, count] })) }
      )
    );
  }

  // ملاحظات المستخدم الخاصة بكل نوء — قابلة للإضافة تدريجياً من خبرته الشخصية
  // (ذاكرة مؤقتة هنا فقط، وستُحفظ دائماً في LocalStorage + السحابة بالنسخة المنشورة)
  const [customNotes, setCustomNotes] = useState({});
  function addCustomNote(nawaName, note) {
    setCustomNotes((prev) => ({ ...prev, [nawaName]: [...(prev[nawaName] || []), note] }));
  }

  const currentNawa = useMemo(() => getCurrentNawaInfo(), []);
  const today = new Date();
  const greeting = useMemo(() => getRandomGreeting(kunya), [tab]);

  /* ---------------- الطقس المباشر ---------------- */
  const fetchWeather = useCallback(() => {
    setWeatherStatus("loading");
    if (!navigator.geolocation) {
      setWeatherStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
          );
          const data = await res.json();
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
          });
          setWeatherStatus("done");
        } catch (e) {
          setWeatherStatus("error");
        }
      },
      () => setWeatherStatus("error")
    );
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  /* ---------------- التنبيهات الشخصية ---------------- */
  const alerts = useMemo(() => {
    const list = [];
    plants.forEach((p) => {
      const kb = PLANT_KB[p.type] || PLANT_KB.default;
      const plantLogs = logs.filter((l) => l.plantId === p.id);

      const lastWater = plantLogs.filter((l) => l.type === "ري").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const sinceWater = daysSince(lastWater?.date || p.plantDate);
      let waterDays = kb.waterDays;
      if (weather?.temp >= 40) waterDays = Math.max(1, waterDays - 1); // تعديل حسب الحرارة
      if (sinceWater >= waterDays) {
        list.push({
          id: `w-${p.id}`,
          level: sinceWater >= waterDays + 2 ? "urgent" : "soon",
          plant: p.name,
          plantId: p.id,
          type: "ري",
          text: weather?.temp >= 40
            ? `${p.name} — الري مستحق، والحر اليوم ${weather.temp}° فخليه فجري`
            : `${p.name} — وقت الري قرّب`,
        });
      }

      const lastFert = plantLogs.filter((l) => l.type === "تسميد").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const sinceFert = daysSince(lastFert?.date || p.plantDate);
      if (sinceFert >= kb.fertilizeDays) {
        list.push({
          id: `f-${p.id}`,
          level: sinceFert >= kb.fertilizeDays + 10 ? "urgent" : "soon",
          plant: p.name,
          plantId: p.id,
          type: "تسميد",
          text: `${p.name} — التسميد مستحق اليوم`,
        });
      }
    });
    return list;
  }, [plants, logs, weather]);

  function handleDoneAlert(alert) {
    setLogs((prev) => [
      ...prev,
      { id: Date.now(), plantId: alert.plantId, type: alert.type, date: new Date().toISOString(), cost: 0, note: "تم من التنبيه" },
    ]);
  }

  /* ---------------- إضافة نبتة/عملية ---------------- */
  function addPlant(newPlant) {
    setPlants((prev) => [...prev, { id: Date.now(), health: "healthy", location: null, ...newPlant }]);
    setShowAddPlant(false);
    setAddPlantLocation(null);
  }
  function addLog(newLog) {
    setLogs((prev) => [...prev, { id: Date.now(), ...newLog }]);
    setShowAddLog(false);
  }
  // إضافة تقييم حالة لنخلة معينة (يحدّث الحالة الصحية + يضيف للسجل الزمني)
  function addConditionNote(plantId, note, health) {
    setLogs((prev) => [...prev, { id: Date.now(), plantId, type: "تقييم حالة", date: new Date().toISOString(), cost: 0, note }]);
    setPlants((prev) => prev.map((p) => (p.id === plantId ? { ...p, health } : p)));
  }
  // إيجاد نخلة مربوطة بخانة معينة بالمخطط
  function findPlantAt(blockIdx, partIdx, rowIdx, posIdx) {
    return plants.find(
      (p) => p.location && p.location.b === blockIdx && p.location.p === partIdx && p.location.r === rowIdx && p.location.s === posIdx
    );
  }
  // إلغاء نخلة موجودة واستبدالها بغرسة ثانية بنفس الموقع (تُبقي العنوان، تصفّر العمر والحالة)
  function replacePlant(plantId, category, variety) {
    setLogs((prev) => [
      ...prev,
      { id: Date.now(), plantId, type: "تقييم حالة", date: new Date().toISOString(), cost: 0, note: `أُلغيت واستُبدلت بـ ${category}${variety ? " - " + variety : ""}` },
    ]);
    setPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, type: category, variety: variety || "", plantDate: new Date().toISOString(), health: "healthy" } : p))
    );
  }
  // تفريغ الخانة نهائياً بدون استبدال
  function removePlant(plantId) {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
  }

  if (showOnboarding) {
    return <Onboarding onDone={(k) => { setKunya(k); setShowOnboarding(false); }} />;
  }

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", height: "100vh", position: "relative", overflow: "hidden" }}
      className="max-w-md mx-auto"
    >
      {/* منطقة قابلة للتمرير — كل محتوى الشاشات */}
      <div
        style={{ position: "absolute", inset: 0, overflowY: "auto", backgroundColor: C.cream }}
        className="pb-28"
      >
        {/* رأس الصفحة */}
        <Header greeting={greeting} nawa={currentNawa} onOpenWheel={() => setShowWheel(true)} />

        <div className="px-4 -mt-6 relative z-10">
          {tab === "home" && (
            <Home
              alerts={alerts}
              onDoneAlert={handleDoneAlert}
              nawa={currentNawa}
              weather={weather}
              weatherStatus={weatherStatus}
              plants={plants}
              onOpenFarm={() => setTab("farm")}
              customNotes={customNotes}
              onAddNote={addCustomNote}
              onOpenPalmSeasons={() => setShowPalmSeasons(true)}
            />
          )}
          {tab === "farm" && (
            <MyFarm plants={plants} logs={logs} farmLayout={farmLayout} onAdd={() => setShowAddPlant(true)} onOpenPalmSeasons={() => setShowPalmSeasons(true)} onOpenFarmMap={() => setShowFarmMap(true)} />
          )}
          {tab === "logbook" && (
            <Logbook plants={plants} logs={logs} onAdd={() => setShowAddLog(true)} />
          )}
          {tab === "doctor" && <PlantDoctor />}
          {tab === "more" && <MoreScreen kunya={kunya} setKunya={setKunya} plants={plants} logs={logs} />}
        </div>
      </div>

      {/* زر عائم لإضافة عملية — ثابت على إطار الجوال نفسه، مو على المتصفح */}
      {(tab === "home" || tab === "logbook") && (
        <button
          onClick={() => setShowAddLog(true)}
          style={{ position: "absolute", bottom: 88, left: "50%", transform: "translateX(-50%)", backgroundColor: C.clay, zIndex: 30 }}
          className="rounded-full shadow-xl flex items-center gap-2 px-5 py-3.5 text-white font-medium"
        >
          <Plus size={20} /> سجّل عملية
        </button>
      )}

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20 }}>
        <BottomNav tab={tab} setTab={setTab} />
      </div>

      {showAddPlant && (
        <AddPlantModal
          onClose={() => { setShowAddPlant(false); setAddPlantLocation(null); }}
          onSave={addPlant}
          initialLocation={addPlantLocation}
        />
      )}
      {showAddLog && (
        <AddLogModal plants={plants} onClose={() => setShowAddLog(false)} onSave={addLog} />
      )}
      {showPalmSeasons && <PalmSeasonsScreen onClose={() => setShowPalmSeasons(false)} />}
      {showWheel && <NawaWheelScreen currentNawa={currentNawa} onClose={() => setShowWheel(false)} />}
      {showFarmMap && (
        <FarmMapScreen
          layout={farmLayout}
          plants={plants}
          onClose={() => setShowFarmMap(false)}
          findPlantAt={findPlantAt}
          onOpenProfile={(id) => setOpenProfileId(id)}
          onAddAt={(loc) => { setAddPlantLocation(loc); setShowAddPlant(true); }}
          onAddBlock={addBlock}
          onAddRow={addRow}
        />
      )}
      {openProfileId && (
        <PalmProfileScreen
          plant={plants.find((p) => p.id === openProfileId)}
          logs={logs.filter((l) => l.plantId === openProfileId)}
          onClose={() => setOpenProfileId(null)}
          onAddCondition={(note, health) => addConditionNote(openProfileId, note, health)}
          onReplace={(category, variety) => replacePlant(openProfileId, category, variety)}
          onRemove={() => { removePlant(openProfileId); setOpenProfileId(null); }}
        />
      )}
    </div>
  );
}

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/* ============================================================
   شاشة الترحيب الأولى (الكنية)
   ============================================================ */
function Onboarding({ onDone }) {
  useGoogleFonts();
  const [val, setVal] = useState("");
  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", background: `radial-gradient(circle at 50% 30%, #24304F 0%, ${C.navy} 55%, ${C.navyDeep} 100%)` }}
      className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center text-center px-6"
    >
      <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-6xl font-bold" >
        <span style={{ color: C.cream }}>موا</span><span style={{ color: C.gold }}>سم</span>
      </div>
      <p style={{ color: C.goldSoft }} className="mt-2 text-sm">رفيقك الزراعي على وقع النجوم</p>

      <div className="mt-12 w-full max-w-xs">
        <p style={{ color: C.cream }} className="mb-3 text-sm">وش نناديك؟ (كنيتك، مثل أبو راكان)</p>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="أبو راكان"
          className="w-full rounded-xl px-4 py-3 text-center outline-none"
          style={{ backgroundColor: "rgba(245,240,230,0.1)", color: C.cream, border: `1px solid ${C.gold}` }}
        />
        <button
          onClick={() => onDone(val.trim())}
          className="mt-4 w-full rounded-xl py-3 font-medium"
          style={{ backgroundColor: C.gold, color: C.navyDeep }}
        >
          يالله نبدأ
        </button>
        <button onClick={() => onDone("")} className="mt-3 text-xs" style={{ color: "rgba(245,240,230,0.5)" }}>
          تخطي الحين
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   عجلة الأنواء — الشعار التفاعلي
   ============================================================ */
function NawaWheel({ activeIndex, size = 64 }) {
  const n = 28;
  const cx = 50, cy = 50, rOuter = 48, rInner = 33;
  const sectors = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + rOuter * Math.cos(a0), y1 = cy + rOuter * Math.sin(a0);
    const x2 = cx + rOuter * Math.cos(a1), y2 = cy + rOuter * Math.sin(a1);
    const x3 = cx + rInner * Math.cos(a1), y3 = cy + rInner * Math.sin(a1);
    const x4 = cx + rInner * Math.cos(a0), y4 = cy + rInner * Math.sin(a0);
    const isActive = i === activeIndex;
    sectors.push(
      <path
        key={i}
        d={`M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4} Z`}
        fill={isActive ? C.gold : i % 2 === 0 ? "#2A3660" : "#1C2541"}
        stroke="#0F1526"
        strokeWidth="0.4"
      />
    );
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#3A4568" strokeWidth="0.6" />
      <g>{sectors}</g>
      <circle cx={cx} cy={cy} r={24} fill="#12192E" stroke={C.gold} strokeWidth="1" />
      <g transform={`translate(${cx},${cy})`}>
        <path d="M0,-14 L3,-3 L14,0 L3,3 L0,14 L-3,3 L-14,0 L-3,-3 Z" fill={C.gold} />
      </g>
    </svg>
  );
}

/* ============================================================
   الهيدر
   ============================================================ */
function Header({ greeting, nawa, onOpenWheel }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long" });
  return (
    <div
      className="pt-8 pb-14 px-5"
      style={{ background: `radial-gradient(circle at 50% 20%, #24304F 0%, ${C.navy} 60%, ${C.navyDeep} 100%)`, color: C.cream }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs opacity-60">{dateStr}</div>
          <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-2xl mt-1">{greeting}</div>
        </div>
        <button onClick={onOpenWheel} className="flex items-center gap-2 text-left">
          <div>
            <div className="text-[11px] opacity-60">النوء الحالي</div>
            <div className="text-sm font-medium" style={{ color: C.goldSoft }}>
              {nawa ? `${nawa.name} · يوم ${nawa.daysPassed} من ${nawa.duration}` : "—"}
            </div>
          </div>
          {nawa && <NawaWheel activeIndex={nawa.idx} size={44} />}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   شاشة العجلة الكاملة — تصفح الـ28 نوءاً
   ============================================================ */
function NawaWheelScreen({ currentNawa, onClose }) {
  function fmt(d) {
    return d.toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long" });
  }
  const rows = NAWAT.map((n, idx) => ({ ...n, idx, occ: getNawaOccurrence(idx) }));

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: C.cream }}>
      <div
        className="flex items-center gap-3 px-4 py-4 shrink-0"
        style={{ background: `radial-gradient(circle at 50% 20%, #24304F 0%, ${C.navy} 60%, ${C.navyDeep} 100%)`, color: C.cream }}
      >
        <button onClick={onClose}><ChevronRight size={22} /></button>
        <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-lg">عجلة الأنواء</div>
      </div>

      <div className="flex flex-col items-center py-6 shrink-0" style={{ background: `radial-gradient(circle at 50% 0%, #24304F 0%, ${C.navy} 60%, ${C.navyDeep} 100%)`, color: C.cream }}>
        <NawaWheel activeIndex={currentNawa?.idx ?? -1} size={190} />
        {currentNawa && (
          <div className="text-center mt-3">
            <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-xl">{currentNawa.name}</div>
            <div className="text-xs opacity-70 mt-1">
              {currentNawa.season} · يوم {currentNawa.daysPassed} من {currentNawa.duration} · باقي {currentNawa.daysLeft}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-2xl p-3"
            style={{
              backgroundColor: r.occ.isActive ? C.gold : "#fff",
              border: r.occ.isActive ? "none" : "1px solid #eee2c8",
            }}
          >
            <div>
              <div className="text-sm font-medium" style={{ color: C.navy }}>{r.name}</div>
              <div className="text-[11px]" style={{ color: r.occ.isActive ? C.navyDeep : "#a39a86" }}>{r.season}</div>
            </div>
            <div className="text-xs" style={{ color: r.occ.isActive ? C.navyDeep : "#a39a86" }}>
              {fmt(r.occ.start)} — {fmt(r.occ.end)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   الشاشة الرئيسية
   ============================================================ */
function Home({ alerts, onDoneAlert, nawa, weather, weatherStatus, plants, onOpenFarm, customNotes, onAddNote, onOpenPalmSeasons }) {
  const specificTips = nawa ? NAWA_SPECIFIC_TIPS[nawa.name] : null;
  const tips = specificTips || (nawa ? SEASON_TIPS[nawa.season] : []);
  const isVerified = Boolean(specificTips);
  const myNotes = nawa ? (customNotes[nawa.name] || []) : [];
  const [noteInput, setNoteInput] = useState("");

  const currentPalmSeason = useMemo(() => {
    const withDates = PALM_SEASONS.map((s) => ({ ...s, range: getPalmSeasonRange(s) }));
    return withDates.find((s) => s.range.isActive) || null;
  }, []);

  return (
    <div className="space-y-4">
      {/* بطاقة التنبيهات الشخصية — أول وأكبر عنصر */}
      <div
        className="rounded-3xl p-5 shadow-lg"
        style={{
          backgroundColor: alerts.length ? "#fff" : C.olive,
          border: alerts.length ? `2px solid ${C.clay}` : "none",
          color: alerts.length ? C.navy : "#fff",
        }}
      >
        {alerts.length === 0 ? (
          <div className="flex items-center gap-3">
            <Check size={26} />
            <div>
              <div className="font-semibold">تمام يا الغالي</div>
              <div className="text-sm opacity-90">كل نباتاتك بخير اليوم، ما فيه مستحقات</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: C.clay }}>
              <AlertTriangle size={18} /> تنبيهاتك الحين
            </div>
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-2xl p-3" style={{ backgroundColor: a.level === "urgent" ? "#FBEAE0" : "#FDF6E3" }}>
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">{a.level === "urgent" ? "🔴" : "🟡"}</span>
                  <span className="text-sm">{a.text}</span>
                </div>
                <button
                  onClick={() => onDoneAlert(a)}
                  className="text-xs font-medium rounded-full px-3 py-1.5 whitespace-nowrap text-white"
                  style={{ backgroundColor: C.olive }}
                >
                  تم ✓
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* بطاقة الطقس */}
      <div className="rounded-3xl p-5 shadow-md bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.navy }}>
            <CloudSun size={18} style={{ color: C.gold }} /> الطقس الحين
          </div>
          {weatherStatus === "loading" && <span className="text-xs text-gray-400">يجيب البيانات...</span>}
        </div>
        {weatherStatus === "done" && weather && (
          <>
            <div className="flex items-center gap-5 mt-3">
              <div className="text-3xl font-semibold" style={{ color: C.navy }}>{weather.temp}°</div>
              <div className="flex items-center gap-1 text-sm text-gray-500"><Droplets size={15} /> {weather.humidity}%</div>
              <div className="flex items-center gap-1 text-sm text-gray-500"><Wind size={15} /> {weather.wind} كم/س</div>
            </div>
            <div className="text-xs mt-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.creamDeep, color: C.clay }}>
              {weather.temp >= 40
                ? "الجو حر اليوم، رويها بدري الصبح أفضل من الظهر"
                : weather.temp <= 15
                ? "الجو بارد، خفف الري وحافظ على الشتلات من البرد"
                : "الجو حلو، الري العادي يكفي اليوم"}
            </div>
          </>
        )}
        {weatherStatus === "error" && (
          <div className="text-xs text-gray-400 mt-2">ما قدرنا نجيب الطقس، تأكد من إذن الموقع</div>
        )}
      </div>

      {/* بطاقة موسم غرس النخيل الحالي */}
      {currentPalmSeason && (
        <button
          onClick={onOpenPalmSeasons}
          className="w-full rounded-3xl p-5 shadow-md text-right"
          style={{ backgroundColor: C.navy, color: C.cream }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sprout size={18} style={{ color: C.gold }} /> موسم الغرس الحين
            </div>
            <ChevronLeft size={16} />
          </div>
          <div className="mt-2 font-medium" style={{ fontFamily: "'Aref Ruqaa', serif", fontSize: 20 }}>{currentPalmSeason.name}</div>
          <span
            className="inline-block text-xs font-medium rounded-full px-3 py-1 mt-2"
            style={{ backgroundColor: LEVEL_STYLES[currentPalmSeason.level].bg, color: LEVEL_STYLES[currentPalmSeason.level].color }}
          >
            {LEVEL_STYLES[currentPalmSeason.level].badge}
          </span>
          <div className="text-xs mt-2 opacity-70">{currentPalmSeason.summary}</div>
        </button>
      )}

      {/* مزرعتك الآن */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-sm font-semibold" style={{ color: C.navy }}>مزرعتك الحين</div>
          <button onClick={onOpenFarm} className="text-xs" style={{ color: C.clay }}>عرض الكل</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {plants.map((p) => {
            const age = computeAge(p.plantDate);
            const stage = computeStage(p.type, age);
            return (
              <div key={p.id} className="min-w-[130px] rounded-2xl bg-white shadow-sm p-3">
                <div className="w-full h-16 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: C.creamDeep }}>
                  <Sprout size={26} style={{ color: C.olive }} />
                </div>
                <div className="text-xs font-medium truncate" style={{ color: C.navy }}>{p.name}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{age} يوم · {stage}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ماذا أفعل الآن */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="text-sm font-semibold" style={{ color: C.navy }}>ماذا أسوي الحين؟</div>
          {isVerified && (
            <span className="text-[10px] rounded-full px-2 py-0.5" style={{ backgroundColor: C.creamDeep, color: C.olive }}>
              موثقة لنوء {nawa.name}
            </span>
          )}
        </div>
        {!isVerified && (
          <div className="text-[11px] text-gray-400 mb-2 px-1">
            توصية عامة لفصل {nawa?.season}، ما وصلنا معلومة موثقة خاصة بنوء {nawa?.name} تحديداً بعد
          </div>
        )}
        <div className="space-y-2">
          {tips.map((t, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <span className="text-xl">{t.icon}</span>
              <span className="text-sm" style={{ color: C.navy }}>{t.text}</span>
            </div>
          ))}
        </div>

        {/* ملاحظات المستخدم الخاصة بهذا النوء */}
        {myNotes.length > 0 && (
          <div className="space-y-2 mt-2">
            {myNotes.map((n, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-3" style={{ backgroundColor: "#FDF6E3" }}>
                <span className="text-xl">📝</span>
                <span className="text-sm" style={{ color: C.navy }}>{n}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder={`أضف ملاحظتك عن نوء ${nawa?.name || ""}...`}
            className="flex-1 rounded-xl px-3 py-2 text-xs outline-none bg-white"
            style={{ border: `1px solid ${C.creamDeep}` }}
          />
          <button
            onClick={() => { if (noteInput.trim() && nawa) { onAddNote(nawa.name, noteInput.trim()); setNoteInput(""); } }}
            className="rounded-xl px-3 text-xs text-white"
            style={{ backgroundColor: C.olive }}
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   مواسم غرس النخيل — شاشة تصفح كاملة
   ============================================================ */
function PalmSeasonsScreen({ onClose }) {
  const seasonsWithDates = useMemo(
    () => PALM_SEASONS.map((s) => ({ ...s, range: getPalmSeasonRange(s) })),
    []
  );
  const activeIdx = seasonsWithDates.findIndex((s) => s.range.isActive);
  const [openIdx, setOpenIdx] = useState(activeIdx >= 0 ? activeIdx : 0);
  const refs = useRef([]);

  useEffect(() => {
    if (activeIdx >= 0 && refs.current[activeIdx]) {
      refs.current[activeIdx].scrollIntoView({ block: "center" });
    }
  }, [activeIdx]);

  function fmt(d) {
    return d.toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long" });
  }

  function jump(dir) {
    setOpenIdx((prev) => {
      const next = (prev + dir + seasonsWithDates.length) % seasonsWithDates.length;
      refs.current[next]?.scrollIntoView({ block: "center" });
      return next;
    });
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: C.cream }}>
      <div className="flex items-center gap-3 px-4 py-4 shrink-0" style={{ backgroundColor: C.navy, color: C.cream }}>
        <button onClick={onClose}><ChevronRight size={22} /></button>
        <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-lg flex-1">مواسم غرس النخيل</div>
        <button onClick={() => jump(-1)} className="p-1"><ChevronLeft size={20} /></button>
        <button onClick={() => jump(1)} className="p-1"><ChevronRight size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {seasonsWithDates.map((s, i) => {
          const style = LEVEL_STYLES[s.level];
          const isOpen = openIdx === i;
          return (
            <div
              key={s.name}
              ref={(el) => (refs.current[i] = el)}
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ border: s.range.isActive ? `2px solid ${C.gold}` : "1px solid #eee2c8", backgroundColor: "#fff" }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between p-4 text-right"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: C.navy }}>{s.name}</span>
                    {s.range.isActive && (
                      <span className="text-[10px] rounded-full px-2 py-0.5" style={{ backgroundColor: C.gold, color: C.navyDeep }}>
                        الحين
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">{fmt(s.range.start)} — {fmt(s.range.end)}</div>
                </div>
                <ChevronLeft size={18} style={{ color: C.navy, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
              </button>

              <div className="px-4 pb-2">
                <span className="inline-block text-xs font-medium rounded-full px-3 py-1" style={{ backgroundColor: style.bg, color: style.color }}>
                  {style.badge}
                </span>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t pt-3" style={{ borderColor: "#F0EBDD" }}>
                  <p className="text-xs text-gray-400 mb-1">{s.summary}</p>
                  {s.details.map((d, di) => (
                    <div key={di}>
                      <div className="text-[11px] font-semibold" style={{ color: C.clay }}>{d.label}</div>
                      <div className="text-sm" style={{ color: C.navy }}>{d.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   خريطة المزرعة — مربعات / أجزاء / صفوف / خانات (توزيع سداسي)
   ============================================================ */
function FarmMapScreen({ layout, plants, onClose, findPlantAt, onOpenProfile, onAddAt, onAddBlock, onAddRow }) {
  const [blockIdx, setBlockIdx] = useState(0);
  const [sheet, setSheet] = useState(null); // { partIdx, rowIdx, posIdx, plant }
  const [showEditor, setShowEditor] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const block = layout[blockIdx];

  function openSlot(partIdx, rowIdx, posIdx) {
    const plant = findPlantAt(blockIdx, partIdx, rowIdx, posIdx);
    setSheet({ partIdx, rowIdx, posIdx, plant });
  }

  // إحصائيات الأصناف من النخيل الموثّق فعلياً
  const varietyCounts = useMemo(() => {
    const counts = {};
    plants.forEach((p) => {
      if (!p.location) return;
      const key = p.variety || p.type || "غير محدد";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [plants]);
  const documentedCount = plants.filter((p) => p.location).length;
  const total = farmTotal(layout);

  function renderPart(part, partIdx) {
    const rowIndices = Array.from({ length: part.rowCounts.length }, (_, i) => i).reverse(); // من الأسفل للأعلى
    return (
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold mb-2 text-center" style={{ color: C.navy }}>
          {part.name} <span className="font-normal text-gray-400">({part.rowCounts.reduce((a, b) => a + b, 0)})</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {rowIndices.map((rowIdx) => {
            const count = part.rowCounts[rowIdx];
            const isOffset = part.pattern === "hex" && (part.startOffset ? rowIdx % 2 === 0 : rowIdx % 2 === 1);
            return (
              <div key={rowIdx} className="flex items-center gap-1" style={{ marginRight: isOffset ? 7 : 0 }}>
                <span className="text-[8px] text-gray-300 w-3 shrink-0">{rowIdx + 1}</span>
                {Array.from({ length: count }).map((_, posIdx) => {
                  const plant = findPlantAt(blockIdx, partIdx, rowIdx, posIdx);
                  const dotColor = plant ? HEALTH_STYLES[plant.health || "healthy"].dot : "transparent";
                  return (
                    <button
                      key={posIdx}
                      onClick={() => openSlot(partIdx, rowIdx, posIdx)}
                      className="rounded-full shrink-0"
                      style={{ width: 13, height: 13, backgroundColor: dotColor, border: plant ? "none" : "1.5px solid #d8cead" }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: C.cream }}>
      <div className="flex items-center gap-3 px-4 py-4 shrink-0" style={{ backgroundColor: C.clay, color: C.cream }}>
        <button onClick={onClose}><ChevronRight size={22} /></button>
        <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-lg flex-1">خريطة المزرعة</div>
        <button onClick={() => setShowEditor(true)} className="text-xs rounded-full px-2.5 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          ✏️ الهيكل
        </button>
      </div>

      {/* بطاقة الإحصائيات */}
      <button onClick={() => setShowStats((s) => !s)} className="mx-4 mt-3 rounded-2xl bg-white shadow-sm p-3 text-right shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: C.navy }}>وثّقت {documentedCount} من {total} نخلة</span>
          <ChevronLeft size={14} style={{ transform: showStats ? "rotate(-90deg)" : "none", transition: "transform .2s" }} />
        </div>
        <div className="w-full h-1.5 rounded-full mt-2" style={{ backgroundColor: C.creamDeep }}>
          <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (documentedCount / total) * 100)}%`, backgroundColor: C.gold }} />
        </div>
        {showStats && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {varietyCounts.length === 0 && <span className="text-[11px] text-gray-400">ما فيه أصناف موثّقة بعد</span>}
            {varietyCounts.map(([name, count]) => (
              <span key={name} className="text-[11px] rounded-full px-2.5 py-1" style={{ backgroundColor: C.creamDeep, color: C.olive }}>
                {name}: {count}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* تبويب المربعات */}
      <div className="flex gap-2 px-4 py-3 shrink-0 flex-wrap">
        {layout.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setBlockIdx(i)}
            className="rounded-xl py-2 px-3 text-xs font-medium"
            style={{ backgroundColor: blockIdx === i ? C.navy : "#fff", color: blockIdx === i ? C.cream : C.navy, border: blockIdx === i ? "none" : "1px solid #eee2c8" }}
          >
            {b.name}
            <div className="text-[10px] opacity-70 mt-0.5">{b.note} · {blockTotal(b)}</div>
          </button>
        ))}
      </div>

      {/* دليل الألوان */}
      <div className="flex items-center gap-3 px-4 py-2 text-[10px] shrink-0" style={{ color: "#8a8272" }}>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: HEALTH_STYLES.healthy.dot }} /> سليمة</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: HEALTH_STYLES.stressed.dot }} /> متضررة</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: HEALTH_STYLES.dead.dot }} /> يابسة</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block border" style={{ borderColor: "#cfc4a6" }} /> فاضية</span>
      </div>

      {/* الشبكة — الأجزاء جنب بعض وبينها أنبوب الري */}
      <div className="flex-1 overflow-auto px-3 pb-6">
        {block ? (
          <div className="rounded-2xl bg-white shadow-sm p-3 flex gap-2 items-start">
            {block.parts.map((part, partIdx) => (
              <React.Fragment key={part.id}>
                {partIdx > 0 && (
                  <div className="w-1 rounded-full self-stretch shrink-0" style={{ backgroundColor: "#4A6FA5", opacity: 0.5 }} title="أنبوب الري الرئيسي" />
                )}
                {renderPart(part, partIdx)}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 text-center py-10">ما فيه مربعات بعد</div>
        )}
      </div>

      {sheet && (
        <SlotSheet
          address={slotAddress(blockIdx, sheet.partIdx, sheet.rowIdx, sheet.posIdx)}
          plant={sheet.plant}
          onClose={() => setSheet(null)}
          onAdd={() => {
            onAddAt({ b: blockIdx, p: sheet.partIdx, r: sheet.rowIdx, s: sheet.posIdx });
            setSheet(null);
          }}
          onOpenProfile={() => {
            onOpenProfile(sheet.plant.id);
            setSheet(null);
          }}
        />
      )}

      {showEditor && (
        <FarmStructureEditor
          layout={layout}
          onClose={() => setShowEditor(false)}
          onAddBlock={onAddBlock}
          onAddRow={onAddRow}
        />
      )}
    </div>
  );
}

/* ============================================================
   إدارة هيكل المزرعة — إضافة مربع / صف جديد
   ============================================================ */
function FarmStructureEditor({ layout, onClose, onAddBlock, onAddRow }) {
  const [tab, setTab] = useState("rows"); // rows | newBlock
  const [selBlock, setSelBlock] = useState(0);
  const [selPart, setSelPart] = useState(0);
  const [rowCount, setRowCount] = useState("5");

  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [partsConfig, setPartsConfig] = useState(["hex", "hex"]); // نمط كل جزء بالترتيب

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: C.cream }}>
      <style>{`.modal-input{ width:100%; border-radius:12px; padding:10px 14px; font-size:14px; border:1px solid #e5ddc9; background:#fff; outline:none; }`}</style>
      <div className="flex items-center gap-3 px-4 py-4 shrink-0" style={{ backgroundColor: C.navy, color: C.cream }}>
        <button onClick={onClose}><ChevronRight size={22} /></button>
        <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-lg">إدارة هيكل المزرعة</div>
      </div>

      <div className="flex gap-2 px-4 py-3 shrink-0">
        <button onClick={() => setTab("rows")} className="flex-1 rounded-xl py-2 text-xs font-medium" style={{ backgroundColor: tab === "rows" ? C.navy : "#fff", color: tab === "rows" ? C.cream : C.navy, border: tab === "rows" ? "none" : "1px solid #eee2c8" }}>➕ أضف صف</button>
        <button onClick={() => setTab("newBlock")} className="flex-1 rounded-xl py-2 text-xs font-medium" style={{ backgroundColor: tab === "newBlock" ? C.navy : "#fff", color: tab === "newBlock" ? C.cream : C.navy, border: tab === "newBlock" ? "none" : "1px solid #eee2c8" }}>➕ مربع جديد</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {tab === "rows" && (
          <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
            <Field label="المربع">
              <select value={selBlock} onChange={(e) => { setSelBlock(Number(e.target.value)); setSelPart(0); }} className="modal-input">
                {layout.map((b, i) => <option key={b.id} value={i}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="الجزء">
              <select value={selPart} onChange={(e) => setSelPart(Number(e.target.value))} className="modal-input">
                {layout[selBlock]?.parts.map((p, i) => <option key={p.id} value={i}>{p.name} ({p.pattern === "hex" ? "سداسي" : "رباعي"})</option>)}
              </select>
            </Field>
            <Field label="عدد النخيل بالصف الجديد">
              <input type="number" min="1" value={rowCount} onChange={(e) => setRowCount(e.target.value)} className="modal-input" />
            </Field>
            <div className="text-[11px] text-gray-400">
              الصف الجديد سيُضاف كآخر صف (أقصى الجنوب) — يحتوي حالياً {layout[selBlock]?.parts[selPart]?.rowCounts.length || 0} صف
            </div>
            <button
              onClick={() => { const c = Number(rowCount); if (c > 0) onAddRow(selBlock, selPart, c); }}
              className="w-full rounded-xl py-3 text-white font-medium"
              style={{ backgroundColor: C.olive }}
            >
              أضف الصف
            </button>
          </div>
        )}

        {tab === "newBlock" && (
          <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
            <Field label="اسم المربع"><input value={newName} onChange={(e) => setNewName(e.target.value)} className="modal-input" placeholder="المربع الرابع" /></Field>
            <Field label="ملاحظة الموقع"><input value={newNote} onChange={(e) => setNewNote(e.target.value)} className="modal-input" placeholder="مثلاً: شرق" /></Field>

            <div className="text-xs text-gray-400 mb-1">أجزاء المربع ({partsConfig.length})</div>
            {partsConfig.map((pattern, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16 shrink-0">الجزء {i + 1}</span>
                <select
                  value={pattern}
                  onChange={(e) => setPartsConfig((prev) => prev.map((p, pi) => (pi === i ? e.target.value : p)))}
                  className="modal-input"
                >
                  <option value="hex">سداسي (خلية نحل)</option>
                  <option value="square">رباعي (صفوف منتظمة)</option>
                </select>
                {partsConfig.length > 1 && (
                  <button
                    onClick={() => setPartsConfig((prev) => prev.filter((_, pi) => pi !== i))}
                    className="shrink-0 text-red-400 px-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setPartsConfig((prev) => [...prev, "hex"])}
              className="w-full rounded-xl py-2 text-xs font-medium"
              style={{ backgroundColor: C.creamDeep, color: C.clay }}
            >
              ➕ أضف جزء آخر
            </button>

            <div className="text-[11px] text-gray-400">بعد الإنشاء، تقدر تضيف الصفوف من تبويب "أضف صف"</div>
            <button
              onClick={() => { if (newName.trim()) { onAddBlock(newName.trim(), newNote.trim(), partsConfig); setNewName(""); setNewNote(""); setPartsConfig(["hex", "hex"]); setTab("rows"); } }}
              className="w-full rounded-xl py-3 text-white font-medium"
              style={{ backgroundColor: C.clay }}
            >
              أنشئ المربع
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SlotSheet({ address, plant, onClose, onAdd, onOpenProfile }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(28,37,65,0.5)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl p-5 pb-8" style={{ backgroundColor: C.cream }}>
        <div className="text-xs text-gray-400 mb-1">عنوان الخانة</div>
        <div className="text-lg font-semibold mb-4" style={{ color: C.navy, fontFamily: "'Aref Ruqaa', serif" }}>{address}</div>

        {plant ? (
          <div>
            <div className="rounded-2xl bg-white p-4 shadow-sm mb-3">
              <div className="font-medium text-sm" style={{ color: C.navy }}>{plant.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                {plant.type}{plant.variety ? ` · ${plant.variety}` : ""} · {computeAge(plant.plantDate)} يوم · {computeStage(plant.type, computeAge(plant.plantDate))}
              </div>
              <span
                className="inline-block text-xs font-medium rounded-full px-3 py-1 mt-2"
                style={{ backgroundColor: HEALTH_STYLES[plant.health || "healthy"].bg, color: HEALTH_STYLES[plant.health || "healthy"].color }}
              >
                {HEALTH_STYLES[plant.health || "healthy"].label}
              </span>
            </div>
            <button onClick={onOpenProfile} className="w-full rounded-xl py-3 text-white font-medium" style={{ backgroundColor: C.olive }}>
              افتح الملف الكامل
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-400 mb-4">خانة فاضية، ما فيها نخلة مسجّلة بعد</div>
            <button onClick={onAdd} className="w-full rounded-xl py-3 text-white font-medium flex items-center justify-center gap-2" style={{ backgroundColor: C.clay }}>
              <Plus size={16} /> أضف نخلة هنا
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ملف النخلة — سجل تطور زمني
   ============================================================ */
function PalmProfileScreen({ plant, logs, onClose, onAddCondition, onReplace, onRemove }) {
  const [note, setNote] = useState("");
  const [health, setHealth] = useState(plant?.health || "healthy");
  const [showReplace, setShowReplace] = useState(false);
  const [replaceCategory, setReplaceCategory] = useState("شجرة مثمرة");
  const [replaceVariety, setReplaceVariety] = useState(REPLACEMENT_CATEGORIES["شجرة مثمرة"][0]);

  if (!plant) return null;
  const age = computeAge(plant.plantDate);
  const stage = computeStage(plant.type, age);
  const timeline = [...logs].filter((l) => l.type === "تقييم حالة").sort((a, b) => new Date(b.date) - new Date(a.date));
  const address = plant.location ? slotAddress(plant.location.b, plant.location.p, plant.location.r, plant.location.s) : null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: C.cream }}>
      <div className="flex items-center gap-3 px-4 py-4 shrink-0" style={{ backgroundColor: C.navy, color: C.cream }}>
        <button onClick={onClose}><ChevronRight size={22} /></button>
        <div>
          <div style={{ fontFamily: "'Aref Ruqaa', serif" }} className="text-lg">{plant.name}</div>
          {address && <div className="text-[11px] opacity-60">{address}</div>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium" style={{ color: C.navy }}>
              {plant.type}{plant.variety ? ` · ${plant.variety}` : ""} · {age} يوم
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{stage}</div>
          </div>
          <span
            className="text-xs font-medium rounded-full px-3 py-1"
            style={{ backgroundColor: HEALTH_STYLES[health].bg, color: HEALTH_STYLES[health].color }}
          >
            {HEALTH_STYLES[health].label}
          </span>
        </div>

        {/* إضافة تقييم جديد */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="text-xs font-medium text-gray-400 mb-2">أضف تقييم حالة اليوم</div>
          <div className="flex gap-2 mb-3">
            {Object.entries(HEALTH_STYLES).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setHealth(key)}
                className="flex-1 text-xs rounded-xl py-2 font-medium"
                style={{ backgroundColor: health === key ? s.color : C.creamDeep, color: health === key ? "#fff" : s.color }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثال: متبقي فيها 3 جريد أخضر والباقي ناشف"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: `1px solid ${C.creamDeep}`, minHeight: 70 }}
          />
          <button
            onClick={() => { if (note.trim()) { onAddCondition(note.trim(), health); setNote(""); } }}
            className="w-full mt-2 rounded-xl py-2.5 text-white text-sm font-medium"
            style={{ backgroundColor: C.olive }}
          >
            احفظ التقييم
          </button>
        </div>

        {/* إلغاء واستبدال / إزالة نهائية */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          {!showReplace ? (
            <div className="flex gap-2">
              <button onClick={() => setShowReplace(true)} className="flex-1 text-xs rounded-xl py-2.5 font-medium" style={{ backgroundColor: C.creamDeep, color: C.clay }}>
                🔄 إلغاء واستبدال
              </button>
              <button onClick={onRemove} className="flex-1 text-xs rounded-xl py-2.5 font-medium" style={{ backgroundColor: "#FBEAE0", color: "#B0402B" }}>
                🗑️ تفريغ الخانة
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-400">استبدال هذه الخانة بغرسة جديدة</div>
              <select
                value={replaceCategory}
                onChange={(e) => { setReplaceCategory(e.target.value); setReplaceVariety(REPLACEMENT_CATEGORIES[e.target.value][0]); }}
                className="modal-input"
              >
                {Object.keys(REPLACEMENT_CATEGORIES).map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={replaceVariety} onChange={(e) => setReplaceVariety(e.target.value)} className="modal-input">
                {REPLACEMENT_CATEGORIES[replaceCategory].map((v) => <option key={v}>{v}</option>)}
              </select>
              <style>{`.modal-input{ width:100%; border-radius:12px; padding:10px 14px; font-size:14px; border:1px solid #e5ddc9; background:#fff; outline:none; }`}</style>
              <div className="flex gap-2">
                <button onClick={() => setShowReplace(false)} className="flex-1 text-xs rounded-xl py-2.5" style={{ backgroundColor: C.creamDeep, color: C.navy }}>تراجع</button>
                <button
                  onClick={() => { onReplace(replaceCategory, replaceVariety); setShowReplace(false); }}
                  className="flex-1 text-xs rounded-xl py-2.5 text-white font-medium"
                  style={{ backgroundColor: C.clay }}
                >
                  أكّد الاستبدال
                </button>
              </div>
            </div>
          )}
        </div>

        {/* الخط الزمني */}
        <div>
          <div className="text-sm font-semibold mb-2 px-1" style={{ color: C.navy }}>الخط الزمني</div>
          {timeline.length === 0 && <div className="text-xs text-gray-400 text-center py-6">ما فيه تقييمات مسجلة بعد</div>}
          <div className="space-y-2">
            {timeline.map((t) => (
              <div key={t.id} className="rounded-2xl bg-white shadow-sm p-3">
                <div className="text-[11px] text-gray-400 mb-1">{new Date(t.date).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" })}</div>
                <div className="text-sm" style={{ color: C.navy }}>{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   سجل المزرعة
   ============================================================ */
function MyFarm({ plants, logs, farmLayout, onAdd, onOpenPalmSeasons, onOpenFarmMap }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold" style={{ color: C.navy, fontFamily: "'Aref Ruqaa', serif" }}>مزرعتك</div>
        <button onClick={onAdd} className="flex items-center gap-1 text-xs font-medium rounded-full px-3 py-2 text-white" style={{ backgroundColor: C.olive }}>
          <Plus size={14} /> نبتة جديدة
        </button>
      </div>

      <button
        onClick={onOpenFarmMap}
        className="w-full flex items-center justify-between rounded-2xl p-4 mb-3 shadow-sm"
        style={{ backgroundColor: C.clay, color: C.cream }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={18} style={{ color: C.goldSoft }} />
          <div className="text-right">
            <div className="text-sm font-medium">خريطة المزرعة</div>
            <div className="text-[10px] opacity-75">{farmTotal(farmLayout)} نخلة موزعة على {farmLayout.length} مربعات</div>
          </div>
        </div>
        <ChevronLeft size={16} />
      </button>

      <button
        onClick={onOpenPalmSeasons}
        className="w-full flex items-center justify-between rounded-2xl p-4 mb-3 shadow-sm"
        style={{ backgroundColor: C.navy, color: C.cream }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={18} style={{ color: C.gold }} />
          <span className="text-sm font-medium">مواسم غرس النخيل</span>
        </div>
        <ChevronLeft size={16} />
      </button>

      <div className="space-y-3">
        {plants.map((p) => {
          const age = computeAge(p.plantDate);
          const stage = computeStage(p.type, age);
          const plantLogs = logs.filter((l) => l.plantId === p.id);
          const totalCost = plantLogs.reduce((s, l) => s + (Number(l.cost) || 0), 0);
          return (
            <div key={p.id} className="rounded-2xl bg-white shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.creamDeep }}>
                  <Trees size={22} style={{ color: C.olive }} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: C.navy }}>{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.type} · غُرست قبل {age} يوم</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: C.creamDeep, color: C.navy }}>{stage}</span>
                <span className="flex items-center gap-1 text-gray-400"><Wallet size={13} /> {totalCost} ر.س</span>
                <span className="flex items-center gap-1 text-gray-400"><NotebookText size={13} /> {plantLogs.length} عملية</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   دفتر العمليات
   ============================================================ */
function Logbook({ plants, logs, onAdd }) {
  const [filter, setFilter] = useState("الكل");
  const types = ["الكل", "ري", "تسميد", "مكافحة", "غرس", "تقييم حالة"];
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = filter === "الكل" ? sorted : sorted.filter((l) => l.type === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold" style={{ color: C.navy, fontFamily: "'Aref Ruqaa', serif" }}>دفتر العمليات</div>
      </div>
      <div className="flex gap-2 overflow-x-auto mb-3 pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{
              backgroundColor: filter === t ? C.navy : "#fff",
              color: filter === t ? C.cream : C.navy,
              border: `1px solid ${filter === t ? C.navy : "#e5ddc9"}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-sm text-gray-400 text-center py-10">ما فيه عمليات مسجلة بعد</div>}
        {filtered.map((l) => {
          const plant = plants.find((p) => p.id === l.plantId);
          return (
            <div key={l.id} className="rounded-2xl bg-white shadow-sm p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: C.creamDeep }}>
                {l.type === "ري" ? <Droplets size={16} style={{ color: C.navy }} /> : l.type === "تسميد" ? <Sprout size={16} style={{ color: C.olive }} /> : <Leaf size={16} style={{ color: C.clay }} />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: C.navy }}>{l.type} — {plant?.name || "غير محدد"}</div>
                <div className="text-[11px] text-gray-400">{new Date(l.date).toLocaleDateString("ar-SA")}{l.note ? ` · ${l.note}` : ""}</div>
              </div>
              {l.cost > 0 && <div className="text-xs text-gray-400">{l.cost} ر.س</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   طبيب النباتات — Claude Vision
   ============================================================ */
function PlantDoctor() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const base64Data = image.split(",")[1];
      const mediaType = image.substring(image.indexOf(":") + 1, image.indexOf(";"));

      const response = await fetch("/api/plant-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mediaType }),
      });
      const data = await response.json();
      const clean = (data.text || "{}").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("ما قدرنا نحلل الصورة الحين، جرب مرة ثانية");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-lg font-semibold mb-1" style={{ color: C.navy, fontFamily: "'Aref Ruqaa', serif" }}>طبيب النباتات</div>
      <p className="text-xs text-gray-400 mb-4">صوّر النبتة المريضة وخلّي الذكاء الاصطناعي يشخّص لك المشكلة</p>

      <div
        onClick={() => fileRef.current?.click()}
        className="rounded-3xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer"
        style={{ borderColor: C.gold, backgroundColor: "#fff" }}
      >
        {image ? (
          <img src={image} alt="النبتة" className="max-h-48 rounded-2xl object-cover" />
        ) : (
          <>
            <Camera size={30} style={{ color: C.gold }} />
            <span className="text-sm mt-2 text-gray-400">اضغط لرفع أو تصوير النبتة</span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      {image && (
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full mt-4 rounded-2xl py-3 font-medium text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: C.olive, opacity: loading ? 0.7 : 1 }}
        >
          <Sparkles size={18} /> {loading ? "يحلل الصورة..." : "حلّلها بالذكاء الاصطناعي"}
        </button>
      )}

      {error && <div className="text-sm text-red-500 mt-3 text-center">{error}</div>}

      {result && (
        <div className="rounded-3xl bg-white shadow-md p-5 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold" style={{ color: C.navy }}>{result.problem}</div>
            {typeof result.confidence === "number" && (
              <span className="text-xs rounded-full px-2.5 py-1" style={{ backgroundColor: C.creamDeep, color: C.clay }}>
                ثقة {result.confidence}%
              </span>
            )}
          </div>
          {result.symptoms?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-400 mb-1">الأعراض</div>
              <ul className="text-sm space-y-1" style={{ color: C.navy }}>
                {result.symptoms.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
          {result.treatment && (
            <div>
              <div className="text-xs font-medium text-gray-400 mb-1">خطة العلاج</div>
              <p className="text-sm" style={{ color: C.navy }}>{result.treatment}</p>
            </div>
          )}
          <div className="text-[11px] text-gray-400 pt-2 border-t">
            هذا تحليل استرشادي بالذكاء الاصطناعي، وما يغني عن استشارة مختص زراعي عند الشك
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   المزيد: الإعدادات + المقارنة
   ============================================================ */
function MoreScreen({ kunya, setKunya, plants, logs }) {
  const [editKunya, setEditKunya] = useState(kunya);

  function exportBackup() {
    const data = JSON.stringify({ plants, logs, kunya }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mawasem-backup.json";
    a.click();
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-lg font-semibold mb-3" style={{ color: C.navy, fontFamily: "'Aref Ruqaa', serif" }}>الإعدادات</div>
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="text-xs text-gray-400 mb-2">كنيتك</div>
          <div className="flex gap-2">
            <input
              value={editKunya}
              onChange={(e) => setEditKunya(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border: `1px solid ${C.creamDeep}` }}
              placeholder="أبو راكان"
            />
            <button onClick={() => setKunya(editKunya)} className="rounded-xl px-4 text-sm text-white" style={{ backgroundColor: C.navy }}>
              حفظ
            </button>
          </div>
        </div>
        <button onClick={exportBackup} className="w-full mt-3 rounded-2xl bg-white shadow-sm p-4 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: C.navy }}>تنزيل نسخة احتياطية</span>
          <span className="text-xs text-gray-400">JSON</span>
        </button>
        <div className="text-[11px] text-gray-400 mt-2 px-1">
          بالنسخة المنشورة على الخادم، بياناتك بتنحفظ تلقائياً بالسحابة برضو — ما تحتاج تصدّرها يدوي كل مرة
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold mb-3" style={{ color: C.navy, fontFamily: "'Aref Ruqaa', serif" }}>ليش مواسم؟</div>
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <ComparisonRow label="لغة عربية كاملة" mawasem={true} others={false} />
          <ComparisonRow label="التقويم الفلكي (الأنواء)" mawasem={true} others={false} />
          <ComparisonRow label="ربط الطقس بالنوء والتوصية" mawasem={true} others={false} />
          <ComparisonRow label="تشخيص نباتات بالذكاء الاصطناعي" mawasem={true} others={true} />
          <ComparisonRow label="تذكيرات مبنية على مرحلة نمو النبتة" mawasem={true} others={false} last />
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, mawasem, others, last }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${!last ? "border-b" : ""}`} style={{ borderColor: "#F0EBDD" }}>
      <span className="text-sm flex-1" style={{ color: C.navy }}>{label}</span>
      <span className="w-16 text-center text-xs font-medium" style={{ color: C.olive }}>{mawasem ? "✓ مواسم" : "—"}</span>
      <span className="w-16 text-center text-xs text-gray-300">{others ? "✓" : "✗"}</span>
    </div>
  );
}

/* ============================================================
   نوافذ الإضافة
   ============================================================ */
function AddPlantModal({ onClose, onSave, initialLocation }) {
  const defaultName = initialLocation
    ? `نخلة ${slotAddress(initialLocation.b, initialLocation.p, initialLocation.r, initialLocation.s)}`
    : "";
  const [name, setName] = useState(defaultName);
  const [type, setType] = useState("نخلة");
  const [variety, setVariety] = useState(PALM_VARIETIES[0]);
  const [customVariety, setCustomVariety] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const isPalm = type === "نخلة";
  const altList = REPLACEMENT_CATEGORIES[type];

  return (
    <Modal onClose={onClose} title="نبتة جديدة">
      {initialLocation && (
        <div className="text-xs rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: C.creamDeep, color: C.clay }}>
          📍 الموقع: {slotAddress(initialLocation.b, initialLocation.p, initialLocation.r, initialLocation.s)}
        </div>
      )}
      <Field label="اسم النبتة"><input value={name} onChange={(e) => setName(e.target.value)} className="modal-input" placeholder="نخلة الفناء الشرقي" /></Field>
      <Field label="النوع">
        <select value={type} onChange={(e) => setType(e.target.value)} className="modal-input">
          <option>نخلة</option>
          <option>شجرة مثمرة</option>
          <option>شجرة زينة</option>
          <option>حمضيات</option>
          <option>خضروات</option>
          <option>أخرى</option>
        </select>
      </Field>

      {isPalm && (
        <Field label="صنف النخلة">
          <select value={variety} onChange={(e) => setVariety(e.target.value)} className="modal-input">
            {PALM_VARIETIES.map((v) => <option key={v}>{v}</option>)}
            <option value="أخرى">أخرى (اكتبها)</option>
          </select>
          {variety === "أخرى" && (
            <input value={customVariety} onChange={(e) => setCustomVariety(e.target.value)} className="modal-input mt-2" placeholder="اكتب اسم الصنف" />
          )}
        </Field>
      )}

      {altList && (
        <Field label="اسم النوع">
          <select value={variety} onChange={(e) => setVariety(e.target.value)} className="modal-input">
            {altList.map((v) => <option key={v}>{v}</option>)}
            <option value="أخرى">أخرى (اكتبها)</option>
          </select>
          {variety === "أخرى" && (
            <input value={customVariety} onChange={(e) => setCustomVariety(e.target.value)} className="modal-input mt-2" placeholder="اكتب اسم النوع" />
          )}
        </Field>
      )}

      <Field label="تاريخ الغرس"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="modal-input" /></Field>
      <button
        onClick={() => {
          if (!name) return;
          const finalVariety = (isPalm || altList) ? (variety === "أخرى" ? customVariety : variety) : "";
          onSave({ name, type, variety: finalVariety, plantDate: new Date(date).toISOString(), photo: null, location: initialLocation || null });
        }}
        className="w-full mt-2 rounded-xl py-3 text-white font-medium"
        style={{ backgroundColor: C.olive }}
      >
        أضف النبتة
      </button>
    </Modal>
  );
}

function AddLogModal({ plants, onClose, onSave }) {
  const [plantId, setPlantId] = useState(plants[0]?.id || "");
  const [type, setType] = useState("ري");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");

  return (
    <Modal onClose={onClose} title="تسجيل عملية">
      <Field label="النبتة">
        <select value={plantId} onChange={(e) => setPlantId(Number(e.target.value))} className="modal-input">
          {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="نوع العملية">
        <select value={type} onChange={(e) => setType(e.target.value)} className="modal-input">
          <option>ري</option>
          <option>تسميد</option>
          <option>مكافحة</option>
          <option>غرس</option>
          <option>تقييم حالة</option>
        </select>
      </Field>
      <Field label="التكلفة (اختياري)"><input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="modal-input" placeholder="0" /></Field>
      <Field label="ملاحظة (اختياري)"><input value={note} onChange={(e) => setNote(e.target.value)} className="modal-input" placeholder="نوع السماد مثلاً" /></Field>
      <button
        onClick={() => onSave({ plantId, type, cost: Number(cost) || 0, note, date: new Date().toISOString() })}
        className="w-full mt-2 rounded-xl py-3 text-white font-medium"
        style={{ backgroundColor: C.clay }}
      >
        سجّل العملية
      </button>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(28,37,65,0.5)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl p-5 pb-8"
        style={{ backgroundColor: C.cream, maxHeight: "85%", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold" style={{ color: C.navy, fontFamily: "'Aref Ruqaa', serif" }}>{title}</div>
          <button onClick={onClose}><X size={20} style={{ color: C.navy }} /></button>
        </div>
        <style>{`.modal-input{ width:100%; border-radius:12px; padding:10px 14px; font-size:14px; border:1px solid #e5ddc9; background:#fff; outline:none; }`}</style>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   شريط التنقل السفلي
   ============================================================ */
function BottomNav({ tab, setTab }) {
  const items = [
    { id: "home", label: "الرئيسية", icon: HomeIcon },
    { id: "farm", label: "مزرعتي", icon: Trees },
    { id: "logbook", label: "الدفتر", icon: NotebookText },
    { id: "doctor", label: "الطبيب", icon: Stethoscope },
    { id: "more", label: "المزيد", icon: Settings },
  ];
  return (
    <div className="w-full bg-white border-t flex items-center justify-around py-2" style={{ borderColor: "#F0EBDD" }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center gap-1 px-2 py-1">
            <Icon size={20} style={{ color: active ? C.olive : "#B8AF9C" }} />
            <span className="text-[10px]" style={{ color: active ? C.olive : "#B8AF9C" }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
