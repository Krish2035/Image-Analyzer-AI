import { orchestrator } from '../services/ai-orchestrator.js';
import { parseBase64Image } from '../utils/image-helper.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export async function handleChatStream(req, res) {
  const { prompt, image, userGeminiKey, userGroqKey } = req.body || {};

  if (!prompt && !image) {
    return res.status(400).json({ error: 'Either prompt text or an image is required.' });
  }

  let parsedImage = null;
  if (image) {
    try {
      parsedImage = parseBase64Image(image, config.maxImageSizeMb);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Set SSE streaming headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let clientClosed = false;
  req.on('close', () => {
    clientClosed = true;
  });

  const sendEvent = (data) => {
    if (!clientClosed) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    await orchestrator.streamAnalyze(
      {
        prompt: prompt?.trim(),
        image: parsedImage,
        userGeminiKey,
        userGroqKey,
      },
      (token) => {
        sendEvent({ type: 'token', token });
      },
      (meta) => {
        sendEvent({ type: 'meta', ...meta });
      }
    );

    if (!clientClosed) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    logger.error('Stream processing failed:', err.message);
    if (!clientClosed) {
      sendEvent({ type: 'error', error: err.message });
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}

export function handleHealthCheck(req, res) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: {
      gemini: {
        configured: Boolean(config.geminiApiKey),
        coolingDown: orchestrator.isGeminiCoolingDown(),
        cooldownRemainingSeconds: orchestrator.getCooldownRemainingSeconds(),
      },
      groq: {
        configured: Boolean(config.groqApiKey),
      },
    },
  });
}
