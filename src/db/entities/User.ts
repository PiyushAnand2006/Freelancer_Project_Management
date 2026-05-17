import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm';

export enum UserRole {
  FREELANCER = 'freelancer',
  CLIENT = 'client',
  ADMIN = 'admin'
}

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

  @Column({
    type: 'varchar2',
    length: 20,
    default: UserRole.CLIENT
  })
  role: UserRole;

  @Column({ type: 'number', precision: 1, default: 0 })
  isVerified: number; // 0 or 1

  @Column({ type: 'number', precision: 1, default: 1 })
  isActive: number; // 0 or 1

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
