/**
 * TÍNH TRỪU TƯỢNG (ABSTRACTION):
 * Interface định nghĩa các phương thức mà bất kỳ AI Provider nào (Gemini, OpenAI, Claude)
 * cũng bắt buộc phải triển khai.
 */
export interface LLMProviderInterface {
    /**
     * Sinh câu trả lời hoàn chỉnh dạng chuỗi đơn
     * @param prompt Câu hỏi hoặc yêu cầu từ người dùng
     */
    generateResponse(prompt: string): Promise<string>;

    /**
     * Sinh câu trả lời theo luồng dữ liệu thời gian thực (Real-time Stream)
     * @param prompt Câu hỏi hoặc yêu cầu từ người dùng
     * @returns AsyncIterableIterator<string> Luồng các đoạn chữ (chunks) bất đồng bộ
     */
    generateStream(prompt: string): Promise<AsyncIterableIterator<string>>;

    /**
     * Chuyển đổi văn bản thành mảng các con số (Vector Embedding)
     * @param text Đoạn văn bản cần chuyển đổi
     */
    embedText(text: string): Promise<number[]>;
}