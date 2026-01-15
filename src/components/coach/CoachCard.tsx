'use client';

import { Star, MapPin, Users, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { Coach } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CoachCardProps {
  coach: Coach;
}

export function CoachCard({ coach }: CoachCardProps) {
  const router = useRouter();
  const isVerified = coach.verificationStatus === 'verified';

  return (
    <div 
      className="bg-card rounded-2xl card-shadow p-4 animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/coach/${coach.id}`)}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={coach.avatar || '/placeholder.svg'}
            alt={coach.name}
            className="w-20 h-20 rounded-2xl object-cover"
          />
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center ring-2 ring-card verified-glow">
              <CheckCircle className="w-4 h-4 text-success-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground truncate">{coach.name}</h3>
              <p className="text-sm text-primary font-medium">{coach.sport}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-medium text-foreground">{coach.rating}</span>
              <span>({coach.reviewsCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{coach.studentsCount} students</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{coach.location}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={isVerified ? 'verified' : 'pending'}>
              {isVerified ? '✓ Verified' : '⏳ Pending'}
            </Badge>
            <Badge variant="soft">{coach.experience}+ yrs exp</Badge>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button 
        className="w-full mt-4" 
        variant="soft"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/coach/${coach.id}`);
        }}
      >
        View Profile & Request Training
      </Button>
    </div>
  );
}
