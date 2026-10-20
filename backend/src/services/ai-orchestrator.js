import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { streamGeminiVision } from './gemini.service.js';
import { streamGroqVision } from './groq.service.js';

class AIOrchestrator {
  constructor() {
    this.geminiCooldownUntil = 0;
  }

  isGeminiCoolingDown() {
    return Date.now() < this.geminiCooldownUntil;
  }

  getCooldownRemainingSeconds() {
    const remaining = Math.max(0, this.geminiCooldownUntil - Date.now());
    return Math.ceil(remaining / 1000);
  }

  async streamAnalyze({ prompt, image, userGeminiKey, userGroqKey }, onToken, onMeta) {
    const activeGeminiKey = userGeminiKey || config.geminiApiKey;
    const activeGroqKey = userGroqKey || config.groqApiKey;

    const geminiAvailable = Boolean(activeGeminiKey) && !this.isGeminiCoolingDown();

    // 1. Attempt Primary Provider: Gemini 1.5 Flash
    if (geminiAvailable) {
      try {
        logger.info('Routing request to Primary Provider: Gemini 1.5 Flash');
        if (onMeta) onMeta({ provider: 'gemini-1.5-flash', fallback: false });

        let tokenEmitted = false;
        await streamGeminiVision({
          apiKey: activeGeminiKey,
          prompt,
          image,
          onToken: (token) => {
            tokenEmitted = true;
            onToken(token);
          },
        });

        return { provider: 'gemini-1.5-flash', success: true };
      } catch (err) {
        const isRateLimit =
          err.status === 429 ||
          err.message?.includes('RESOURCE_EXHAUSTED') ||
          err.message?.includes('quota') ||
          err.message?.includes('rate limit');

        if (isRateLimit) {
          this.geminiCooldownUntil = Date.now() + config.geminiCooldownMs;
          logger.warn(
            `Gemini rate limit (429) hit. Cooldown initiated for ${config.geminiCooldownMs / 1000}s. Failing over to Groq...`
          );
        } else {
          logger.warn(`Gemini error (${err.message}). Attempting failover to Groq...`);
        }
      }
    } else if (this.isGeminiCoolingDown()) {
      logger.info(
        `Gemini is currently on cooldown (${this.getCooldownRemainingSeconds()}s remaining). Routing directly to Groq.`
      );
    }

    // 2. Failover Provider: Groq Llama 3.2 Vision
    if (activeGroqKey) {
      try {
        logger.info('Routing request to Failover Provider: Groq Llama 3.2 Vision');
        if (onMeta) {
          onMeta({
            provider: 'groq-llama-3.2-vision',
            fallback: true,
            reason: this.isGeminiCoolingDown()
              ? `Gemini cooldown active (${this.getCooldownRemainingSeconds()}s left)`
              : 'Gemini unavailable',
          });
        }

        await streamGroqVision({
          apiKey: activeGroqKey,
          prompt,
          image,
          onToken,
        });

        return { provider: 'groq-llama-3.2-vision', success: true, fallback: true };
      } catch (groqErr) {
        logger.error('Groq failover also encountered an error:', groqErr.message);
        throw new Error(`Both primary and fallback AI providers failed. Groq error: ${groqErr.message}`);
      }
    }

    // 3. Neither provider succeeded or configured
    throw new Error(
      'No vision AI providers available. Please set GEMINI_API_KEY or GROQ_API_KEY in backend/.env or provide one in settings.'
    );
  }
}

export const orchestrator = new AIOrchestrator();
