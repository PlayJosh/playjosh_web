export type ProfileStep1 = {
  email: string
  full_name: string
  role: 'player' | 'coach' | 'fan' | null
  profile_photo: string | null
  onboarding_complete?: boolean
}

export type UserSport = {
  email: string
  sport: string
}

export type ProfileStep2 = {
  email: string;
  bio: string;
  location: string;
  portfolio: string;
  created_at?: string;
};

export type Profile = {
  id: string;
  email: string;
  sports: string[];
  profile_photo: string | null;
  onboarding_complete: boolean;
  created_at?: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles_step2: {
        Row: ProfileStep2;
        Insert: Omit<ProfileStep2, 'created_at'>;
        Update: Partial<Omit<ProfileStep2, 'email' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      user_sports: {
        Row: UserSport;
        Insert: UserSport;
        Update: Partial<UserSport>;
      };
    };
  };
}