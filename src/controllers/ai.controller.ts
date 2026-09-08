import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { GeminiProvider } from '../providers/gemini.provider';
import { RagProductService } from '../services/rag-product.service';

export class AIController {
    private aiService: AIService;
    private ragService: RagProductService;

    constructor() {
        // Tiêm GeminiProvider vào AIService. Khi cần đổi sang OpenAI, chỉ cần thay đổi dòng này.
        const provider = new GeminiProvider();
        this.ragService = new RagProductService(provider);
        this.aiService = new AIService(provider, this.ragService);

        this.ragService.initializeVectorStore().catch(err => {
            console.error('[AIController Error] Lỗi khởi tạo Vector Store:', err);
        });
    }

    /**
     * API Stream Handler: POST /api/v1/ai/stream
     * Xử lý gửi phản hồi văn bản theo thời gian thực (SSE)
     */
    public streamConsultation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { prompt } = req.body;

            if (!prompt) {
                res.status(400).json({ success: false, message: 'Thiếu tham số prompt.' });
                return;
            }

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            // Lấy AsyncIterator từ Service
            const textStream = await this.aiService.streamProductConsultation(prompt);
            // Duyệt qua từng đoạn chunk dữ liệu chữ phát ra từ LLM
            for await (const chunk of textStream) {
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            }

            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
        } catch (error: any) {
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: error.message });
            } else {
                res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
                res.end();
            }
        }
    };
}