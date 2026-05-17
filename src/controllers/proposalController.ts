import { Request, Response } from 'express';
import { AppDataSource } from '../db/index.ts';
import { Proposal, Contract, Project, ProposalStatus, ContractStatus, ProjectStatus } from '../db/entities.ts';

export const submitProposal = async (req: any, res: Response) => {
  try {
    const { projectId, coverLetter, bidAmount, estimatedDays } = req.body;
    const proposalRepo = AppDataSource.getRepository(Proposal);
    
    const newProposal = proposalRepo.create({
      projectId: Number(projectId),
      freelancerId: req.user.userId,
      coverLetter,
      bidAmount: Number(bidAmount),
      estimatedDays: Number(estimatedDays),
      status: ProposalStatus.PENDING
    });

    await proposalRepo.save(newProposal);

    res.status(201).json(newProposal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectProposals = async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectRepo = AppDataSource.getRepository(Project);
    const proposalRepo = AppDataSource.getRepository(Proposal);
    
    const project = await projectRepo.findOne({
      where: { projectId: projectId, clientId: req.user.userId }
    });

    if (!project) return res.status(403).json({ message: 'Unauthorized' });

    const results = await proposalRepo.find({
      where: { projectId: projectId },
    });

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptProposal = async (req: any, res: Response) => {
  try {
    const proposalId = parseInt(req.params.id);
    const proposalRepo = AppDataSource.getRepository(Proposal);
    
    const proposal = await proposalRepo.findOne({
      where: { proposalId },
    });

    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      // 1. Accept this proposal
      proposal.status = ProposalStatus.ACCEPTED;
      await transactionalEntityManager.save(proposal);
      
      const projectRepo = transactionalEntityManager.getRepository(Project);
      const project = await projectRepo.findOne({
        where: { projectId: proposal.projectId }
      });

      if (!project) throw new Error('Project not found');

      // 2. Create contract
      const contractRepo = transactionalEntityManager.getRepository(Contract);
      const newContract = contractRepo.create({
        proposalId: proposal.proposalId,
        projectId: proposal.projectId,
        clientId: project.clientId,
        freelancerId: proposal.freelancerId,
        agreedAmount: proposal.bidAmount,
        startDate: new Date(), 
        status: ContractStatus.ACTIVE,
      });

      await contractRepo.save(newContract);

      // 3. Reject other proposals
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Proposal)
        .set({ status: ProposalStatus.REJECTED })
        .where("project_id = :projectId AND status = :status", { 
          projectId: proposal.projectId, 
          status: ProposalStatus.PENDING 
        })
        .execute();

      // 4. Update project status
      project.status = ProjectStatus.IN_PROGRESS;
      await transactionalEntityManager.save(project);

      res.json({ message: 'Proposal accepted and contract created', contract: newContract });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
