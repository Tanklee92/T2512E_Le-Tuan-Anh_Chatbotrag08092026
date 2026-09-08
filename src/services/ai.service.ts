import { LLMProviderInterface } from '../interfaces/llm-provider.interface';
import { RagProductService } from './rag-product.service';

export class AIService {
    constructor(
        private llmProvider: LLMProviderInterface,
        private ragService: RagProductService
    ) {}

    public async streamProductConsultation(userQuery: string): Promise<AsyncIterableIterator<string>> {
        // 1. Truy xuất các sản phẩm liên quan nhất từ tệp JSON (thông qua RAG Service)
        const relevantProducts = await this.ragService.searchRelevantProducts(userQuery, 2);

        // 2. Định dạng danh sách sản phẩm tìm được thành chuỗi văn bản ngữ cảnh
        const contextText = relevantProducts.map(p =>
            `- Tên: ${p.name} | Giá: ${p.price.toLocaleString('vi-VN')} VNĐ | Mô tả: ${p.description}`
        ).join('\n');

        // 3. Đóng gói Prompt chứa quy tắc bảo mật và dữ liệu thực tế
        const augmentedPrompt = `
Bạn là Trợ lý tư vấn bán hàng tự động.
Nhiệm vụ của bạn là trả lời câu hỏi của khách hàng dựa trên thông tin sản phẩm được cung cấp dưới đây.

QUY TẮC BẮT BUỘC:
- CHỈ sử dụng thông tin từ danh sách sản phẩm bên dưới để trả lời.
- Tuyệt đối KHÔNG tự bịa ra sản phẩm, giá cả, hoặc thông số không có trong danh sách.
- Nếu không tìm thấy sản phẩm phù hợp, hãy lịch sự báo cho khách hàng biết cửa hàng hiện chưa có sản phẩm này.

DANH SÁCH SẢN PHẨM PHÙ HỢP TÌM THẤY:
${contextText}

CÂU HỎI CỦA KHÁCH HÀNG:
${userQuery}
`;

        // 4. Trả về luồng dữ liệu Stream từ LLM
        return await this.llmProvider.generateStream(augmentedPrompt);
    }
}