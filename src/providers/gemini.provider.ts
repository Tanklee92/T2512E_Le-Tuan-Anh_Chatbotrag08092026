import { GoogleGenAI } from '@google/genai';
import { LLMProviderInterface } from '../interfaces/llm-provider.interface';

export class GeminiProvider implements LLMProviderInterface {
    private aiClient: GoogleGenAI;
    private defaultModel = 'gemini-3.6-flash';
    private embeddingModel = 'gemini-embedding-001';

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Chưa cấu hình GEMINI_API_KEY trong file .env');
        }
        this.aiClient = new GoogleGenAI({ apiKey });
    }

    public async generateResponse(prompt: string): Promise<string> {
        const response = await this.aiClient.models.generateContent({
            model: this.defaultModel,
            contents: prompt,
        });
        return response.text || '';
    }

    public async generateStream(prompt: string): Promise<AsyncIterableIterator<string>> {
        const responseStream = await this.aiClient.models.generateContentStream({
            model: this.defaultModel,
            contents: prompt,
        });

        async function* streamGenerator() {
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    yield chunk.text;
                }
            }
        }
        return streamGenerator();
    }

    /**
     * Tạo Vector Embedding sử dụng SDK
     */
    public async embedText(text: string): Promise<number[]> {
        const response = await this.aiClient.models.embedContent({
            model: this.embeddingModel,
            contents: text,
        });

        // @ts-ignore
        return response.embedding?.values || [];
    }
}