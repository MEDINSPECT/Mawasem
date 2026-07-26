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
<div className="text-xs font-semibold mb-2 text-c
