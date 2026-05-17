import { Request, Response } from 'express';
import { AppDataSource } from '../db/index.ts';
import { Project, ProjectRequiredSkill, ProjectStatus, Visibility, ProjectType } from '../db/entities.ts';
import { Like, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { search, minBudget, maxBudget } = req.query;
    const projectRepo = AppDataSource.getRepository(Project);

    const query: any = {
      where: {
        status: ProjectStatus.OPEN,
        visibility: Visibility.PUBLIC
      },
      relations: ['client']
    };

    if (search) {
      query.where = [
        { ...query.where, title: Like(`%${search}%`) },
        { ...query.where, description: Like(`%${search}%`) }
      ];
    }

    if (minBudget) {
      if (Array.isArray(query.where)) {
        query.where.forEach((w: any) => w.budgetMin = MoreThanOrEqual(Number(minBudget)));
      } else {
        query.where.budgetMin = MoreThanOrEqual(Number(minBudget));
      }
    }

    if (maxBudget) {
       if (Array.isArray(query.where)) {
        query.where.forEach((w: any) => w.budgetMax = LessThanOrEqual(Number(maxBudget)));
      } else {
        query.where.budgetMax = LessThanOrEqual(Number(maxBudget));
      }
    }

    const results = await projectRepo.find(query);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req: any, res: Response) => {
  try {
    const { title, description, budgetMin, budgetMax, deadline, projectType, visibility, requiredSkills } = req.body;
    const projectRepo = AppDataSource.getRepository(Project);
    
    const newProject = projectRepo.create({
      clientId: req.user.userId,
      title,
      description,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      deadline: deadline ? new Date(deadline) : undefined,
      projectType: projectType as ProjectType,
      visibility: visibility as Visibility,
      status: ProjectStatus.OPEN
    });

    await projectRepo.save(newProject);

    if (requiredSkills && Array.isArray(requiredSkills)) {
      const skillRepo = AppDataSource.getRepository(ProjectRequiredSkill);
      const skillsToSave = requiredSkills.map(skillId => skillRepo.create({
        projectId: newProject.projectId,
        skillId: Number(skillId),
      }));
      await skillRepo.save(skillsToSave);
    }

    res.status(201).json(newProject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectDetail = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectRepo = AppDataSource.getRepository(Project);
    
    const project = await projectRepo.findOne({
      where: { projectId },
      relations: ['client']
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
