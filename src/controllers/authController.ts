import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/index.ts';
import { User, FreelancerProfile, UserRole } from '../db/entities.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, ...freelancerData } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = userRepo.create({
      name,
      email,
      passwordHash,
      role: (role as UserRole) || UserRole.CLIENT,
      isActive: 1,
      isVerified: 0
    });

    await userRepo.save(newUser);

    if (role === 'freelancer') {
      const profileRepo = AppDataSource.getRepository(FreelancerProfile);
      const profile = profileRepo.create({
        userId: newUser.userId,
        bio: freelancerData.bio,
        hourlyRate: freelancerData.hourlyRate,
        experienceYears: freelancerData.experienceYears,
      });
      await profileRepo.save(profile);
    }

    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userResponse } = newUser;
    res.status(201).json({ token, user: userResponse });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userResponse } = user;
    res.json({ token, user: userResponse });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { userId: req.user.userId },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const { passwordHash: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
