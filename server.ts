import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';

import apiRoutes from './src/routes/index.ts';
import { initializeDatabase, AppDataSource } from './src/db/index.ts';
import { Message, User } from './src/db/entities.ts';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  // Initialize Oracle database
  await initializeDatabase().catch(err => {
    console.error("Failed to initialize Oracle Database:", err);
    console.log("App will stay alive but DB features will fail until connection is fixed.");
  });

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api', apiRoutes);

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('join-contract', (contractId) => {
      socket.join(`contract-${contractId}`);
      console.log(`User ${socket.id} joined contract ${contractId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { contractId, senderId, content } = data;
        
        // Persist to DB using TypeORM
        const messageRepo = AppDataSource.getRepository(Message);
        const newMessage = messageRepo.create({
          contractId: parseInt(contractId),
          senderId: parseInt(senderId),
          content: content,
          sentAt: new Date(),
          isRead: 0
        });
        
        await messageRepo.save(newMessage);

        // Broadcast to specific contract room
        io.to(`contract-${contractId}`).emit('new-message', {
          ...newMessage,
          senderName: data.senderName
        });
      } catch (err) {
        console.error('Socket error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
