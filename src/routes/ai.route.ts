import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const aiRouter = Router();

const aiController = new AIController();

aiRouter.post('/stream', aiController.streamConsultation);

export default aiRouter;