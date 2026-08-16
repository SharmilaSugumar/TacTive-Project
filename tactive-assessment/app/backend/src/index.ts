import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { router as chargerRoutes } from './routes/chargers';
import { router as vehicleRoutes } from './routes/vehicles';
import { router as requestRoutes } from './routes/requests';
import { router as authRoutes } from './routes/auth';
import { setupSocket } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.use('/api/chargers', chargerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);

setupSocket(io);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app, httpServer, io };
