'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EventCard } from '@/components/events/EventCard';
import { mockEvents } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'all', label: 'All Events' },
  { id: 'open', label: 'Open Now' },
  { id: 'coming', label: 'Coming Soon' },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredEvents = mockEvents.filter((event) => {
    if (activeTab === 'open') return event.registrationOpen;
    if (activeTab === 'coming') return !event.registrationOpen;
    return true;
  });

  return (
    <AppLayout title="Events">
      {/* Tabs */}
      <div className="bg-card border-b border-border sticky top-14 z-30">
        <div className="flex items-center gap-2 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Header section */}
        <div className="mb-6">
          <Badge variant="softAccent" className="mb-2">PlayJosh Events</Badge>
          <h2 className="text-xl font-bold text-foreground">
            Compete. Shine. Get Recognized.
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Official tournaments and championships organized by PlayJosh
          </p>
        </div>

        {/* Events list */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events in this category</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
