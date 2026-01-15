'use client';

import { Settings, Share2, CheckCircle, Edit2 } from 'lucide-react';
import { Player, Coach, SportLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProfileHeaderProps {
  user: Player | Coach;
  isOwnProfile?: boolean;
}

const levelLabels: Record<SportLevel, string> = {
  school: 'School Level',
  district: 'District Level',
  state: 'State Level',
  national: 'National Level',
};

export function ProfileHeader({ user, isOwnProfile = false }: ProfileHeaderProps) {
  const isPlayer = user.role === 'player';
  const player = isPlayer ? user as Player : null;
  const coach = !isPlayer ? user as Coach : null;
  const isVerified = user.isVerified || user.verificationStatus === 'verified';

  return (
    <div className="bg-card rounded-b-3xl card-shadow overflow-hidden">
      {/* Cover Gradient */}
      <div className="h-24 hero-gradient relative">
        {isOwnProfile && (
          <Button 
            variant="ghost" 
            size="iconSm" 
            className="absolute top-3 right-3 bg-card/20 backdrop-blur-sm hover:bg-card/40"
          >
            <Settings className="w-5 h-5 text-primary-foreground" />
          </Button>
        )}
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-6">
        {/* Avatar */}
        <div className="relative -mt-14 mb-4">
          <div className="relative inline-block">
            <img
              src={user.avatar || '/placeholder.svg'}
              alt={user.name}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-card shadow-lg"
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center ring-4 ring-card verified-glow">
                <CheckCircle className="w-5 h-5 text-success-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Name & Role */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-primary font-medium">{user.sport}</span>
              {player?.level && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant={player.level}>
                    {levelLabels[player.level]}
                  </Badge>
                </>
              )}
              {coach && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant={isVerified ? 'verified' : 'pending'}>
                    {isVerified ? 'Verified Coach' : 'Pending Verification'}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{user.location}</p>
          </div>

          {isOwnProfile ? (
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <Button variant="ghost" size="iconSm">
              <Share2 className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-foreground mt-4 leading-relaxed">{user.bio}</p>
        )}

        {/* Profile Completion (for players) */}
        {isPlayer && player && isOwnProfile && (
          <div className="mt-4 p-3 bg-muted rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Profile Completion</span>
              <span className="text-sm font-bold text-primary">{player.profileCompletion}%</span>
            </div>
            <Progress value={player.profileCompletion} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Complete your profile to get discovered by coaches and sponsors
            </p>
          </div>
        )}

        {/* Coach Stats */}
        {coach && (
          <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-muted rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{coach.experience}+</p>
              <p className="text-xs text-muted-foreground">Years Exp</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-foreground">{coach.studentsCount}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{coach.rating}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        )}

        {/* Player Stats */}
        {player && (
          <div className="flex items-center gap-3 mt-4">
            <Badge variant="soft" className="flex-1 justify-center py-2">
              <span className="font-medium">{player.ageGroup}</span>
            </Badge>
            <Badge variant="softAccent" className="flex-1 justify-center py-2">
              <span className="font-medium">{player.achievements.length} Achievements</span>
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
