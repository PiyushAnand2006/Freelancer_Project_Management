import { Request, Response } from 'express';
import { AppDataSource } from '../db/index.ts';
import { Contract, Milestone, Invoice, MilestoneStatus, InvoiceStatus } from '../db/entities.ts';

export const getContractDetail = async (req: any, res: Response) => {
  try {
    const contractId = parseInt(req.params.id);
    const contractRepo = AppDataSource.getRepository(Contract);
    
    const contract = await contractRepo.findOne({
      where: [
        { contractId, clientId: req.user.userId },
        { contractId, freelancerId: req.user.userId }
      ]
    });

    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMilestone = async (req: any, res: Response) => {
  try {
    const { contractId, title, description, amount, dueDate } = req.body;
    const contractRepo = AppDataSource.getRepository(Contract);
    const milestoneRepo = AppDataSource.getRepository(Milestone);
    
    const contract = await contractRepo.findOne({
      where: { contractId: Number(contractId), clientId: req.user.userId }
    });

    if (!contract) return res.status(403).json({ message: 'Unauthorized' });

    const newMilestone = milestoneRepo.create({
      contractId: Number(contractId),
      title,
      description,
      amount: Number(amount),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: MilestoneStatus.PENDING
    });

    await milestoneRepo.save(newMilestone);

    res.status(201).json(newMilestone);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitMilestone = async (req: any, res: Response) => {
  try {
    const milestoneId = parseInt(req.params.id);
    const milestoneRepo = AppDataSource.getRepository(Milestone);

    const milestone = await milestoneRepo.findOne({
      where: { milestoneId },
    });

    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    milestone.status = MilestoneStatus.SUBMITTED;
    await milestoneRepo.save(milestone);

    res.json({ message: 'Milestone submitted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveMilestone = async (req: any, res: Response) => {
  try {
    const milestoneId = parseInt(req.params.id);

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const milestoneRepo = transactionalEntityManager.getRepository(Milestone);
      const milestone = await milestoneRepo.findOne({
        where: { milestoneId }
      });

      if (!milestone) throw new Error('Milestone not found');

      milestone.status = MilestoneStatus.APPROVED;
      await milestoneRepo.save(milestone);
      
      const contractRepo = transactionalEntityManager.getRepository(Contract);
      const contract = await contractRepo.findOne({
        where: { contractId: milestone.contractId }
      });

      if (!contract) throw new Error('Contract not found');

      // Create invoice automatically
      const invoiceRepo = transactionalEntityManager.getRepository(Invoice);
      const newInvoice = invoiceRepo.create({
        contractId: contract.contractId,
        freelancerId: contract.freelancerId,
        clientId: contract.clientId,
        milestoneId: milestone.milestoneId,
        amount: milestone.amount,
        totalAmount: milestone.amount,
        status: InvoiceStatus.SENT,
      });

      await invoiceRepo.save(newInvoice);

      res.json({ message: 'Milestone approved and invoice generated' });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
