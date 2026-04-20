import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import assetsRouter from './routes/assets';
import requestsRouter from './routes/requests';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/assets', assetsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/users', usersRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});