'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, Star, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { sportsList, locationsList } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  sport: string;
  location: string;
  experience: string;
  rating: string;
}

export function SearchFilters({ onSearch, onFilterChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    sport: '',
    location: '',
    experience: '',
    rating: '',
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value === filters[key] ? '' : value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { sport: '', location: '', experience: '', rating: '' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-card border-b border-border sticky top-14 z-30">
      {/* Search Bar */}
      <div className="p-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search coaches..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-muted border-0 rounded-xl"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {/* Sport Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sport</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sportsList.slice(0, 8).map((sport) => (
                <Badge
                  key={sport}
                  variant={filters.sport === sport ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer transition-all",
                    filters.sport === sport && "shadow-sm"
                  )}
                  onClick={() => updateFilter('sport', sport)}
                >
                  {sport}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Location</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {locationsList.slice(0, 6).map((location) => (
                <Badge
                  key={location}
                  variant={filters.location === location ? 'default' : 'outline'}
                  className="cursor-pointer transition-all"
                  onClick={() => updateFilter('location', location)}
                >
                  {location.split(',')[0]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Minimum Rating</span>
            </div>
            <div className="flex gap-2">
              {['4.0', '4.5', '4.8'].map((rating) => (
                <Badge
                  key={rating}
                  variant={filters.rating === rating ? 'default' : 'outline'}
                  className="cursor-pointer transition-all"
                  onClick={() => updateFilter('rating', rating)}
                >
                  {rating}+ ⭐
                </Badge>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full text-muted-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
