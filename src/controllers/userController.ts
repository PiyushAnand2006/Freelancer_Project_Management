import { Request, Response } from 'express';
import { AppDataSource } from '../db/index.ts';
import { User, FreelancerProfile } from '../db/entities.ts';

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, phone, profilePic, bio, hourlyRate, experienceYears, portfolioUrl, githubUrl, linkedinUrl } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const profileRepo = AppDataSource.getRepository(FreelancerProfile);

    // Update User
    await userRepo.update(req.user.userId, {
      name,
      phone,
      profilePic,
    });

    if (req.user.role === 'freelancer') {
      let profile = await profileRepo.findOne({ where: { userId: req.user.userId } });
      
      if (profile) {
        profile.bio = bio;
        profile.hourlyRate = Number(hourlyRate);
        profile.experienceYears = Number(experienceYears);
        profile.portfolioUrl = portfolioUrl;
        profile.githubUrl = githubUrl;
        profile.linkedinUrl = linkedinUrl;
        await profileRepo.save(profile);
      } else {
        profile = profileRepo.create({
          userId: req.user.userId,
          bio,
          hourlyRate: Number(hourlyRate),
          experienceYears: Number(experienceYears),
          portfolioUrl,
          githubUrl,
          linkedinUrl,
        });
        await profileRepo.save(profile);
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFreelancerDetail = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const userRepo = AppDataSource.getRepository(User);
    
    const freelancer = await userRepo.findOne({
      where: { userId },
      // relations: ['freelancerProfile'] // Add if relation setup in User
    });

    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });
    
    const { passwordHash: _, ...freelancerData } = freelancer;
    res.json(freelancerData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
