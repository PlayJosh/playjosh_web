'use client';

import { Trophy, Medal, Award, Star } from 'lucide-react';
import { Achievement, SportLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AchievementTimelineProps {
  achievements?: Achievement[];
}

const levelIcons: Record<SportLevel, typeof Trophy> = {
  school: Award,
  district: Medal,
  state: Trophy,
  national: Star,
};

const levelColors: Record<SportLevel, string> = {
  school: 'bg-level-school',
  district: 'bg-level-district',
  state: 'bg-level-state',
  national: 'bg-level-national',
};

export function AchievementTimeline({ achievements = [] }: AchievementTimelineProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No achievements yet</p>
        <p className="text-sm text-muted-foreground mt-1">Keep training and your first achievement will shine here!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-border" />

      <div className="space-y-4">
        {achievements.map((achievement, index) => {
          const Icon = levelIcons[achievement.level];
          
          return (
            <div 
              key={achievement.id}
              className="relative pl-12 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "absolute left-2 w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-background",
                levelColors[achievement.level]
              )}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Content */}
              <div className="bg-card rounded-xl p-4 card-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{achievement.date}</p>
                  </div>
                  <Badge variant={achievement.level}>
                    {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                  </Badge>
                </div>
                {achievement.description && (
                  <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
