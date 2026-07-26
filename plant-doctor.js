// دالة وسيطة تعمل على خوادم Vercel — تخزّن مفتاح Claude API بأمان
// ولا تكشفه أبداً للمتصفح. التطبيق يكلّم هذا الملف بدل ما يكلّم Anthropic مباشرة.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, mediaType } = req.body;
  if (!image || !mediaType) {
    return res.status(400).json({ error: "الصورة مطلوبة" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              {
                type: "text",
                text:
                  "أنت خبير زراعي. حلّل صورة النبات هذه وحدد إن كان فيه مرض أو آفة. أجب فقط بصيغة JSON خام بدون أي شرح إضافي وبدون Markdown، بالمفاتيح التالية: problem (اسم المشكلة بالعربي)، confidence (نسبة ثقة من 0 إلى 100)، symptoms (مصفوفة نصوص قصيرة بالعربي)، treatment (نص عربي بخطة العلاج). إن كان النبات سليماً اجعل problem = \"لا توجد مشكلة ظاهرة\".",
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const textBlock = data.content?.find((b) => b.type === "text")?.text || "{}";
    return res.status(200).json({ text: textBlock });
  } catch (e) {
    return res.status(500).json({ error: "تعذّر تحليل الصورة" });
  }
}
