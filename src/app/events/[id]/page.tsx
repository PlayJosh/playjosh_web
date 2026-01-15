'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockEvents } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy,
  Share2,
  CheckCircle
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-4 text-center">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="soft" className="mt-4" onClick={() => router.push('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Image */}
      <div className="relative">
        {event.image && (
          <div className="h-64 overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="iconSm" 
            className="bg-card/80 backdrop-blur-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="iconSm" 
            className="bg-card/80 backdrop-blur-sm"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-16 relative z-10 max-w-lg mx-auto">
        {/* Title Card */}
        <div className="bg-card rounded-2xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={event.registrationOpen ? 'verified' : 'secondary'}>
              {event.registrationOpen ? '🟢 Registration Open' : '🔴 Coming Soon'}
            </Badge>
            <Badge variant="softAccent">{event.sport}</Badge>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">{event.title}</h1>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span>{event.eligibility}</span>
            </div>
          </div>
        </div>

        {/* About */}
        <section className="mt-6">
          <h3 className="font-semibold text-foreground mb-3">About</h3>
          <p className="text-muted-foreground leading-relaxed">{event.description}</p>
        </section>

        {/* Rewards */}
        <section className="mt-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Rewards & Prizes
          </h3>
          <div className="bg-card rounded-xl p-4 card-shadow space-y-3">
            {event.rewards.map((reward, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-foreground">{reward}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility */}
        <section className="mt-6">
          <h3 className="font-semibold text-foreground mb-3">Eligibility</h3>
          <div className="bg-muted rounded-xl p-4">
            <p className="text-foreground">{event.eligibility}</p>
          </div>
        </section>
      </div>

      {/* Fixed Bottom CTA */}
      {event.registrationOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
          <div className="max-w-lg mx-auto">
            <Button variant="accent" size="xl" className="w-full">
              Register Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
