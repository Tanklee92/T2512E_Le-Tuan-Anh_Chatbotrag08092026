import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import cors from 'cors';
import aiRouter from './routes/ai.route';


const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Đăng ký Router AI
app.use('/api/v1/ai', aiRouter);

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🔗 AI Stream Endpoint: POST http://localhost:${PORT}/api/v1/ai/stream`);
});