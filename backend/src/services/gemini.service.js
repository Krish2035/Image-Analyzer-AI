import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `You are an elite Visual AI Analyst with supreme OCR, code comprehension, and technical troubleshooting abilities. When provided a screenshot:
1. Identify the exact context (IDE error, terminal log, UI mockup, database diagram, math/science problem, etc.).
2. Quote exact error lines or visual elements.
3. Identify the underlying root cause with first-principles reasoning.
4. Provide immediate, corrected, production-ready code or clear step-by-step solutions formatted in Markdown.
5. Never be vague or sycophantic; give honest, rigorous engineering assessments.`;

export async function streamGeminiVision({ apiKey, prompt, image, onToken }) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const contentParts = [];

  if (image && image.cleanBase64) {
    contentParts.push({
      inlineData: {
        data: image.cleanBase64,
        mimeType: image.mimeType,
      },
    });
  }

  contentParts.push(prompt || 'Analyze this image in detail and explain everything you observe.');

  const responseStream = await model.generateContentStream(contentParts);

  for await (const chunk of responseStream.stream) {
    const text = chunk.text();
    if (text) {
      onToken(text);
    }
  }
}
