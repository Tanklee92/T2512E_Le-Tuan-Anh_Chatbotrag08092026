import fs from 'fs';
import path from 'path';
import { LLMProviderInterface } from '../interfaces/llm-provider.interface';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
}

interface VectorizedProduct extends Product {
    embedding: number[];
}

export class RagProductService {
    private vectorStore: VectorizedProduct[] = [];

    constructor(private llmProvider: LLMProviderInterface) {}

    /**
     * Tải file JSON và tạo Vector Embedding lưu trên RAM khi khởi động
     */
    public async initializeVectorStore(): Promise<void> {
        const filePath = path.join(__dirname, '../data/products.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const products: Product[] = JSON.parse(rawData);

        console.log('[RAG Service] Đang tiến hành Indexing dữ liệu sản phẩm...');

        for (const product of products) {
            // Ghép các thông tin sản phẩm thành một đoạn văn bản thô để tạo Vector
            const textToEmbed = `Tên sản phẩm: ${product.name}. Danh mục: ${product.category}. Giá: ${product.price} VNĐ. Mô tả: ${product.description}`;

            const embedding = await this.llmProvider.embedText(textToEmbed);

            this.vectorStore.push({
                ...product,
                embedding
            });
        }

        console.log(`[RAG Service] Hoàn tất Indexing ${this.vectorStore.length} sản phẩm vào RAM.`);
    }

    /**
     * Tính độ tương đồng Cosine giữa 2 Vector (Cosine Similarity)
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Tìm kiếm các sản phẩm có nội dung liên quan nhất tới câu hỏi của khách hàng
     */
    public async searchRelevantProducts(query: string, topK: number = 2): Promise<Product[]> {
        // 1. Chuyển câu hỏi của người dùng thành Vector
        const queryEmbedding = await this.llmProvider.embedText(query);

        // 2. Tính điểm tương đồng với tất cả sản phẩm trong RAM
        const scoredProducts = this.vectorStore.map((item) => ({
            product: item,
            score: this.cosineSimilarity(queryEmbedding, item.embedding)
        }));

        // 3. Sắp xếp giảm dần theo điểm số và lấy ra Top K sản phẩm phù hợp nhất
        scoredProducts.sort((a, b) => b.score - a.score);

        return scoredProducts.slice(0, topK).map(item => item.product);
    }
}