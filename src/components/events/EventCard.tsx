'use client';

import { Calendar, MapPin, Trophy, Users, ChevronRight } from 'lucide-react';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  return (
    <div 
      className="bg-card rounded-2xl card-shadow overflow-hidden animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      {/* Image */}
      {event.image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant={event.registrationOpen ? 'verified' : 'secondary'}>
              {event.registrationOpen ? '🟢 Registration Open' : '🔴 Coming Soon'}
            </Badge>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant="softAccent" className="mb-2">{event.sport}</Badge>
            <h3 className="font-semibold text-foreground line-clamp-2">{event.title}</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>

        {/* Details */}
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{event.eligibility}</span>
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Trophy className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-foreground">{event.rewards[0]}</span>
        </div>

        {/* CTA */}
        {event.registrationOpen && (
          <Button 
            className="w-full mt-4" 
            variant="accent"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/events/${event.id}`);
            }}
          >
            Register Now
          </Button>
        )}
      </div>
    </div>
  );
}
