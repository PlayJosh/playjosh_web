"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All" },
  { id: "achievement", label: "🏆 Achievements" },
  { id: "training", label: "💪 Training" },
  { id: "event", label: "📅 Events" },
  { id: "journey", label: "🌟 Journeys" },
];

interface FeedFiltersProps {
  onFilterChange?: (filter: string) => void;
}

export function FeedFilters({ onFilterChange }: FeedFiltersProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterChange?.(filterId);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-3 px-4 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterChange(filter.id)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            activeFilter === filter.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
