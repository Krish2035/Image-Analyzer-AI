import { Router } from 'express';
import { handleChatStream, handleHealthCheck } from '../controllers/chat.controller.js';

const router = Router();

router.post('/chat/stream', handleChatStream);
router.get('/health', handleHealthCheck);

export default router;
