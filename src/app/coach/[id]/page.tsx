'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AchievementTimeline } from '@/components/profile/AchievementTimeline';
import { mockCoaches } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MessageCircle, 
  Calendar, 
  Star, 
  MapPin, 
  Clock,
  Award,
  Shield
} from 'lucide-react';

export default function CoachProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const coach = mockCoaches.find((c) => c.id === id);

  if (!coach) {
    return (
      <AppLayout title="Coach">
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Coach not found</p>
          <Button variant="soft" className="mt-4" onClick={() => router.push('/discover')}>
            Back to Discovery
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isVerified = coach.verificationStatus === 'verified';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Custom Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="iconSm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Coach Profile</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        <ProfileHeader user={coach} />

        <div className="px-4 py-6 space-y-6">
          {/* Verification Status */}
          {isVerified ? (
            <div className="p-4 bg-success/10 rounded-xl flex items-start gap-3">
              <Shield className="w-6 h-6 text-success flex-shrink-0" />
              <div>
                <p className="font-semibold text-success">Verified Coach</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Credentials and background verified by PlayJosh
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-warning/10 rounded-xl flex items-start gap-3">
              <Clock className="w-6 h-6 text-warning flex-shrink-0" />
              <div>
                <p className="font-semibold text-warning-foreground">Verification Pending</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Coach verification is in progress
                </p>
              </div>
            </div>
          )}

          {/* Certifications */}
          {coach.certifications.length > 0 && (
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {coach.certifications.map((cert, index) => (
                  <Badge key={index} variant="soft">{cert}</Badge>
                ))}
              </div>
            </section>
          )}

          {/* Availability */}
          <section className="bg-card rounded-xl p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Availability
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{coach.availability}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{coach.location}</span>
              </div>
            </div>
          </section>

          {/* Reviews Preview */}
          <section className="bg-card rounded-xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-warning fill-warning" />
                Reviews
              </h3>
              <span className="text-sm text-muted-foreground">
                {coach.reviewsCount} reviews
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-foreground">{coach.rating}</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(coach.rating) 
                        ? 'text-warning fill-warning' 
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Student Achievements */}
          {coach.studentAchievements.length > 0 && (
            <section>
              <h3 className="font-semibold text-foreground mb-4">
                🏆 Student Achievements
              </h3>
              <AchievementTimeline achievements={coach.studentAchievements} />
            </section>
          )}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" size="lg" className="flex-1 gap-2">
            <MessageCircle className="w-5 h-5" />
            Message
          </Button>
          <Button variant="accent" size="lg" className="flex-1 gap-2">
            <Calendar className="w-5 h-5" />
            Request Training
          </Button>
        </div>
      </div>
    </div>
  );
}
