export type UserRole = 'player' | 'coach' | 'parent';

export type SportLevel = 'school' | 'district' | 'state' | 'national';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type ReactionType = 'clap' | 'strong' | 'medal';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  sport: string;
  level?: SportLevel;
  location: string;
  bio?: string;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
}

export interface Player extends User {
  role: 'player';
  ageGroup: string;
  achievements: Achievement[];
  goals: string[];
  profileCompletion: number;
  gallery: string[];
}

export interface Coach extends User {
  role: 'coach';
  experience: number;
  certifications: string[];
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  availability: string;
  studentAchievements: Achievement[];
}

export interface Parent extends User {
  role: 'parent';
  children: string[];
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  level: SportLevel;
  description?: string;
  media?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userSport: string;
  userLevel: SportLevel;
  content: string;
  media?: string;
  type: 'achievement' | 'training' | 'event' | 'journey';
  reactions: {
    clap: number;
    strong: number;
    medal: number;
  };
  userReaction?: ReactionType;
  timestamp: string;
  isVerified?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  sport: string;
  date: string;
  location: string;
  eligibility: string;
  rewards: string[];
  image?: string;
  registrationOpen: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: UserRole;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
