export type SportLevel = 'school' | 'district' | 'state' | 'national';

export type ReactionType = 'clap' | 'strong' | 'medal';

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
