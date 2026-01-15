'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchFilters, FilterState } from '@/components/discover/SearchFilters';
import { CoachCard } from '@/components/coach/CoachCard';
import { mockCoaches } from '@/data/mockData';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    sport: '',
    location: '',
    experience: '',
    rating: '',
  });

  const filteredCoaches = useMemo(() => {
    return mockCoaches.filter((coach) => {
      // Search query
      if (searchQuery && !coach.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Sport filter
      if (filters.sport && coach.sport !== filters.sport) {
        return false;
      }

      // Location filter
      if (filters.location && !coach.location.includes(filters.location.split(',')[0])) {
        return false;
      }

      // Rating filter
      if (filters.rating && coach.rating < parseFloat(filters.rating)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Sort verified coaches first
  const sortedCoaches = useMemo(() => {
    return [...filteredCoaches].sort((a, b) => {
      if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
      if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
      return b.rating - a.rating;
    });
  }, [filteredCoaches]);

  return (
    <AppLayout title="Find Coaches">
      <SearchFilters 
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
      />

      <div className="px-4 py-4">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {sortedCoaches.length} coach{sortedCoaches.length !== 1 ? 'es' : ''} found
          </p>
          <p className="text-xs text-success font-medium">
            ✓ Verified coaches shown first
          </p>
        </div>

        {/* Coaches list */}
        <div className="space-y-4">
          {sortedCoaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}

          {sortedCoaches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No coaches found matching your criteria</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
