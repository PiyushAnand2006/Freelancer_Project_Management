import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
  PrimaryColumn
} from 'typeorm';

// Enums (represented as varchar2 in Oracle)
export enum UserRole { FREELANCER = 'freelancer', CLIENT = 'client', ADMIN = 'admin' }
export enum Availability { AVAILABLE = 'available', BUSY = 'busy', NOT_AVAILABLE = 'not_available' }
export enum Proficiency { BEGINNER = 'beginner', INTERMEDIATE = 'intermediate', EXPERT = 'expert' }
export enum ProjectType { FIXED = 'fixed', HOURLY = 'hourly' }
export enum ProjectStatus { OPEN = 'open', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', CANCELLED = 'cancelled' }
export enum Visibility { PUBLIC = 'public', INVITE_ONLY = 'invite_only' }
export enum ProposalStatus { PENDING = 'pending', ACCEPTED = 'accepted', REJECTED = 'rejected', WITHDRAWN = 'withdrawn' }
export enum ContractStatus { ACTIVE = 'active', PAUSED = 'paused', COMPLETED = 'completed', TERMINATED = 'terminated' }
export enum MilestoneStatus { PENDING = 'pending', SUBMITTED = 'submitted', APPROVED = 'approved', REJECTED = 'rejected' }
export enum InvoiceStatus { DRAFT = 'draft', SENT = 'sent', PAID = 'paid', OVERDUE = 'overdue', CANCELLED = 'cancelled' }
export enum PaymentMethod { UPI = 'UPI', CARD = 'Card', BANK_TRANSFER = 'Bank Transfer', WALLET = 'Wallet' }
export enum PaymentStatus { PENDING = 'pending', SUCCESS = 'success', FAILED = 'failed', REFUNDED = 'refunded' }
export enum DisputeReason { NON_PAYMENT = 'non_payment', POOR_QUALITY = 'poor_quality', SCOPE_CREEP = 'scope_creep', MISCONDUCT = 'misconduct', OTHER = 'other' }
export enum DisputeStatus { OPEN = 'open', UNDER_REVIEW = 'under_review', RESOLVED = 'resolved', CLOSED = 'closed' }
export enum RatingType { CLIENT_TO_FREELANCER = 'client_to_freelancer', FREELANCER_TO_CLIENT = 'freelancer_to_client' }
export enum NotificationType { PROPOSAL = 'proposal', CONTRACT = 'contract', MILESTONE = 'milestone', PAYMENT = 'payment', DISPUTE = 'dispute', SYSTEM = 'system' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar2', length: 100 })
  name: string;

  @Column({ type: 'varchar2', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar2', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar2', length: 15, nullable: true, unique: true })
  phone: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  profilePic: string;

  @Column({ type: 'varchar2', length: 20, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ type: 'number', precision: 1, default: 0 })
  isVerified: number;

  @Column({ type: 'number', precision: 1, default: 1 })
  isActive: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

@Entity('freelancer_profiles')
export class FreelancerProfile {
  @PrimaryGeneratedColumn()
  profileId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'clob', nullable: true })
  bio: string;

  @Column({ type: 'number', precision: 8, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'number', default: 0 })
  experienceYears: number;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  portfolioUrl: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  githubUrl: string;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  linkedinUrl: string;

  @Column({ type: 'varchar2', length: 20, default: Availability.AVAILABLE })
  availability: Availability;

  @Column({ type: 'number', precision: 12, scale: 2, default: 0 })
  totalEarned: number;

  @Column({ type: 'number', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ type: 'number', default: 0 })
  totalProjects: number;
}

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  skillId: number;

  @Column({ type: 'varchar2', length: 80, unique: true })
  name: string;

  @Column({ type: 'varchar2', length: 80, nullable: true })
  category: string;
}

