import { Request, Response } from 'express';
import { AppDataSource } from '../db/index.ts';
import { Message } from '../db/entities.ts';

export const getChatHistory = async (req: any, res: Response) => {
  try {
    const contractId = parseInt(req.params.contractId);
    const messageRepo = AppDataSource.getRepository(Message);
    
    const results = await messageRepo.find({
      where: { contractId },
      order: { sentAt: 'DESC' },
      take: 50
    });
    
    res.json(results.reverse());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
