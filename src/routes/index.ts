import { Router } from 'express';
import * as authController from '../controllers/authController.ts';
import * as projectController from '../controllers/projectController.ts';
import * as proposalController from '../controllers/proposalController.ts';
import * as contractController from '../controllers/contractController.ts';
import * as userController from '../controllers/userController.ts';
import * as notificationController from '../controllers/notificationController.ts';
import * as messageController from '../controllers/messageController.ts';
import { verifyToken, roleGuard } from '../middleware/auth.ts';

const router = Router();

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', verifyToken, authController.getMe);

// Projects
router.get('/projects', projectController.getProjects);
router.post('/projects', verifyToken, roleGuard('client'), projectController.createProject);
router.get('/projects/:id', projectController.getProjectDetail);

// Proposals
router.post('/proposals', verifyToken, roleGuard('freelancer'), proposalController.submitProposal);
router.get('/proposals/project/:id', verifyToken, roleGuard('client'), proposalController.getProjectProposals);
router.put('/proposals/:id/accept', verifyToken, roleGuard('client'), proposalController.acceptProposal);

// Contracts & Milestones
router.get('/contracts/:id', verifyToken, contractController.getContractDetail);
router.post('/milestones', verifyToken, roleGuard('client'), contractController.createMilestone);
router.put('/milestones/:id/submit', verifyToken, roleGuard('freelancer'), contractController.submitMilestone);
router.put('/milestones/:id/approve', verifyToken, roleGuard('client'), contractController.approveMilestone);

// Profiles
router.put('/users/profile', verifyToken, userController.updateProfile);
router.get('/users/freelancer/:id', userController.getFreelancerDetail);

// Notifications
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.put('/notifications/:id/read', verifyToken, notificationController.markAsRead);

// Messages
router.get('/messages/:contractId', verifyToken, messageController.getChatHistory);

export default router;