@Entity('freelancer_skills')
@Unique(['userId', 'skillId'])
export class FreelancerSkill {
  @PrimaryGeneratedColumn()
  freelancerSkillId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'skill_id', type: 'int' })
  skillId: number;

  @Column({ type: 'varchar2', length: 20, default: Proficiency.INTERMEDIATE })
  proficiency: Proficiency;
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  projectId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'client_id', type: 'int' })
  clientId: number;

  @Column({ type: 'varchar2', length: 150 })
  title: string;

  @Column({ type: 'clob' })
  description: string;

  @Column({ type: 'number', precision: 10, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ type: 'number', precision: 10, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'varchar2', length: 20 })
  projectType: ProjectType;

  @Column({ type: 'varchar2', length: 20, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  @Column({ type: 'varchar2', length: 20, default: Visibility.PUBLIC })
  visibility: Visibility;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

@Entity('proposals')
@Unique(['projectId', 'freelancerId'])
export class Proposal {
  @PrimaryGeneratedColumn()
  proposalId: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId: number;

  @Column({ name: 'freelancer_id', type: 'int' })
  freelancerId: number;

  @Column({ type: 'clob' })
  coverLetter: string;

  @Column({ type: 'number', precision: 10, scale: 2 })
  bidAmount: number;

  @Column({ type: 'number', nullable: true })
  estimatedDays: number;

  @Column({ type: 'varchar2', length: 20, default: ProposalStatus.PENDING })
  status: ProposalStatus;

  @CreateDateColumn({ type: 'timestamp' })
  submittedAt: Date;
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  contractId: number;

  @Column({ name: 'proposal_id', type: 'int', unique: true })
  proposalId: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId: number;

  @Column({ name: 'client_id', type: 'int' })
  clientId: number;

  @Column({ name: 'freelancer_id', type: 'int' })
  freelancerId: number;

  @Column({ type: 'number', precision: 10, scale: 2 })
  agreedAmount: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar2', length: 20, default: ContractStatus.ACTIVE })
  status: ContractStatus;

  @Column({ type: 'clob', nullable: true })
  terms: string;

  @CreateDateColumn({ type: 'timestamp' })
  signedAt: Date;
}

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn()
  milestoneId: number;

  @Column({ name: 'contract_id', type: 'int' })
  contractId: number;

  @Column({ type: 'varchar2', length: 150 })
  title: string;

  @Column({ type: 'clob', nullable: true })
  description: string;

  @Column({ type: 'number', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar2', length: 20, default: MilestoneStatus.PENDING })
  status: MilestoneStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

@Entity('deliverables')
export class Deliverable {
  @PrimaryGeneratedColumn()
  deliverableId: number;

  @Column({ name: 'milestone_id', type: 'int' })
  milestoneId: number;

  @Column({ type: 'varchar2', length: 255, nullable: true })
  fileUrl: string;

  @Column({ type: 'clob', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  submittedAt: Date;
}

@Entity('time_logs')
export class TimeLog {
  @PrimaryGeneratedColumn()
  logId: number;

  @Column({ name: 'contract_id', type: 'int' })
  contractId: number;

  @Column({ name: 'freelancer_id', type: 'int' })
  freelancerId: number;

  @Column({ name: 'milestone_id', type: 'int', nullable: true })
  milestoneId: number;

  @Column({ type: 'number', precision: 5, scale: 2 })
  hoursWorked: number;

  @Column({ type: 'date' })
  logDate: Date;

  @Column({ type: 'clob', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  loggedAt: Date;
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  invoiceId: number;

  @Column({ name: 'contract_id', type: 'int' })
  contractId: number;

  @Column({ name: 'freelancer_id', type: 'int' })
  freelancerId: number;

  @Column({ name: 'client_id', type: 'int' })
  clientId: number;

  @Column({ name: 'milestone_id', type: 'int', nullable: true })
  milestoneId: number;

  @Column({ type: 'number', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'number', precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column({ type: 'number', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar2', length: 20, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @CreateDateColumn({ type: 'timestamp' })
  issuedAt: Date;
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  paymentId: number;

  @Column({ name: 'invoice_id', type: 'int', unique: true })
  invoiceId: number;

  @Column({ name: 'payer_id', type: 'int' })
  payerId: number;

  @Column({ name: 'payee_id', type: 'int' })
  payeeId: number;

  @Column({ type: 'number', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ type: 'varchar2', length: 20 })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar2', length: 20, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar2', length: 100, nullable: true, unique: true })
  transactionId: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;
}

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn()
  disputeId: number;

  @Column({ name: 'contract_id', type: 'int' })
  contractId: number;

  @Column({ name: 'raised_by', type: 'int' })
  raisedBy: number;

  @Column({ name: 'against_user', type: 'int' })
  againstUser: number;

  @Column({ type: 'varchar2', length: 30 })
  reason: DisputeReason;

  @Column({ type: 'clob' })
  description: string;

  @Column({ type: 'varchar2', length: 20, default: DisputeStatus.OPEN })
  status: DisputeStatus;

  @Column({ type: 'clob', nullable: true })
  resolution: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;
}

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  ratingId: number;

  @Column({ name: 'contract_id', type: 'int' })
  contractId: number;

  @Column({ name: 'rated_by', type: 'int' })
  ratedBy: number;

  @Column({ name: 'rated_to', type: 'int' })
  ratedTo: number;

  @Column({ type: 'number' })
  rating: number;

  @Column({ type: 'clob', nullable: true })
  review: string;

  @Column({ type: 'varchar2', length: 30 })
  ratingType: RatingType;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

@Entity('project_required_skills')
export class ProjectRequiredSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', type: 'int' })
  projectId: number;

  @Column({ name: 'skill_id', type: 'int' })
  skillId: number;
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'varchar2', length: 120 })
  title: string;

  @Column({ type: 'clob' })
  message: string;

  @Column({ type: 'varchar2', length: 20, nullable: true })
  type: NotificationType;

  @Column({ type: 'number', precision: 1, default: 0 })
  isRead: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number;

  @Column({ name: 'contract_id', type: 'int', nullable: true })
  contractId: number;

  @Column({ name: 'sender_id', type: 'int' })
  senderId: number;

  @Column({ name: 'receiver_id', type: 'int' })
  receiverId: number;

  @Column({ type: 'clob' })
  content: string;

  @Column({ type: 'number', precision: 1, default: 0 })
  isRead: number;

  @CreateDateColumn({ type: 'timestamp' })
  sentAt: Date;
}
