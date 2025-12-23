// export type UserSport = {
//   email: string
//   sport: string
// }

// export type Profile = {
//   email: string;
//   full_name: string;
//   role: 'player' | 'coach' | 'fan' | null;
//   bio: string | null;
//   location: string | null;
//   portfolio: string | null;
//   sports: string[];
//   profile_photo: string | null;
//   onboarding_status: 'not_started' | 'step1_completed' | 'step2_completed' | 'completed';
//   created_at: string;
//   updated_at: string;
// }

// export interface Database {
//   public: {
//     Tables: {
//       profiles: {
//         Row: Profile;
//         Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
//           created_at?: string;
//           updated_at?: string;
//         };
//         Update: Partial<Omit<Profile, 'email' | 'created_at'>> & {
//           updated_at?: string;
//         };
//       };
//       user_sports: {
//         Row: UserSport;
//         Insert: UserSport;
//         Update: Partial<UserSport>;
//       };
//     };
//   };
// }
// // Export the types for convenience
// export type Tables = Database['public']['Tables']
// export type TableName = keyof Tables
// export type TableRow<T extends TableName> = Tables[T]['Row']
// export type TableInsert<T extends TableName> = Tables[T]['Insert']
// export type TableUpdate<T extends TableName> = Tables[T]['Update']

export type Profile = {
  email: string; // 🔥 PRIMARY KEY
  full_name: string;
  age: number | null; // Added age field

  role: 'player' | 'coach' | 'fan' | null;
  bio: string | null;
  location: string | null;
  portfolio: string | null;
  sports: string[];

  profile_photo: string | null;
  onboarding_status:
    | 'not_started'
    | 'step1_completed'
    | 'step2_completed'
    | 'completed';

  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;

        // 🔥 PK (email) MUST be required
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };

        // 🔥 PK should NOT be updated
        Update: Partial<Omit<Profile, 'email' | 'created_at'>> & {
          updated_at?: string;
        };
      };
    };

  
  };
}

// helpers (optional)
export type Tables = Database['public']['Tables'];
export type TableRow<T extends keyof Tables> = Tables[T]['Row'];
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert'];
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update'];
