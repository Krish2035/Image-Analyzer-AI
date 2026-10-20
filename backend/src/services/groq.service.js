import Groq from 'groq-sdk';

const SYSTEM_INSTRUCTION = `You are an elite Visual AI Analyst with supreme OCR, code comprehension, and technical troubleshooting abilities. When provided a screenshot:
1. Identify the exact context (IDE error, terminal log, UI mockup, database diagram, math/science problem, etc.).
2. Quote exact error lines or visual elements.
3. Identify the underlying root cause with first-principles reasoning.
4. Provide immediate, corrected, production-ready code or clear step-by-step solutions formatted in Markdown.
5. Never be vague or sycophantic; give honest, rigorous engineering assessments.`;

export async function streamGroqVision({ apiKey, prompt, image, onToken }) {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const groq = new Groq({ apiKey });

  const contentParts = [];

  if (image && image.dataUri) {
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: image.dataUri,
      },
    });
  }

  contentParts.push({
    type: 'text',
    text: prompt || 'Analyze this image in detail and explain everything you observe.',
  });

  const stream = await groq.chat.completions.create({
    model: 'qwen/qwen3.8-27b',
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: contentParts },
    ],
    stream: true,
    temperature: 0.2,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    if (token) {
      onToken(token);
    }
  }
}
