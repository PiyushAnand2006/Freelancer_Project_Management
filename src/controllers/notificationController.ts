import { Request, Response } from 'express';
import { AppDataSource } from '../db/index.ts';
import { Notification } from '../db/entities.ts';

export const getNotifications = async (req: any, res: Response) => {
  try {
    const notificationRepo = AppDataSource.getRepository(Notification);
    const results = await notificationRepo.find({
      where: { userId: req.user.userId },
      order: { createdAt: 'DESC' },
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notificationRepo = AppDataSource.getRepository(Notification);
    
    await notificationRepo.update(
      { notificationId, userId: req.user.userId },
      { isRead: 1 }
    );
    res.json({ message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
