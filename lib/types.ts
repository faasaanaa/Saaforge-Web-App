import { Timestamp } from 'firebase/firestore';

export type UserRole = 'owner' | 'team';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TeamProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  profilePicture?: string; // Google profile picture URL
  skills: string[];
  interests: string[];
  achievements: string[];
  portfolioLinks: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  visibility: {
    name: boolean;
    role: boolean;
    bio: boolean;
    skills: boolean;
    interests: boolean;
    achievements: boolean;
    portfolioLinks: boolean;
    socialLinks: boolean;
  };
  isPubliclyVisible: boolean;
  isApproved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface JoinRequest {
  id: string;
  userId: string; // User UID who submitted the request
  name: string;
  email: string;
  skills: string[];
  interests: string[];
  achievements: string[];
  reason: string;
  portfolioLinks: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface InviteCode {
  id: string;
  code: string;
  email: string;
  requestId?: string; // Link to join request
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export type ProjectStatus = 'planned' | 'active' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  category?: string;
  techStack: string[];
  status: ProjectStatus;
  isFeatured: boolean;
  isPublished: boolean;
  caseStudy?: string;
  imageUrl?: string;
  coverImage?: string;
  demoUrl?: string;
  githubUrl?: string;
  assignedMembers: string[];
  clientId?: string; // Unique ID for client project feedback validation
  projectType: 'client' | 'company'; // Toggle for client delivered vs company projects
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectFeedback {
  id: string;
  projectId: string;
  projectType: 'client' | 'company';
  userName: string;
  userEmail: string;
  feedback: string;
  suggestions: string;
  rating?: number; // 1-5 stars
  type: 'feedback' | 'improvement'; // Type of submission
  clientId?: string; // Required for client project feedback
  isApproved: boolean; // Owner can approve/reject feedback
  createdAt: Timestamp;
}

export type ServiceType = 'automation' | 'website' | 'custom-software' | 'consulting' | 'other';

export interface Order {
  id: string;
  name: string;
  email: string;
  serviceType: ServiceType;
  description: string;
  budget: string;
  timeline: string;
  status: 'new' | 'reviewing' | 'converted' | 'rejected';
  convertedToProjectId?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  showInTeamDashboard?: boolean;
  createdAt: Timestamp;
}

export interface SiteContent {
  id: string;
  section: 'hero' | 'about' | 'vision' | 'mission' | 'services';
  title?: string;
  content: string;
  order?: number;
  updatedBy: string;
  updatedAt: Timestamp;
}

export type AuditAction = 
  | 'user.created'
  | 'user.deleted'
  | 'team.approved'
  | 'team.rejected'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'order.reviewed'
  | 'invite.created'
  | 'content.updated';

export interface AuditLog {
  id: string;
  action: AuditAction;
  performedBy: string;
  targetId?: string;
  targetType?: string;
  details: Record<string, any>;
  timestamp: Timestamp;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Timestamp;
  isActive: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'team';
  message: string;
  isRead: boolean; // Track if message is read
  readBy?: string[]; // Array of user IDs who read the message
  createdAt: Timestamp;
}

export interface ProjectIdea {
  id: string;
  projectId?: string; // Project ID for which the idea is submitted
  title: string;
  description: string;
  submittedBy: string; // Team member UID
  submitterName: string;
  submitterEmail: string;
  proposedTechStack: string[];
  estimatedDuration?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
export interface Task {
  id: string;
  projectId?: string; // Optional - for project-related tasks
  projectName?: string; // Optional - for project-related tasks
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string; // Team member UID
  assignedToName: string;
  assignedBy: string; // Owner UID
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  grade?: number; // 1-100 score given by owner
  feedback?: string; // Owner's feedback on completed task
  gradedBy?: string;
  gradedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserNotifications {
  id: string;
  userId: string;
  lastViewed: {
    requests?: Timestamp;
    applications?: Timestamp;
    ideas?: Timestamp;
    orders?: Timestamp;
    feedback?: Timestamp;
    projects?: Timestamp;
    tasks?: Timestamp;
    team?: Timestamp;
    content?: Timestamp;
    audit?: Timestamp;
  };
  updatedAt: Timestamp;
}